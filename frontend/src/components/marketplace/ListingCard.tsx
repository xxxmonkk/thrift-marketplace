import React from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import type { Listing } from '../../types/api';
import { ConditionBadge, EraBadge } from '../common/Badge';

// Format price in INR
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ListingCardProps {
  listing: Listing;
  /** If true, show status badge (useful for seller dashboard) */
  showStatus?: boolean;
}

// Safe image with onError fallback — prevents broken image icons
function CardImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ivory">
        <ImageOff size={32} className="text-olive/40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover img-vintage group-hover:scale-[1.03] transition-transform duration-500"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function ListingCard({ listing, showStatus = false }: ListingCardProps) {
  const isSold = listing.status === 'sold';

  return (
    <Link
      to={`/listings/${listing.id}`}
      className={`listing-card block group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        isSold ? 'opacity-75' : ''
      }`}
      aria-label={`${listing.title} — ${formatPrice(listing.price)}${isSold ? ' (Sold)' : ''}`}
    >
      {/* Image area */}
      <div className="relative overflow-hidden aspect-[4/3] bg-ivory">
        <CardImage src={listing.image_url} alt={listing.title} />

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-espresso/60 flex items-center justify-center">
            <span className="font-serif italic text-parchment text-lg border border-parchment/50 px-4 py-1">
              Sold
            </span>
          </div>
        )}

        {/* Era badge top-left */}
        {listing.era && (
          <div className="absolute top-2 left-2">
            <EraBadge era={listing.era} />
          </div>
        )}

        {/* Catalogue number top-right */}
        <div className="absolute top-2 right-2">
          <span className="font-sans text-[10px] text-parchment/60 bg-espresso/50 px-1.5 py-0.5">
            #{listing.id.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="label-text text-olive mb-1">{listing.category_name}</p>

        <h3 className="font-serif text-base font-semibold text-espresso leading-snug line-clamp-2 mb-2 group-hover:text-sepia transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-sans text-lg font-semibold text-espresso">
            {formatPrice(listing.price)}
          </span>
          <ConditionBadge condition={listing.item_condition} />
        </div>

        {showStatus && (
          <div className="mt-2">
            <span
              className={`badge text-xs ${
                listing.status === 'live'
                  ? 'badge-live'
                  : listing.status === 'pending'
                  ? 'badge-pending'
                  : listing.status === 'sold'
                  ? 'badge-sold'
                  : listing.status === 'rejected'
                  ? 'badge-rejected'
                  : listing.status === 'changes_requested'
                  ? 'badge-changes'
                  : 'badge-gold'
              }`}
            >
              {listing.status === 'changes_requested'
                ? 'Changes Requested'
                : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Decorative bottom line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  );
}

// Grid wrapper for consistent layout
export function ListingGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
