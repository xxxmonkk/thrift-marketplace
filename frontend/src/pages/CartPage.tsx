import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, AlertTriangle, ImageOff, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../types/api';

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// ── CartItemRow ────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
  removing: boolean;
}
function CartItemRow({ item, onRemove, removing }: CartItemRowProps) {
  const isSold = item.status === 'sold';
  return (
    <div className={`flex gap-4 p-4 border-b border-border-soft last:border-0 ${isSold ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
      <div className="w-16 h-16 flex-shrink-0 bg-ivory border border-border-soft overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover img-vintage" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={18} className="text-olive/30" aria-hidden="true" />
          </div>
        )}
      </div>
      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/listings/${item.listing_id}`}
              className="font-serif text-sm font-semibold text-espresso hover:text-sepia transition-colors line-clamp-1">
              {item.title}
            </Link>
            {isSold ? (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle size={11} className="text-red-600" />
                <span className="font-sans text-xs text-red-700">No longer available — another buyer purchased this item.</span>
              </div>
            ) : (
              <p className="font-sans text-base font-bold text-espresso mt-1">{formatPrice(item.price)}</p>
            )}
          </div>
          <button
            onClick={onRemove}
            disabled={removing}
            aria-label={`Remove ${item.title} from cart`}
            className="flex-shrink-0 text-olive/50 hover:text-red-600 transition-colors disabled:opacity-30"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CartPage ──────────────────────────────────────────────
export function CartPage() {
  const { cart, isLoading, error, fetchCart, removeItem, itemCount } = useCart();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleRemove = async (listing_id: number) => {
    setRemovingId(listing_id);
    try { await removeItem(listing_id); }
    catch {}
    finally { setRemovingId(null); }
  };

  if (isLoading && !cart) {
    return (
      <main className="section-container py-12">
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-ivory animate-pulse border border-border-soft" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section-container py-20 text-center">
        <AlertTriangle size={32} className="text-red-600 mx-auto mb-4" />
        <p className="editorial-heading text-xl text-espresso mb-3">Could not load your cart</p>
        <p className="font-sans text-sm text-olive mb-6">{error}</p>
        <button onClick={fetchCart} className="btn-secondary mx-auto">Retry</button>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const liveItems = items.filter((i) => i.status === 'live');
  const soldItems = items.filter((i) => i.status === 'sold');

  return (
    <main>
      <div className="bg-espresso py-10">
        <div className="section-container">
          <p className="label-text text-gold/60 mb-2">Your Selection</p>
          <h1 className="editorial-heading text-3xl text-parchment">Shopping Cart</h1>
        </div>
      </div>

      <div className="section-container py-10">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-olive/30 mx-auto mb-6" />
            <p className="editorial-heading text-2xl text-espresso mb-3">Your Cart is Empty</p>
            <p className="font-sans text-sm text-olive mb-8">
              Discover extraordinary vintage finds and add them to your cart.
            </p>
            <Link to="/browse" className="btn-primary px-8 py-3">
              Explore the Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Item List */}
            <div className="lg:col-span-2">
              {soldItems.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 mb-4">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-sm font-medium text-red-800">Some items are no longer available</p>
                    <p className="font-sans text-xs text-red-700 mt-0.5">
                      These items were purchased by another collector. Remove them before checkout.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-ivory border border-border-soft">
                <div className="px-4 py-3 border-b border-border-soft">
                  <p className="font-sans text-sm font-medium text-espresso">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
                {items.map((item) => (
                  <CartItemRow
                    key={item.listing_id}
                    item={item}
                    onRemove={() => handleRemove(item.listing_id)}
                    removing={removingId === item.listing_id}
                  />
                ))}
              </div>

              <div className="mt-4">
                <Link to="/browse" className="btn-ghost flex items-center gap-2">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-ivory border border-border-soft p-6 sticky top-24">
                <p className="editorial-heading text-lg text-espresso mb-4">Order Summary</p>
                <div className="space-y-2 mb-4">
                  {liveItems.map((item) => (
                    <div key={item.listing_id} className="flex justify-between font-sans text-sm text-walnut">
                      <span className="truncate pr-4">{item.title}</span>
                      <span className="flex-shrink-0 font-medium">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                  {soldItems.length > 0 && (
                    <p className="font-sans text-xs text-red-600 mt-2">
                      {soldItems.length} unavailable item{soldItems.length !== 1 ? 's' : ''} excluded from total.
                    </p>
                  )}
                </div>
                <div className="border-t border-border-soft pt-4 mb-6">
                  <div className="flex justify-between font-sans font-bold text-espresso">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart?.total ?? 0)}</span>
                  </div>
                  <p className="font-sans text-xs text-olive mt-1">Shipping calculated at checkout.</p>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={liveItems.length === 0}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  Proceed to Checkout
                  <ArrowRight size={15} />
                </button>
                {liveItems.length === 0 && (
                  <p className="font-sans text-xs text-red-600 text-center mt-3">
                    Remove sold items to continue.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
