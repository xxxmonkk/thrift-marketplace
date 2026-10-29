import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ShoppingBag, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orders';
import { ApiRequestError } from '../api/client';
import type { Order } from '../types/api';

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function CheckoutPage() {
  const { cart, fetchCart, removeItem } = useCart();
  const navigate = useNavigate();
  const [address, setAddress]     = useState('');
  const [addressErr, setAddrErr]  = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [soldConflicts, setSoldConflicts]   = useState<number[]>([]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const liveItems = cart?.items.filter((i) => i.status === 'live') ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setAddrErr('Delivery address is required.'); return; }
    setAddrErr('');
    setApiError(null);
    setSoldConflicts([]);
    setSubmitting(true);
    try {
      const order = await createOrder({ address: address.trim() });
      setConfirmedOrder(order);
      // Refresh cart so badge clears
      await fetchCart();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          // Item already sold — remove conflicted items from cart UI
          const conflicted = err.data.listing_ids ?? [];
          setSoldConflicts(conflicted);
          setApiError('One or more items in your cart were just purchased by someone else. Please remove them and try again.');
          // Remove sold items from cart
          for (const id of conflicted) {
            try { await removeItem(id); } catch {}
          }
        } else {
          setApiError(err.data.error);
        }
      } else {
        setApiError('Checkout failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Order confirmed
  if (confirmedOrder) {
    return (
      <main className="section-container py-16 max-w-2xl mx-auto text-center">
        <div className="bg-ivory border border-border-soft p-10">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-700" />
          </div>
          <p className="label-text text-sepia/70 mb-2">Order Confirmed</p>
          <h1 className="editorial-heading text-3xl text-espresso mb-3">Thank You!</h1>
          <p className="font-sans text-sm text-walnut mb-1">
            Order <span className="font-bold text-espresso">#{confirmedOrder.id}</span> has been placed.
          </p>
          <p className="font-sans text-sm text-walnut mb-6">
            Total: <span className="font-bold text-espresso">{formatPrice(confirmedOrder.total)}</span>
          </p>
          <div className="bg-parchment border border-border-soft p-4 mb-8 text-left">
            <p className="label-text text-olive mb-2">Delivery Address</p>
            <p className="font-sans text-sm text-walnut flex items-start gap-2">
              <MapPin size={14} className="text-sepia mt-0.5 flex-shrink-0" />
              {confirmedOrder.address}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/orders" className="btn-primary px-6 py-3">View My Orders</Link>
            <Link to="/browse" className="btn-secondary px-6 py-3">Keep Browsing</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="bg-espresso py-10">
        <div className="section-container">
          <p className="label-text text-gold/60 mb-2">Final Step</p>
          <h1 className="editorial-heading text-3xl text-parchment">Checkout</h1>
        </div>
      </div>

      <div className="section-container py-10">
        {(!cart || liveItems.length === 0) ? (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="text-olive/30 mx-auto mb-4" />
            <p className="editorial-heading text-xl text-espresso mb-3">Nothing to Checkout</p>
            <p className="font-sans text-sm text-olive mb-6">
              Your cart is empty or all items have been sold.
            </p>
            <Link to="/cart" className="btn-secondary">Back to Cart</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <div>
              <h2 className="editorial-heading text-xl text-espresso mb-6">Delivery Details</h2>
              {apiError && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 text-red-800 mb-6">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-sm font-medium">Checkout Failed</p>
                    <p className="font-sans text-xs mt-1">{apiError}</p>
                    {soldConflicts.length > 0 && (
                      <p className="font-sans text-xs mt-1">
                        The conflicted items have been removed from your cart.
                        <Link to="/cart" className="ml-1 underline-gold text-red-700">Review your cart</Link>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6">
                  <label htmlFor="checkout-address" className="form-label">
                    Delivery Address <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="checkout-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`textarea-field ${addressErr ? 'border-red-400' : ''}`}
                    placeholder="Enter your full delivery address…"
                    rows={4}
                    aria-describedby={addressErr ? 'address-error' : undefined}
                  />
                  {addressErr && <p id="address-error" className="form-error">{addressErr}</p>}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 mb-6">
                  <p className="font-sans text-xs text-amber-800 font-medium">Mock Payment</p>
                  <p className="font-sans text-xs text-amber-700 mt-1">
                    This is a prototype. No real payment is processed. Clicking "Place Order" creates
                    the order as "paid" and reserves your items.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-sm"
                  aria-busy={isSubmitting}
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Placing Order…' : `Place Order — ${formatPrice(cart?.total ?? 0)}`}
                </button>
              </form>
            </div>

            {/* Summary */}
            <div>
              <h2 className="editorial-heading text-xl text-espresso mb-6">Order Summary</h2>
              <div className="bg-ivory border border-border-soft">
                {liveItems.map((item) => (
                  <div key={item.listing_id} className="flex items-center gap-3 p-4 border-b border-border-soft last:border-0">
                    <div className="w-12 h-12 flex-shrink-0 bg-parchment border border-border-soft overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover img-vintage" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-olive/30 text-xs">—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-espresso truncate">{item.title}</p>
                    </div>
                    <p className="font-sans text-sm font-bold text-espresso flex-shrink-0">{formatPrice(item.price)}</p>
                  </div>
                ))}
                <div className="p-4 border-t border-border-soft">
                  <div className="flex justify-between font-sans font-bold text-espresso text-base">
                    <span>Total</span>
                    <span>{formatPrice(cart?.total ?? 0)}</span>
                  </div>
                </div>
              </div>

              <Link to="/cart" className="btn-ghost mt-4 flex items-center gap-2 text-sm">
                ← Edit Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
