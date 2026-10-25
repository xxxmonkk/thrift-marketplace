// Skeleton loading placeholder
interface SkeletonProps {
  className?: string;
}
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton rounded-sm ${className}`}
    />
  );
}

// Listing card skeleton
export function ListingCardSkeleton() {
  return (
    <div className="listing-card animate-pulse">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-6 w-24 mt-2" />
      </div>
    </div>
  );
}

// Generic content block skeleton
export function ContentSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === rows - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Listing grid skeleton
export function SkeletonListingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
