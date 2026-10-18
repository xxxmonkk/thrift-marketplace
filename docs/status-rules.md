# Status Rules (Prototype)

## Listing status

`pending` -> `live` / `rejected` / `changes_requested` -> `sold`

| From | To | Triggered by | Notes |
|---|---|---|---|
| (new) | pending | Seller submits (`POST /listings`) | Hidden from buyers. |
| pending | live | Admin approves | Appears in browse. |
| pending | rejected | Admin rejects | Reason returned to seller. |
| pending | changes_requested | Admin asks for changes | Reason returned to seller. |
| live | sold | Successful checkout | Same DB transaction as the order. |

- Browse (`GET /listings`) returns **only** `live` listings.
- There is no edit/resubmit endpoint in the prototype. For `changes_requested` or `rejected`, the seller creates a new listing.

## Order status

Prototype change: checkout creates the order already as `paid` (mock payment), so the `placed` step is skipped.

| From | To | Triggered by | Notes |
|---|---|---|---|
| (new) | paid | Buyer checks out (`POST /orders`) | Listing(s) become `sold` in the same transaction. |

`shipped`, `delivered` and `cancelled` exist in the schema but are not used in the prototype. The orders page shows a hardcoded timeline.

## Checkout rule (the important one)

In ONE transaction:
1. Lock the listing row(s) and check `status = 'live'`.
2. If any listing is not `live`, roll back and return `409 { "error": "Item already sold" }`.
3. Insert the order and order_items, set listings to `sold`, commit.

`order_items.listing_id` is unique, so the database also refuses a double sale as a backstop.

## Cart edge case

If an item in someone's cart is sold to another buyer, checkout returns 409. The frontend shows "no longer available" and removes it from the cart.