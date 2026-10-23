// npm run demo -> runs every flow end to end against a running server (npm run dev) and prints PASS/FAIL.
// Tip: run `npm run db:reset` first for a clean, predictable start.
const BASE = process.env.BASE_URL || 'http://localhost:4000';
let pass = 0, fail = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}
function check(name, ok, info) {
  if (ok) { pass++; console.log(`  [PASS] ${name}`); }
  else { fail++; console.log(`  [FAIL] ${name}`, info === undefined ? '' : JSON.stringify(info)); }
}
const section = t => console.log(`\n== ${t}`);
const login = async (email, password) => (await call('POST', '/auth/login', { body: { email, password } })).data?.token;

const newListing = (title, extra = {}) => ({
  title, description: 'Demo item', price: 1000, category_id: 2, item_condition: 'good',
  era: '1990s', image_urls: ['https://placehold.co/600x400?text=Demo'], ...extra,
});

(async () => {
  const health = await call('GET', '/health').catch(() => null);
  if (!health || health.status !== 200) {
    console.error(`Server not reachable at ${BASE}. Start it with: npm run dev`);
    process.exit(1);
  }

  section('1. Auth');
  const stamp = Date.now();
  const reg = await call('POST', '/auth/register', { body: { name: 'Demo Buyer', email: `demo${stamp}@t.test`, password: 'demo1234', role: 'buyer' } });
  check('register buyer -> 201 + token', reg.status === 201 && !!reg.data?.token, reg);
  check('duplicate email -> 409', (await call('POST', '/auth/register', { body: { name: 'x', email: `DEMO${stamp}@t.test`, password: 'demo1234' } })).status === 409);
  check('register as admin -> 400', (await call('POST', '/auth/register', { body: { name: 'x', email: `a${stamp}@t.test`, password: 'demo1234', role: 'admin' } })).status === 400);
  check('wrong password -> 401', (await call('POST', '/auth/login', { body: { email: 'admin@thrift.test', password: 'nope' } })).status === 401);
  const admin = await login('admin@thrift.test', 'admin123');
  const seller = await login('seller1@thrift.test', 'seller123');
  const buyer1 = await login('buyer1@thrift.test', 'buyer123');
  const buyer2 = await login('buyer2@thrift.test', 'buyer123');
  check('login admin / seller / buyer1 / buyer2', !!(admin && seller && buyer1 && buyer2));

  section('2. Browse, search, filter, item page');
  const cats = await call('GET', '/categories');
  check('GET /categories -> 5', cats.status === 200 && cats.data.length === 5, cats.data);
  const all = await call('GET', '/listings');
  check('GET /listings -> only live', all.status === 200 && all.data.length > 0 && all.data.every(l => l.status === 'live'));
  const shoes = await call('GET', '/listings?category=shoes');
  check('filter category=shoes', shoes.data.length > 0 && shoes.data.every(l => l.category_name === 'Shoes'));
  const era = await call('GET', '/listings?era=1990s');
  check('filter era=1990s', era.data.length > 0 && era.data.every(l => l.era === '1990s'));
  const cheap = await call('GET', '/listings?max_price=1000');
  check('filter max_price=1000', cheap.data.every(l => l.price <= 1000));
  check('search q=camera', (await call('GET', '/listings?q=camera')).data.length > 0);
  check('bad price -> 400', (await call('GET', '/listings?max_price=abc')).status === 400);
  const one = await call('GET', `/listings/${all.data[0].id}`);
  check('GET /listings/:id -> images + seller_name', one.status === 200 && one.data.images.length > 0 && !!one.data.seller_name);
  check('unknown id -> 404', (await call('GET', '/listings/999999')).status === 404);

  section('3. Seller creates listings (start as pending)');
  check('no token -> 401', (await call('POST', '/listings', { body: newListing('x') })).status === 401);
  check('buyer cannot create -> 403', (await call('POST', '/listings', { token: buyer1, body: newListing('x') })).status === 403);
  check('bad price -> 400', (await call('POST', '/listings', { token: seller, body: newListing('x', { price: '500' }) })).status === 400);
  const mk = async t => (await call('POST', '/listings', { token: seller, body: newListing(`${t} ${stamp}`) }));
  const [a, b, c] = [await mk('Demo cart item'), await mk('Demo race item'), await mk('Demo reject item')];
  check('create 3 listings -> 201 pending', [a, b, c].every(r => r.status === 201 && r.data.status === 'pending'), a.data);
  const [idA, idB, idC] = [a.data.id, b.data.id, c.data.id];
  check('pending listing hidden from browse', !(await call('GET', '/listings')).data.some(l => l.id === idA));
  check('pending item page hidden from public -> 404', (await call('GET', `/listings/${idA}`)).status === 404);
  check('seller /listings/mine shows pending', (await call('GET', '/listings/mine', { token: seller })).data.some(l => l.id === idA && l.status === 'pending'));

  section('4. Admin moderation');
  check('buyer cannot open admin queue -> 403', (await call('GET', '/admin/listings', { token: buyer1 })).status === 403);
  const queue = await call('GET', '/admin/listings?status=pending', { token: admin });
  check('admin queue lists new listings', [idA, idB, idC].every(id => queue.data.some(l => l.id === id)));
  check('reject without reason -> 400', (await call('POST', `/admin/listings/${idC}/review`, { token: admin, body: { decision: 'rejected' } })).status === 400);
  const rej = await call('POST', `/admin/listings/${idC}/review`, { token: admin, body: { decision: 'rejected', reason: 'Photos too blurry' } });
  check('reject with reason -> status rejected', rej.status === 200 && rej.data.status === 'rejected', rej.data);
  check('seller sees review_reason', (await call('GET', '/listings/mine', { token: seller })).data.some(l => l.id === idC && l.review_reason === 'Photos too blurry'));
  check('approve A and B -> live', (await Promise.all([idA, idB].map(id => call('POST', `/admin/listings/${id}/review`, { token: admin, body: { decision: 'approved' } })))).every(r => r.status === 200 && r.data.status === 'live'));
  check('re-review non-pending -> 409', (await call('POST', `/admin/listings/${idA}/review`, { token: admin, body: { decision: 'approved' } })).status === 409);
  check('approved listings now in browse', (await call('GET', '/listings')).data.some(l => l.id === idA) );

  section('5. Cart');
  check('seller cannot use cart -> 403', (await call('GET', '/cart', { token: seller })).status === 403);
  const add = await call('POST', '/cart', { token: buyer1, body: { listing_id: idA } });
  check('add to cart -> 201', add.status === 201 && add.data.items.some(i => i.listing_id === idA), add.data);
  const dup = await call('POST', '/cart', { token: buyer1, body: { listing_id: idA } });
  check('adding twice is harmless', dup.data.items.filter(i => i.listing_id === idA).length === 1);
  check('cannot add pending/rejected item -> 409', (await call('POST', '/cart', { token: buyer1, body: { listing_id: idC } })).status === 409);
  const cart = await call('GET', '/cart', { token: buyer1 });
  check('view cart: items + total', cart.status === 200 && cart.data.total >= 1000, cart.data);
  check('remove from cart', !(await call('DELETE', `/cart/${idA}`, { token: buyer1 })).data.items.some(i => i.listing_id === idA));
  await call('POST', '/cart', { token: buyer1, body: { listing_id: idA } });

  section('6. Checkout from cart');
  check('empty cart order -> 400', (await call('POST', '/orders', { token: reg.data.token, body: { address: 'x' } })).status === 400);
  check('order without address -> 400', (await call('POST', '/orders', { token: buyer1, body: {} })).status === 400);
  const order = await call('POST', '/orders', { token: buyer1, body: { address: '12 MG Road, Ghaziabad' } });
  check('place order from cart -> 201 paid', order.status === 201 && order.data.status === 'paid' && order.data.items.length === 1, order.data);
  check('listing is now sold', (await call('GET', `/listings/${idA}`)).data.status === 'sold');
  check('sold listing hidden from browse', !(await call('GET', '/listings')).data.some(l => l.id === idA));
  check('cart emptied after order', (await call('GET', '/cart', { token: buyer1 })).data.items.length === 0);
  check('GET /orders/mine shows order', (await call('GET', '/orders/mine', { token: buyer1 })).data.some(o => o.id === order.data.id && o.items[0].listing_id === idA));
  check('buying a sold item -> 409', (await call('POST', '/orders', { token: buyer2, body: { listing_ids: [idA], address: 'x' } })).status === 409);

  section('7. Race: two buyers, one item, same instant');
  const [r1, r2] = await Promise.all([
    call('POST', '/orders', { token: buyer1, body: { listing_ids: [idB], address: 'Buyer 1 address' } }),
    call('POST', '/orders', { token: buyer2, body: { listing_ids: [idB], address: 'Buyer 2 address' } }),
  ]);
  const codes = [r1.status, r2.status].sort();
  check('exactly one 201 and one 409', codes[0] === 201 && codes[1] === 409, codes);
  check('loser gets "Item already sold"', [r1, r2].some(r => r.status === 409 && r.data.error === 'Item already sold'));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(err => { console.error('Demo crashed:', err); process.exit(1); });
