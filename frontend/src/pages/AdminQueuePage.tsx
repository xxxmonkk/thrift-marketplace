import { useState, useEffect } from 'react';
import { Shield, Check, X, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { getAdminListings, reviewListing } from '../api/admin';
import type { AdminListing, ListingStatus } from '../types/api';
import { ConditionBadge, EraBadge } from '../components/common/Badge';

export function AdminQueuePage() {
  const [filterStatus, setFilterStatus] = useState<ListingStatus>('pending');
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Review modal state
  const [activeItem, setActiveItem] = useState<AdminListing | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'changes_requested'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminListings(filterStatus);
      setListings(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load items for moderation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filterStatus]);

  const handleOpenReview = (item: AdminListing, action: 'approve' | 'reject' | 'changes_requested') => {
    setActiveItem(item);
    setReviewAction(action);
    setRejectionReason('');
  };

  const submitReview = async () => {
    if (!activeItem) return;
    setActionLoadingId(activeItem.id);
    const decision: 'approved' | 'rejected' | 'changes_requested' =
      reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'changes_requested';
    try {
      await reviewListing(activeItem.id, {
        decision,
        reason: decision !== 'approved' ? rejectionReason : undefined,
      });
      setActiveItem(null);
      fetchQueue();
    } catch (err: any) {
      alert(`Error reviewing item: ${err.message || 'Something went wrong'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="section-container py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-walnut gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold/80 block mb-1">
            Curation Oversight
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-ivory font-light flex items-center gap-3">
            <Shield className="text-gold" size={32} /> Curatorial Review Queue
          </h1>
          <p className="font-sans text-sm text-parchment/60 mt-1">
            Review submissions to ensure preservation authenticity, proper metadata, and standard provenance.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 bg-espresso p-1 border border-walnut rounded">
          {(['pending', 'live', 'rejected', 'changes_requested'] as ListingStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`font-sans text-xs capitalize px-3 py-1.5 rounded transition-colors ${
                filterStatus === st
                  ? 'bg-gold text-espresso font-semibold'
                  : 'text-parchment/70 hover:text-ivory'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-parchment/60 font-sans">
          Loading catalogue queue...
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-espresso/60 border border-walnut my-8 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-ivory mb-2">Error loading curation queue</p>
          <p className="font-sans text-sm text-parchment/60 mb-6">{error}</p>
          <button onClick={fetchQueue} className="btn-secondary inline-flex items-center gap-2 text-xs">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-walnut my-8 bg-espresso/20">
          <Shield className="w-12 h-12 text-parchment/30 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-ivory mb-2">Queue is Clear</h2>
          <p className="font-sans text-sm text-parchment/60 max-w-md mx-auto">
            No items are currently marked as '{filterStatus}'.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-walnut/50 mt-8 border border-walnut bg-espresso/30 rounded">
          {listings.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-44 h-44 shrink-0 bg-charcoal rounded overflow-hidden border border-walnut">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-sans text-xs font-semibold px-2 py-0.5 rounded bg-walnut/60 text-gold">
                    ID #{item.id}
                  </span>
                  {item.era && <EraBadge era={item.era} />}
                  {item.item_condition && <ConditionBadge condition={item.item_condition} />}
                  <span className="font-sans text-xs text-parchment/40">
                    Seller: <strong className="text-parchment/80">{item.seller_name || 'Curator'}</strong>
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-ivory mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-parchment/70 mb-4 whitespace-pre-wrap">
                  {item.description}
                </p>

                <div className="font-serif text-xl text-gold font-medium mb-4">
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </div>

                {item.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleOpenReview(item, 'approve')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/40 rounded text-xs font-sans font-medium transition-colors"
                    >
                      <Check size={14} /> Approve for Gallery
                    </button>
                    <button
                      onClick={() => handleOpenReview(item, 'changes_requested')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600/40 rounded text-xs font-sans font-medium transition-colors"
                    >
                      <MessageSquare size={14} /> Request Revision
                    </button>
                    <button
                      onClick={() => handleOpenReview(item, 'reject')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/40 rounded text-xs font-sans font-medium transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
          <div className="bg-espresso border border-walnut max-w-md w-full p-6 shadow-vintage-lg rounded">
            <h3 className="font-serif text-2xl text-ivory mb-2 capitalize">
              {reviewAction.replace('_', ' ')} Item
            </h3>
            <p className="font-sans text-xs text-parchment/60 mb-4">
              "{activeItem.title}"
            </p>

            {reviewAction !== 'approve' ? (
              <div className="mb-4">
                <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
                  Feedback / Reason for Seller *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain what needs adjustment or why this item was refused..."
                  className="w-full bg-charcoal border border-walnut px-3 py-2 text-ivory font-sans text-sm focus:outline-none focus:border-gold"
                />
              </div>
            ) : (
              <p className="font-sans text-sm text-parchment/80 mb-6">
                Are you sure you want to approve this piece? It will immediately become visible to all buyers in the live archive.
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveItem(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={actionLoadingId === activeItem.id || (reviewAction !== 'approve' && !rejectionReason.trim())}
                className="btn-primary text-xs disabled:opacity-50"
              >
                {actionLoadingId === activeItem.id ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
