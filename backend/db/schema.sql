-- Vintage Thrift Marketplace: DB setup (Postgres)
-- Run: psql -d thrift -f backend/db/schema.sql
-- WARNING: drops and recreates every table. Dev only.

DROP TABLE IF EXISTS order_items, orders, cart_items, listing_reviews,
                     listing_images, listings, categories, users CASCADE;

CREATE TABLE users (
  id             serial PRIMARY KEY,
  name           text NOT NULL,
  email          text NOT NULL UNIQUE,   -- lowercase it in the app before insert/lookup
  password_hash  text NOT NULL,
  role           text NOT NULL CHECK (role IN ('buyer', 'seller', 'admin'))
);

CREATE TABLE categories (
  id    serial PRIMARY KEY,
  name  text NOT NULL UNIQUE
);

CREATE TABLE listings (
  id              serial PRIMARY KEY,
  seller_id       int NOT NULL REFERENCES users(id),
  category_id     int NOT NULL REFERENCES categories(id),
  title           text NOT NULL,
  description     text,
  price           int NOT NULL CHECK (price > 0),   -- whole number
  item_condition  text NOT NULL CHECK (item_condition IN ('like new', 'good', 'fair')),
  era             text,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'live', 'rejected', 'changes_requested', 'sold')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE listing_images (
  id          serial PRIMARY KEY,
  listing_id  int NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         text NOT NULL
);

CREATE TABLE listing_reviews (
  id           serial PRIMARY KEY,
  listing_id   int NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  admin_id     int NOT NULL REFERENCES users(id),
  decision     text NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
  reason       text,
  reviewed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id          serial PRIMARY KEY,
  user_id     int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  int NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE (user_id, listing_id)
);

CREATE TABLE orders (
  id          serial PRIMARY KEY,
  buyer_id    int NOT NULL REFERENCES users(id),
  total       int NOT NULL CHECK (total >= 0),
  status      text NOT NULL DEFAULT 'placed'
              CHECK (status IN ('placed', 'paid', 'shipped', 'delivered', 'cancelled')),
  address     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id          serial PRIMARY KEY,
  order_id    int NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id  int NOT NULL UNIQUE REFERENCES listings(id),  -- backstop against double-selling
  price       int NOT NULL CHECK (price > 0)                -- price at purchase time
);

-- Postgres does not auto-index foreign keys. These cover browse, seller view, admin queue, orders.
CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_category    ON listings(category_id);
CREATE INDEX idx_listings_seller      ON listings(seller_id);
CREATE INDEX idx_listing_images_lst   ON listing_images(listing_id);
CREATE INDEX idx_listing_reviews_lst  ON listing_reviews(listing_id);
CREATE INDEX idx_orders_buyer         ON orders(buyer_id);
CREATE INDEX idx_order_items_order    ON order_items(order_id);