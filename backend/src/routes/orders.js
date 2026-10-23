const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('buyer'));

// POST /orders  { address, listing_ids?: [3, 6] }   (if listing_ids is left out, the buyer's cart is checked out)
// Mock checkout: ONE transaction that checks every item is still live, creates the order as 'paid',
// and marks the listings 'sold'. If anything is not live, nothing changes and we return 409.
router.post('/', async (req, res) => {
  let listing_ids = req.body?.listing_ids;
  const address = String(req.body?.address || '').trim();

  if (!address) return res.status(400).json({ error: 'address is required' });

  if (listing_ids === undefined) {
    const cart = await pool.query('SELECT listing_id FROM cart_items WHERE user_id = $1 ORDER BY id', [req.user.id]);
    listing_ids = cart.rows.map(r => r.listing_id);
    if (listing_ids.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  } else if (!Array.isArray(listing_ids) || listing_ids.length === 0 ||
             !listing_ids.every(n => Number.isInteger(n) && n > 0)) {
    return res.status(400).json({ error: 'listing_ids must be a non-empty array of listing ids' });
  }

  const ids = [...new Set(listing_ids)].sort((a, b) => a - b); // sorted so concurrent checkouts lock in the same order
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FOR UPDATE locks these rows until COMMIT/ROLLBACK. A second buyer's checkout waits here,
    // then sees status = 'sold' and fails. That is what stops double-selling.
    const { rows } = await client.query(
      'SELECT id, title, price, status FROM listings WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
      [ids]
    );
    if (rows.length !== ids.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'One or more listings not found' });
    }
    const unavailable = rows.filter(r => r.status !== 'live');
    if (unavailable.length) {
      await client.query('ROLLBACK');
      const anySold = unavailable.some(r => r.status === 'sold');
      return res.status(409).json({
        error: anySold ? 'Item already sold' : 'Item is not available',
        listing_ids: unavailable.map(r => r.id),
      });
    }

    const total = rows.reduce((sum, r) => sum + r.price, 0);
    const order = (await client.query(
      `INSERT INTO orders (buyer_id, total, status, address)
       VALUES ($1, $2, 'paid', $3) RETURNING id, buyer_id, total, status, address, created_at`,
      [req.user.id, total, address]
    )).rows[0];

    for (const r of rows) {
      await client.query('INSERT INTO order_items (order_id, listing_id, price) VALUES ($1, $2, $3)',
        [order.id, r.id, r.price]);
    }
    await client.query(`UPDATE listings SET status = 'sold' WHERE id = ANY($1::int[])`, [ids]);
    // sold items disappear from everyone's cart
    await client.query('DELETE FROM cart_items WHERE listing_id = ANY($1::int[])', [ids]);

    await client.query('COMMIT');
    res.status(201).json({
      ...order,
      items: rows.map(r => ({ listing_id: r.id, title: r.title, price: r.price })),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    // order_items.listing_id is unique: if it ever fires, an item was sold twice
    if (err.code === '23505') return res.status(409).json({ error: 'Item already sold' });
    throw err;
  } finally {
    client.release();
  }
});

// GET /orders/mine
router.get('/mine', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.total, o.status, o.address, o.created_at,
            COALESCE((SELECT json_agg(json_build_object(
                        'listing_id', oi.listing_id, 'title', l.title, 'price', oi.price,
                        'image_url', (SELECT i.url FROM listing_images i WHERE i.listing_id = l.id ORDER BY i.id LIMIT 1))
                      ORDER BY oi.id)
                      FROM order_items oi JOIN listings l ON l.id = oi.listing_id
                      WHERE oi.order_id = o.id), '[]'::json) AS items
     FROM orders o
     WHERE o.buyer_id = $1
     ORDER BY o.created_at DESC, o.id DESC`,
    [req.user.id]
  );
  res.json(rows);
});

module.exports = router;
