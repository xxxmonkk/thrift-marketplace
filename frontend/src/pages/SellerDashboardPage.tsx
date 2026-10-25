import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { getMyListings } from '../api/listings';
import type { Listing } from '../types/api';
import { ConditionBadge, EraBadge } from '../components/common/Badge';
import { SkeletonListingGrid } from '../components/common/Skeleton';

export function SellerDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="section-container py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-walnut gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold/80 block mb-1">
            Curator Studio
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-ivory font-light">
            My Vintage Archive
          </h1>
          <p className="font-sans text-sm text-parchment/60 mt-1">
            Manage your submitted objects, review approval statuses, and add pieces to the catalogue.
          </p>
        </div>
        <div>
          <Link
            to="/seller/create"
            className="btn-primary inline-flex items-center gap-2 text-sm shadow-vintage"
          >
            <PlusCircle size={16} />
            Submit New Piece
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-8">
          <SkeletonListingGrid count={4} />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-espresso/60 border border-walnut my-8 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-ivory mb-2">Unable to retrieve pieces</p>
          <p className="font-sans text-sm text-parchment/60 mb-6">{error}</p>
          <button onClick={fetchListings} className="btn-secondary inline-flex items-center gap-2 text-xs">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-walnut my-8 bg-espresso/20">
          <Package className="w-12 h-12 text-parchment/30 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-ivory mb-2">No Items in Your Collection</h2>
          <p className="font-sans text-sm text-parchment/60 max-w-md mx-auto mb-6">
            You haven't submitted any vintage treasures yet. Submit your first piece for curation today.
          </p>
          <Link to="/seller/create" className="btn-primary inline-flex items-center gap-2 text-xs">
            <PlusCircle size={15} /> Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-8">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-espresso/50 border border-walnut rounded overflow-hidden flex flex-col hover:border-gold/50 transition-colors"
            >
              <div className="relative aspect-square overflow-hidden bg-charcoal">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`font-sans text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm ${
                      item.status === 'live'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                        : item.status === 'pending'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                        : item.status === 'rejected'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                        : item.status === 'changes_requested'
                        ? 'bg-orange-950/80 text-orange-300 border border-orange-600/40'
                        : 'bg-stone-900/80 text-stone-300 border border-stone-600/40'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {item.era && <EraBadge era={item.era} />}
                    {item.item_condition && <ConditionBadge condition={item.item_condition} />}
                  </div>
                  <h3 className="font-serif text-lg text-ivory line-clamp-1">{item.title}</h3>
                  <p className="font-sans text-xs text-parchment/60 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-walnut/50 mt-4 flex items-center justify-between">
                  <span className="font-serif text-gold text-lg font-medium">
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </span>
                  <Link
                    to={`/listings/${item.id}`}
                    className="font-sans text-xs text-parchment/70 hover:text-gold transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
