# Prototype Scope

We are building a **prototype**: a polished frontend with a thin, real backend for the parts that matter. Anything not listed under "Real" is faked or cut.

## Real (backend + frontend)

- Login and signup with roles (buyer / seller / admin)
- Browse, search and filter (live listings only)
- Item page
- Create listing (seller); new listings start as `pending`
- Admin queue: approve / reject / request changes
- Mock checkout with the sold-item transaction (a second buyer gets a clean "already sold" error)
- My orders page

## Faked or cut

| Item | How we handle it |
|---|---|
| Cart | Lives in frontend state / localStorage only. No cart API. |
| Image upload | Image URLs in seed data and in the create-listing form. No file upload. |
| Order tracking | Hardcoded timeline on the frontend. |
| Wishlist, ratings, seller payouts, emails | Not building. |
| Shipped / delivered updates | Not building. |

## Rules

- Do not start anything in "Faked or cut" until every "Real" item works end to end.
- Do not change an endpoint in `api-contract.md` without telling the whole group.
- Frontend keeps a mock-data fallback (`mock/listings.json`) so the demo still works if the server is down.