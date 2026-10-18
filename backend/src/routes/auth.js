const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /auth/register  { name, email, password, role: 'buyer' | 'seller' }
router.post('/register', async (req, res) => {
  const { name, password } = req.body || {};
  const email = String(req.body?.email || '').trim().toLowerCase();
  const role = req.body?.role || 'buyer';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  // Admin accounts are seeded, never self-signup. Enforced HERE, not just in the form.
  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ error: "role must be 'buyer' or 'seller'" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, role`,
      [String(name).trim(), email, hash, role]
    );
    const user = rows[0];
    res.status(201).json({ token: makeToken(user), user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    throw err;
  }
});

// POST /auth/login  { email, password }
router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const { rows } = await pool.query(
    'SELECT id, name, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  const row = rows[0];
  // Same message for "no such user" and "wrong password" so emails can't be probed.
  const ok = row && (await bcrypt.compare(password, row.password_hash));
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  const user = { id: row.id, name: row.name, role: row.role };
  res.json({ token: makeToken(user), user });
});

module.exports = router;
