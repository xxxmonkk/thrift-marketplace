import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, RefreshCw, ImageOff } from 'lucide-react';
import { getMyOrders } from '../api/orders';
import type { Order } from '../types/api';
import { OrderTimeline } from '../components/marketplace/OrderTimeline';

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <main>
      <div className="bg-espresso py-10">
        <div className="section-container">
          <p className="label-text text-gold/60 mb-2">Purchase History</p>
          <h1 className="editorial-heading text-3xl text-parchment">My Orders</h1>
        </div>
      </div>

      <div className="section-container py-10 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-ivory border border-border-soft animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle size={32} className="text-red-600 mx-auto mb-4" />
            <p className="editorial-heading text-xl text-espresso mb-3">Could Not Load Orders</p>
            <p className="font-sans text-sm text-olive mb-6">{error}</p>
            <button onClick={load} className="btn-secondary flex items-center gap-2 mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-olive/30 mx-auto mb-6" />
            <p className="editorial-heading text-2xl text-espresso mb-3">No Orders Yet</p>
            <p className="font-sans text-sm text-olive mb-8">
              Start discovering vintage treasures and make your first purchase.
            </p>
            <Link to="/browse" className="btn-primary px-8 py-3">Explore the Marketplace</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const expanded = expandedId === order.id;
              return (
                <div key={order.id} className="bg-ivory border border-border-soft overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-parchment/50 transition-colors"
                    aria-expanded={expanded}
                  >
                    <div>
                      <p className="label-text text-olive mb-1">Order #{order.id}</p>
                      <p className="font-serif text-base font-semibold text-espresso">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="font-sans text-xs text-olive mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-sans text-lg font-bold text-espresso">{formatPrice(order.total)}</p>
                      <span className="badge-live mt-1">Paid</span>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-border-soft p-5 animate-slide-up">
                      {/* Items */}
                      <div className="space-y-3 mb-6">
                        {order.items.map((item) => (
                          <div key={item.listing_id} className="flex items-center gap-3">
                            <div className="w-12 h-12 flex-shrink-0 bg-parchment border border-border-soft overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover img-vintage" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageOff size={16} className="text-olive/30" aria-hidden="true" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/listings/${item.listing_id}`}
                                className="font-sans text-sm text-espresso hover:text-sepia transition-colors truncate block">
                                {item.title}
                              </Link>
                              <p className="font-sans text-sm font-bold text-walnut">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Address */}
                      <div className="bg-parchment border border-border-soft p-3 mb-6">
                        <p className="label-text text-olive mb-1">Delivery Address</p>
                        <p className="font-sans text-sm text-walnut">{order.address}</p>
                      </div>
                      {/* Timeline */}
                      <OrderTimeline status={order.status} createdAt={order.created_at} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
