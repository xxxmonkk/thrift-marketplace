import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImageOff, ArrowLeft, ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';
import { getListingById } from '../api/listings';
import type { ListingDetail } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ConditionBadge, EraBadge, StatusBadge } from '../components/common/Badge';
import { ContentSkeleton } from '../components/common/Skeleton';
import { ApiRequestError } from '../api/client';
import mockListings from '../mockData';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isRole } = useAuth();
  const { addItem, isLoading: cartLoading } = useCart();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cartMsg, setCartMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const numId = Number(id);
    if (!id || isNaN(numId)) {
      setError('Invalid listing ID.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    getListingById(numId)
      .then((data) => {
        setListing(data);
        setSelectedImage(data.images?.[0]?.url ?? null);
      })
      .catch((err) => {
        // Fallback to mock item if backend is offline or returning network error
        const mockItem = (mockListings as any[]).find((item) => item.id === numId);
        if (mockItem) {
          const mockDetail: ListingDetail = {
            ...mockItem,
            seller_id: 1,
            seller_name: 'Salixir Master Curator',
            images: mockItem.image_url ? [{ id: 1, url: mockItem.image_url }] : [],
          };
          setListing(mockDetail);
          setSelectedImage(mockItem.image_url ?? null);
          return;
        }

        if (err instanceof ApiRequestError && err.status === 404) {
          setError('Listing not found or not available.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load listing.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!listing) return;
    setAdding(true);
    setCartMsg(null);
    try {
      await addItem(listing.id);
      setCartMsg({
        type: 'success',
        text: isAuthenticated
          ? 'Added to your cart!'
          : 'Added to cart! Sign in when you are ready to checkout.',
      });
    } catch (err) {
      const msg = err instanceof ApiRequestError
        ? err.data.error
        : err instanceof Error ? err.message : 'Could not add to cart.';
      setCartMsg({ type: 'error', text: msg });
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <main className="section-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-ivory animate-pulse" />
          <div className="space-y-4 pt-4"><ContentSkeleton rows={6} /></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section-container py-20 text-center">
        <AlertTriangle size={32} className="text-red-600 mx-auto mb-4" />
        <h1 className="editorial-heading text-2xl text-espresso mb-3">Not Found</h1>
        <p className="font-sans text-sm text-olive mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 mx-auto">
          <ArrowLeft size={14} /> Go Back
        </button>
      </main>
    );
  }

  if (!listing) return null;

  const isSold = listing.status === 'sold';
  const isLive = listing.status === 'live';
  // Buyers and guests can add to cart; sellers cannot buy items
  const canAddCart = isLive && (!isAuthenticated || isRole('buyer')) && !adding && !cartLoading;

  return (
    <main>
      {/* Breadcrumbs */}
      <div className="bg-ivory border-b border-border-soft">
        <div className="section-container py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-sans text-xs text-olive/60">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/browse" className="hover:text-gold transition-colors">Browse</Link></li>
              <li>/</li>
              <li><Link to={`/browse?category=${listing.category_id}`} className="hover:text-gold transition-colors">{listing.category_name}</Link></li>
              <li>/</li>
              <li className="text-espresso truncate max-w-[200px]">{listing.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Image Gallery ── */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square bg-ivory border border-border-soft overflow-hidden mb-3">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={listing.title}
                  className="w-full h-full object-cover img-vintage"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff size={48} className="text-olive/30" aria-hidden="true" />
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 bg-espresso/70 flex items-center justify-center">
                  <div className="border border-parchment/60 px-8 py-3">
                    <span className="display-heading text-3xl text-parchment italic">Sold</span>
                  </div>
                </div>
              )}
              {/* Catalogue overlay */}
              <div className="absolute bottom-3 right-3 bg-espresso/60 px-2 py-1">
                <span className="font-sans text-[10px] text-parchment/60">
                  #{listing.id.toString().padStart(4, '0')}
                </span>
              </div>
            </div>
            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all ${
                      selectedImage === img.url ? 'border-gold' : 'border-border-soft hover:border-sepia'
                    }`}
                    aria-label={`View image ${img.id}`}
                    aria-pressed={selectedImage === img.url}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover img-vintage" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            {/* Status + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <StatusBadge status={listing.status} />
              <ConditionBadge condition={listing.item_condition} />
              {listing.era && <EraBadge era={listing.era} />}
            </div>

            {/* Category label */}
            <p className="label-text text-sepia/70 mb-2">{listing.category_name}</p>

            {/* Title */}
            <h1 className="editorial-heading text-3xl lg:text-4xl text-espresso mb-4 text-balance">
              {listing.title}
            </h1>

            {/* Price */}
            <p className="font-sans text-3xl font-bold text-espresso mb-6">
              {formatPrice(listing.price)}
            </p>

            {/* Divider */}
            <div className="border-t border-border-soft mb-6" />

            {/* Description */}
            {listing.description && (
              <div className="mb-6">
                <p className="label-text text-olive mb-2">About This Piece</p>
                <p className="font-sans text-sm text-walnut leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller */}
            <div className="bg-ivory border border-border-soft p-4 mb-6">
              <p className="label-text text-olive mb-1">Listed by</p>
              <p className="font-serif text-base text-espresso">{listing.seller_name}</p>
              <p className="font-sans text-xs text-olive/60 mt-1">
                {new Date(listing.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>

            {/* Cart action */}
            {isSold ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200">
                <AlertTriangle size={18} className="text-red-600" />
                <div>
                  <p className="font-sans text-sm font-medium text-red-800">No Longer Available</p>
                  <p className="font-sans text-xs text-red-600 mt-0.5">
                    This item has been purchased by another collector.
                  </p>
                </div>
              </div>
            ) : isLive ? (
              <>
                {isAuthenticated && isRole('seller') && (
                  <p className="font-sans text-xs text-olive mb-3">
                    You are signed in as a seller. Buyer account required to purchase.
                  </p>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddCart}
                  className="btn-primary w-full py-4 text-sm mb-3"
                  aria-busy={adding}
                >
                  <ShoppingBag size={16} />
                  {adding ? 'Adding…' : 'Add to Cart'}
                </button>
                {cartMsg && (
                  <div className={`flex items-center gap-2 p-3 text-sm font-sans border ${
                    cartMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {cartMsg.type === 'success'
                      ? <CheckCircle size={15} />
                      : <AlertTriangle size={15} />
                    }
                    {cartMsg.text}
                    {cartMsg.type === 'success' && (
                      <Link to="/cart" className="ml-auto underline-gold hover:text-sepia text-xs">
                        View Cart →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200">
                <p className="font-sans text-sm text-amber-800">
                  This listing is currently under review and not yet available for purchase.
                </p>
              </div>
            )}

            {/* Back link */}
            <button onClick={() => navigate(-1)}
              className="btn-ghost mt-6 flex items-center gap-2 self-start">
              <ArrowLeft size={14} /> Back to Browse
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
