# Vintage Thrift Marketplace
Buyers and sellers trade one-of-a-kind vintage items. Admin approves listings before they go live.

## Setup
1. Copy .env.example to .env and fill in your values (never commit .env)
2. createdb thrift
3. psql -d thrift -f backend/db/schema.sql
4. psql -d thrift -f backend/db/seed.sql

## Folders
- /frontend: UI
- /backend: API + DB scripts
- /docs: status rules, API contract
