require('dotenv').config({ quiet: true });
const { Pool } = require('pg');

// One shared pool. For transactions (checkout), use: const client = await pool.connect();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
