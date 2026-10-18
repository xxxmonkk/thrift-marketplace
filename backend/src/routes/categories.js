const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /categories
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY id');
  res.json(rows);
});

module.exports = router;
