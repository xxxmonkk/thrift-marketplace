const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

const STATUSES = ['pending', 'live', 'rejected', 'changes_requested', 'sold'];
const DECISIONS = { approved: 'live', rejected: 'rejected', changes_requested: 'changes_requested' };

// GET /admin/listings?status=pending  (default: pending)
router.get('/listings', async (req, res) => {
  const status = req.query.status || 'pending';
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }
  const { rows } = await pool.query(
    `SELECT l.id, l.title, l.description, l.price, l.item_condition, l.era, l.status,
            l.category_id, c.name AS category_name, l.seller_id, u.name AS seller_name, l.created_at,
            COALESCE((SELECT json_agg(json_build_object('id', i.id, 'url', i.url) ORDER BY i.id)
                      FROM listing_images i WHERE i.listing_id = l.id), '[]'::json) AS images
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.seller_id
     WHERE l.status = $1
     ORDER BY l.created_at ASC, l.id ASC`,
    [status]
  );
  res.json(rows);
});

// POST /admin/listings/:id/review  { decision: 'approved'|'rejected'|'changes_requested', reason }
router.post('/listings/:id/review', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid listing id' });
  const id = Number(req.params.id);
  const { decision } = req.body || {};
  const reason = String(req.body?.reason || '').trim();

  if (!Object.keys(DECISIONS).includes(decision)) {
    return res.status(400).json({ error: `decision must be one of: ${Object.keys(DECISIONS).join(', ')}` });
  }
  if (decision !== 'approved' && !reason) {
    return res.status(400).json({ error: 'reason is required for rejected / changes_requested' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Lock the row so two admins can't review the same listing at once.
    const { rows } = await client.query('SELECT status FROM listings WHERE id = $1 FOR UPDATE', [id]);
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Listing not found' }); }
    if (rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Listing is ${rows[0].status}, only pending listings can be reviewed` });
    }
    const newStatus = DECISIONS[decision];
    await client.query('UPDATE listings SET status = $1 WHERE id = $2', [newStatus, id]);
    await client.query(
      'INSERT INTO listing_reviews (listing_id, admin_id, decision, reason) VALUES ($1, $2, $3, $4)',
      [id, req.user.id, decision, reason || null]
    );
    await client.query('COMMIT');
    res.json({ id, status: newStatus });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
