const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('buyer'));

// Returns { items: [...], total } for the logged-in buyer. total counts only items that are still live.
async function loadCart(userId) {
  const { rows } = await pool.query(
    `SELECT l.id AS listing_id, l.title, l.price, l.status,
            (SELECT i.url FROM listing_images i WHERE i.listing_id = l.id ORDER BY i.id LIMIT 1) AS image_url
     FROM cart_items ci
     JOIN listings l ON l.id = ci.listing_id
     WHERE ci.user_id = $1
     ORDER BY ci.id`,
    [userId]
  );
  const total = rows.filter(r => r.status === 'live').reduce((sum, r) => sum + r.price, 0);
  return { items: rows, total };
}

// GET /cart
router.get('/', async (req, res) => {
  res.json(await loadCart(req.user.id));
});

// POST /cart  { listing_id }   (adding the same item twice is harmless)
router.post('/', async (req, res) => {
  const listingId = req.body?.listing_id;
  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ error: 'listing_id must be a listing id (number)' });
  }
  const { rows } = await pool.query('SELECT status FROM listings WHERE id = $1', [listingId]);
  if (!rows[0]) return res.status(404).json({ error: 'Listing not found' });
  if (rows[0].status !== 'live') {
    return res.status(409).json({ error: rows[0].status === 'sold' ? 'Item already sold' : 'Item is not available' });
  }
  await pool.query(
    'INSERT INTO cart_items (user_id, listing_id) VALUES ($1, $2) ON CONFLICT (user_id, listing_id) DO NOTHING',
    [req.user.id, listingId]
  );
  res.status(201).json(await loadCart(req.user.id));
});

// DELETE /cart/:listing_id
router.delete('/:listing_id', async (req, res) => {
  if (!/^\d+$/.test(req.params.listing_id)) return res.status(400).json({ error: 'Invalid listing id' });
  await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND listing_id = $2',
    [req.user.id, Number(req.params.listing_id)]);
  res.json(await loadCart(req.user.id));
});

module.exports = router;
