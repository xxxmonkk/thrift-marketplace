-- Seed data for local dev. Run AFTER schema.sql:
--   psql -d thrift -f backend/db/seed.sql
-- Safe to re-run: it wipes the tables first and restarts ids at 1.
--
-- Logins (all bcrypt, cost 10):
--   admin@thrift.test   / admin123
--   seller1@thrift.test / seller123    seller2@thrift.test / seller123
--   buyer1@thrift.test  / buyer123     buyer2@thrift.test  / buyer123

TRUNCATE order_items, orders, cart_items, listing_reviews, listing_images,
         listings, categories, users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin',        'admin@thrift.test',   '$2b$10$Cyeki7E9.pbXwppdNkF/heD6nqm5pUF5YMwc6ezGVbvMKqpx4DgzG', 'admin'),   -- id 1
  ('Riya Seller',  'seller1@thrift.test', '$2b$10$rZaw7zkBLaY5oBLDgEfwNuf62CKG4tH3cWGTNziv/GOoonM3Si5iW', 'seller'),  -- id 2
  ('Karan Seller', 'seller2@thrift.test', '$2b$10$rZaw7zkBLaY5oBLDgEfwNuf62CKG4tH3cWGTNziv/GOoonM3Si5iW', 'seller'),  -- id 3
  ('Aman Buyer',   'buyer1@thrift.test',  '$2b$10$dMesjSMJev5b/eZiQ08NiuIEbOMONyRDq0HmOJvqqCU9CX7nyYtZW', 'buyer'),   -- id 4
  ('Neha Buyer',   'buyer2@thrift.test',  '$2b$10$dMesjSMJev5b/eZiQ08NiuIEbOMONyRDq0HmOJvqqCU9CX7nyYtZW', 'buyer');   -- id 5

INSERT INTO categories (name) VALUES
  ('Cameras'),      -- 1
  ('Shoes'),        -- 2
  ('Bags'),         -- 3
  ('Clothing'),     -- 4
  ('Accessories');  -- 5

-- 6 live, 2 pending (admin queue), 1 rejected, 1 changes_requested, 1 sold
INSERT INTO listings (seller_id, category_id, title, description, price, item_condition, era, status) VALUES
  (2, 1, 'Canon PowerShot A70 digicam',   'Works great, includes SD card and strap.',        4500, 'good',     '2000s', 'live'),               -- 1
  (2, 1, 'Olympus mju point-and-shoot',   'Film camera, clean lens, flash works.',           3200, 'like new', '1990s', 'live'),               -- 2
  (3, 5, 'Brown leather belt',            'Solid brass buckle, minor creasing.',              800, 'good',     '1980s', 'live'),               -- 3
  (3, 2, 'Platform heels, size 7',        'Chunky black platforms, some sole wear.',         1500, 'fair',     '1990s', 'live'),               -- 4
  (2, 3, 'Leather satchel bag',           'Structured satchel, brass clasp, lined.',         2800, 'good',     '1970s', 'live'),               -- 5
  (3, 4, 'Denim jacket, M',               'Faded wash, no tears.',                           1800, 'good',     '1990s', 'live'),               -- 6
  (2, 5, 'Silk scarf, floral print',      'Hand-rolled edges.',                               950, 'like new', '1970s', 'pending'),            -- 7
  (3, 2, 'High-top canvas sneakers, 9',   'Worn in but sturdy.',                             1200, 'fair',     '1980s', 'pending'),            -- 8
  (2, 4, 'Faux fur coat',                 'Long coat, needs cleaning.',                      2200, 'fair',     '1970s', 'rejected'),           -- 9
  (3, 1, 'Kodak Instamatic film camera',  'Vintage, no battery tested.',                     1800, 'fair',     '1970s', 'changes_requested'),  -- 10
  (2, 1, 'Polaroid OneStep',              'Tested, takes 600 film.',                         3500, 'good',     '1980s', 'sold');               -- 11

INSERT INTO listing_images (listing_id, url)
SELECT id, 'https://placehold.co/600x400?text=Listing+' || id FROM listings;

INSERT INTO listing_reviews (listing_id, admin_id, decision, reason) VALUES
  (1,  1, 'approved',          NULL),
  (2,  1, 'approved',          NULL),
  (3,  1, 'approved',          NULL),
  (4,  1, 'approved',          NULL),
  (5,  1, 'approved',          NULL),
  (6,  1, 'approved',          NULL),
  (9,  1, 'rejected',          'Item is stained and the photos do not show the condition.'),
  (10, 1, 'changes_requested', 'Please add a clearer photo and confirm whether it works.'),
  (11, 1, 'approved',          NULL);

-- Cart: buyer2 has two live items
INSERT INTO cart_items (user_id, listing_id) VALUES (5, 3), (5, 6);

-- One finished order so the order-tracking page has data
INSERT INTO orders (buyer_id, total, status, address) VALUES
  (4, 3500, 'shipped', '12 MG Road, Ghaziabad, UP 201001');           -- id 1
INSERT INTO order_items (order_id, listing_id, price) VALUES (1, 11, 3500);