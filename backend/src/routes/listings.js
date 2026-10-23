const express = require('express');
const pool = require('../db');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const CONDITIONS = ['like new', 'good', 'fair'];

// Shared SELECT for list-style responses (includes the first image).
const LIST_SELECT = `
  SELECT l.id, l.title, l.description, l.price, l.item_condition, l.era, l.status,
         l.category_id, c.name AS category_name,
         (SELECT i.url FROM listing_images i WHERE i.listing_id = l.id ORDER BY i.id LIMIT 1) AS image_url,
         l.created_at
  FROM listings l
  JOIN categories c ON c.id = l.category_id`;

// GET /listings?category=&era=&q=&min_price=&max_price=   -> LIVE listings only
// category can be a category id (2) or a name ("shoes")
router.get('/', async (req, res) => {
  const where = [`l.status = 'live'`];
  const params = [];

  const { category, era, q, min_price, max_price } = req.query;

  if (category) {
    params.push(category);
    where.push(/^\d+$/.test(category)
      ? `l.category_id = $${params.length}`
      : `c.name ILIKE $${params.length}`);
  }
  if (era) {
    params.push(era);
    where.push(`lower(l.era) = lower($${params.length})`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`);
  }
  for (const [name, op, val] of [['min_price', '>=', min_price], ['max_price', '<=', max_price]]) {
    if (val !== undefined && val !== '') {
      if (!/^\d+$/.test(val)) return res.status(400).json({ error: `${name} must be a whole number` });
      params.push(Number(val));
      where.push(`l.price ${op} $${params.length}`);
    }
  }

  const { rows } = await pool.query(
    `${LIST_SELECT} WHERE ${where.join(' AND ')} ORDER BY l.created_at DESC, l.id DESC`,
    params
  );
  res.json(rows);
});

// GET /listings/mine  (seller's own listings, any status)
// NOTE: not in the original contract. Needed for the seller dashboard. Must stay ABOVE /:id.
router.get('/mine', requireAuth, requireRole('seller'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.*, (SELECT r.reason FROM listing_reviews r WHERE r.listing_id = s.id
                  ORDER BY r.reviewed_at DESC, r.id DESC LIMIT 1) AS review_reason
     FROM (${LIST_SELECT} WHERE l.seller_id = $1) s
     ORDER BY s.created_at DESC, s.id DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// GET /listings/:id  -> listing + images + seller name
// live/sold are public. pending/rejected/changes_requested only for the owner or an admin.
router.get('/:id', optionalAuth, async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid listing id' });

  const { rows } = await pool.query(
    `SELECT l.id, l.title, l.description, l.price, l.item_condition, l.era, l.status,
            l.category_id, c.name AS category_name, l.seller_id, u.name AS seller_name, l.created_at
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.seller_id
     WHERE l.id = $1`,
    [req.params.id]
  );
  const listing = rows[0];

  const isPublic = listing && ['live', 'sold'].includes(listing.status);
  const canSee = listing && (isPublic || req.user?.role === 'admin' || req.user?.id === listing.seller_id);
  if (!canSee) return res.status(404).json({ error: 'Listing not found' });

  const images = await pool.query(
    'SELECT id, url FROM listing_images WHERE listing_id = $1 ORDER BY id',
    [listing.id]
  );
  res.json({ ...listing, images: images.rows });
});

// POST /listings  (seller) -> creates a 'pending' listing
// body: { title, description, price, category_id, item_condition, era, image_urls[] }
router.post('/', requireAuth, requireRole('seller'), async (req, res) => {
  const { title, description, era, category_id, item_condition, image_urls } = req.body || {};
  const price = req.body?.price;

  if (!title || !String(title).trim()) return res.status(400).json({ error: 'title is required' });
  if (!Number.isInteger(price) || price <= 0) {
    return res.status(400).json({ error: 'price must be a whole number greater than 0' });
  }
  if (!Number.isInteger(category_id)) return res.status(400).json({ error: 'category_id is required' });
  if (!CONDITIONS.includes(item_condition)) {
    return res.status(400).json({ error: `item_condition must be one of: ${CONDITIONS.join(', ')}` });
  }
  if (!Array.isArray(image_urls) || image_urls.length === 0 ||
      !image_urls.every(u => typeof u === 'string' && /^https?:\/\//.test(u))) {
    return res.status(400).json({ error: 'image_urls must be a non-empty array of http(s) URLs' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO listings (seller_id, category_id, title, description, price, item_condition, era)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, seller_id, category_id, title, description, price, item_condition, era, status, created_at`,
      [req.user.id, category_id, String(title).trim(), description || null, price, item_condition, era || null]
    );
    const listing = rows[0];
    for (const url of image_urls) {
      await client.query('INSERT INTO listing_images (listing_id, url) VALUES ($1, $2)', [listing.id, url]);
    }
    await client.query('COMMIT');
    res.status(201).json({ ...listing, image_urls });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503') return res.status(400).json({ error: 'category_id does not exist' });
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
