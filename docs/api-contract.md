# API Contract (Prototype)

Base URL (local): `http://localhost:4000`
All requests and responses are JSON.

- **Auth:** send `Authorization: Bearer <token>` (token comes from login/register, valid 7 days).
- **Errors:** always `{ "error": "message" }` with one of these status codes:

| Code | Meaning |
|---|---|
| 400 | Bad input (missing or invalid field) |
| 401 | Not logged in, or token invalid/expired |
| 403 | Logged in, but your role isn't allowed |
| 404 | Not found (also used to hide listings you aren't allowed to see) |
| 409 | Conflict (email already used, item already sold) |
| 500 | Server error |

Everything below is ✅ **built and tested** (`npm run demo` in `backend/` runs 45 checks across all flows).

Seed logins (from `seed.sql`): `admin@thrift.test / admin123`, `seller1@thrift.test / seller123`, `buyer1@thrift.test / buyer123`.

---

## Auth

### POST /auth/register ✅
Who: anyone. Admin accounts can't be created here.

Request:
```json
{ "name": "Aman", "email": "aman@example.com", "password": "min6chars", "role": "buyer" }
```
`role` is `"buyer"` or `"seller"` (defaults to `"buyer"`). Email is lowercased by the server.

Response `201`:
```json
{ "token": "eyJ...", "user": { "id": 6, "name": "Aman", "role": "buyer" } }
```
Errors: `400` missing fields / short password / bad role, `409` email already registered.

### POST /auth/login ✅
Request: `{ "email": "seller1@thrift.test", "password": "seller123" }`

Response `200`: same shape as register (`token` + `user`).
Errors: `401` "Invalid email or password" (same message for unknown email and wrong password).

---

## Categories

### GET /categories ✅
Who: anyone.

Response `200`:
```json
[ { "id": 1, "name": "Cameras" }, { "id": 2, "name": "Shoes" } ]
```
Seeded ids: 1 Cameras, 2 Shoes, 3 Bags, 4 Clothing, 5 Accessories.

---

## Listings

### GET /listings ✅
Who: anyone. Returns **only `live`** listings, newest first.

Query params (all optional):

| Param | Notes |
|---|---|
| `category` | category id (`2`) or name (`shoes`) |
| `era` | exact era, case-insensitive (`1990s`) |
| `q` | text search in title and description |
| `min_price`, `max_price` | whole numbers; anything else gives `400` |

Response `200` (array; matches `mock/listings.json`):
```json
[
  {
    "id": 1,
    "title": "Canon PowerShot A70 digicam",
    "description": "Works great, includes SD card and strap.",
    "price": 4500,
    "item_condition": "good",
    "era": "2000s",
    "status": "live",
    "category_id": 1,
    "category_name": "Cameras",
    "image_url": "https://placehold.co/600x400?text=Listing+1",
    "created_at": "2026-10-18T10:00:00.000Z"
  }
]
```
`image_url` is the first image only (or `null` if none). `price` is a whole number.

### GET /listings/mine ✅  (NEW)
Who: seller (own listings, **any status**). Used for the seller dashboard.

Response `200`: same fields as `GET /listings`, plus:
```json
{ "...": "...", "status": "rejected", "review_reason": "Item is stained and the photos do not show the condition." }
```
`review_reason` is the latest admin reason, or `null` if there isn't one. Errors: `401`, `403` (not a seller).

### GET /listings/:id ✅
Who: anyone for `live` and `sold` listings. For `pending`, `rejected` and `changes_requested`, only the owning seller or an admin (send the token); everyone else gets `404`.

Response `200`:
```json
{
  "id": 1,
  "title": "Canon PowerShot A70 digicam",
  "description": "Works great, includes SD card and strap.",
  "price": 4500,
  "item_condition": "good",
  "era": "2000s",
  "status": "live",
  "category_id": 1,
  "category_name": "Cameras",
  "seller_id": 2,
  "seller_name": "Riya Seller",
  "created_at": "2026-10-18T10:00:00.000Z",
  "images": [ { "id": 1, "url": "https://placehold.co/600x400?text=Listing+1" } ]
}
```
Errors: `400` id isn't a number, `404` not found or not allowed to see it.
Frontend: when `status` is `"sold"`, show the item as sold and disable "Add to cart".

### POST /listings ✅
Who: seller. Creates a listing with `status: "pending"` (hidden from browse until an admin approves).

Request:
```json
{
  "title": "Vintage Ray-Ban",
  "description": "Wayfarer",
  "price": 2500,
  "category_id": 5,
  "item_condition": "good",
  "era": "1980s",
  "image_urls": ["https://example.com/a.jpg", "https://example.com/b.jpg"]
}
```
Rules: `title` required; `price` a whole number > 0 (send a number, not a string); `category_id` a number that exists; `item_condition` is `"like new"`, `"good"` or `"fair"`; `image_urls` a non-empty array of `http(s)` URLs; `description` and `era` optional.

Response `201`:
```json
{
  "id": 13, "seller_id": 2, "category_id": 5, "title": "Vintage Ray-Ban",
  "description": "Wayfarer", "price": 2500, "item_condition": "good", "era": "1980s",
  "status": "pending", "created_at": "2026-10-18T08:06:22.980Z",
  "image_urls": ["https://example.com/a.jpg", "https://example.com/b.jpg"]
}
```
Errors: `400` (message says which field), `401`, `403` (not a seller).

---

## Admin review ✅ (admin token required)

### GET /admin/listings?status=pending ✅
Who: admin. `status` defaults to `pending`; any listing status is allowed. Response: array of listings like `GET /listings` plus `seller_name` and `images: [{ "id", "url" }]`.

### POST /admin/listings/:id/review ✅
Who: admin. Only `pending` listings can be reviewed (otherwise `409`). Also saves a row in `listing_reviews`.

Request: `{ "decision": "approved" | "rejected" | "changes_requested", "reason": "..." }`
`reason` is required for `rejected` and `changes_requested`. `approved` sets the listing to `live`.

Response `200`: `{ "id": 7, "status": "live" }`

---

## Cart ✅ (buyer only; sellers/admins get `403`)

The cart is stored in the database (`cart_items`). Every cart response has the same shape:
```json
{
  "items": [ { "listing_id": 3, "title": "Brown leather belt", "price": 800, "status": "live", "image_url": "https://..." } ],
  "total": 800
}
```
`total` counts only items that are still `live`. If an item's `status` is `"sold"`, show "no longer available" in the UI.

### GET /cart
Response `200`: the cart.

### POST /cart
Request: `{ "listing_id": 3 }`. Adding the same item twice does nothing extra.
Response `201`: the cart. Errors: `400` bad id, `404` no such listing, `409` item sold or not live.

### DELETE /cart/:listing_id
Response `200`: the cart (without that item).

---

## Orders ✅ (buyer only)

### POST /orders ✅
Who: buyer. This is the checkout. One transaction: every listing must be `live`, then the order is created as `paid` and the listings become `sold`.

Request: `{ "address": "12 MG Road, Ghaziabad" }` checks out the buyer's **cart**. Or send `"listing_ids": [3, 6]` as well to buy specific items without using the cart.

Response `201`:
```json
{
  "id": 2, "buyer_id": 4, "total": 2600, "status": "paid",
  "address": "12 MG Road, Ghaziabad", "created_at": "2026-10-18T10:00:00.000Z",
  "items": [ { "listing_id": 3, "title": "Brown leather belt", "price": 800 } ]
}
```
Errors: `409` `{ "error": "Item already sold", "listing_ids": [3] }` (nothing is changed; if two buyers click at the same moment, exactly one wins), `400` bad input or empty cart, `404` listing not found, `401`, `403`.
On success, sold items also disappear from every cart.
Frontend: on `409`, show "no longer available" and remove the item from the cart.

### GET /orders/mine ✅
Who: buyer. Response: array of
```json
{
  "id": 1, "total": 3500, "status": "shipped", "address": "...", "created_at": "...",
  "items": [ { "listing_id": 11, "title": "Polaroid OneStep", "price": 3500, "image_url": "https://..." } ]
}
```

---

## Change rule
Don't change an endpoint, field name or response shape without telling the whole group in the chat first, and update this file in the same PR.
