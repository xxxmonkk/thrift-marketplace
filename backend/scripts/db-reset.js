// npm run db:reset  -> creates the database if missing, then runs db/schema.sql and db/seed.sql.
// Uses DATABASE_URL from .env, so no psql / PATH needed.
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is missing. Copy .env.example to .env'); process.exit(1); }

async function connect() {
  const client = new Client({ connectionString: url });
  try { await client.connect(); return client; }
  catch (err) {
    if (err.code !== '3D000') throw err;           // 3D000 = database does not exist
    const u = new URL(url);
    const dbName = decodeURIComponent(u.pathname.slice(1));
    u.pathname = '/postgres';
    const admin = new Client({ connectionString: u.toString() });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    await admin.end();
    console.log(`Created database "${dbName}"`);
    const retry = new Client({ connectionString: url });
    await retry.connect();
    return retry;
  }
}

(async () => {
  const client = await connect();
  client.on('notice', () => {});                    // hide "table does not exist, skipping" noise
  for (const file of ['schema.sql', 'seed.sql']) {
    await client.query(fs.readFileSync(path.join(__dirname, '..', 'db', file), 'utf8'));
    console.log(`Ran db/${file}`);
  }
  await client.end();
  console.log(`
Database reset. Test accounts:
  admin@thrift.test    / admin123
  seller1@thrift.test  / seller123   seller2@thrift.test / seller123
  buyer1@thrift.test   / buyer123    buyer2@thrift.test  / buyer123`);
})().catch(err => { console.error('db:reset failed:', err.message); process.exit(1); });
