import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { getListings } from '../api/listings';
import { getCategories } from '../api/categories';
import type { Category, Listing, ListingFilters } from '../types/api';
import { ListingCard, ListingGrid } from '../components/marketplace/ListingCard';
import { ListingCardSkeleton } from '../components/common/Skeleton';
import mockListings from '../mockData';

const ERAS = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s'];
const CONDITIONS = [
  { value: 'like new', label: 'Like New' },
  { value: 'good',     label: 'Good'     },
  { value: 'fair',     label: 'Fair'     },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read filters from URL
  const q           = searchParams.get('q')           ?? '';
  const category    = searchParams.get('category')    ?? '';
  const era         = searchParams.get('era')         ?? '';
  const minPrice    = searchParams.get('min_price')   ?? '';
  const maxPrice    = searchParams.get('max_price')   ?? '';

  // Local state for text input (debounced)
  const [searchInput, setSearchInput] = useState(q);

  const fetchListings = useCallback(async (filters: ListingFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getListings(filters);
      setListings(data);
      setUsingMock(false);
    } catch (err) {
      // Try mock fallback
      try {
        let mock = mockListings as Listing[];
        if (filters.q) mock = mock.filter((l) => l.title.toLowerCase().includes(filters.q!.toLowerCase()));
        if (filters.category) mock = mock.filter((l) => String(l.category_id) === String(filters.category) || l.category_name.toLowerCase() === filters.category!.toLowerCase());
        if (filters.era) mock = mock.filter((l) => l.era?.toLowerCase() === filters.era!.toLowerCase());
        if (filters.min_price) mock = mock.filter((l) => l.price >= Number(filters.min_price));
        if (filters.max_price) mock = mock.filter((l) => l.price <= Number(filters.max_price));
        setListings(mock);
        setUsingMock(true);
      } catch {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const filters: ListingFilters = {};
    if (q)        filters.q        = q;
    if (category) filters.category = category;
    if (era)      filters.era      = era;
    if (minPrice) filters.min_price = Number(minPrice);
    if (maxPrice) filters.max_price = Number(maxPrice);
    fetchListings(filters);
  }, [q, category, era, minPrice, maxPrice, fetchListings]);

  // Debounced search input
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (val) next.set('q', val); else next.delete('q');
      setSearchParams(next);
    }, 400);
  };

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasFilters = !!(q || category || era || minPrice || maxPrice);

  // Client-side sort (the API returns newest first, we allow price sort on top)
  const [sortBy, setSortBy] = useState('default');
  const sorted = [...listings].sort((a, b) => {
    if (sortBy === 'price_asc')  return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  const displayedCats = categories.length > 0 ? categories : [
    { id: 1, name: 'Cameras' }, { id: 2, name: 'Shoes' }, { id: 3, name: 'Bags' },
    { id: 4, name: 'Clothing' }, { id: 5, name: 'Accessories' },
  ];

  return (
    <main>
      {/* Page Header */}
      <div className="bg-espresso py-12">
        <div className="section-container">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 font-sans text-xs text-parchment/40">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-parchment/70">Browse</li>
            </ol>
          </nav>
          <h1 className="editorial-heading text-4xl text-parchment mb-2">The Marketplace</h1>
          <p className="font-sans text-sm text-parchment/50">
            Curator-reviewed vintage listings, fresh every day.
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search listings…"
              className="input-field pl-9 pr-9"
              aria-label="Search listings"
            />
            {searchInput && (
              <button onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-olive hover:text-espresso transition-colors"
                aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFiltersOpen((p) => !p)}
              className={`btn-secondary flex items-center gap-2 ${hasFilters ? 'border-gold text-gold' : ''}`}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasFilters && <span className="bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">!</span>}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field pl-3 pr-8 py-2"
                aria-label="Sort listings"
              >
                <option value="default">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-olive pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="bg-ivory border border-border-soft p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Category */}
              <div>
                <label className="form-label">Category</label>
                <select className="select-field" value={category}
                  onChange={(e) => setFilter('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {displayedCats.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>
              {/* Era */}
              <div>
                <label className="form-label">Era</label>
                <select className="select-field" value={era}
                  onChange={(e) => setFilter('era', e.target.value)}>
                  <option value="">Any Era</option>
                  {ERAS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              {/* Min Price */}
              <div>
                <label className="form-label">Min Price (₹)</label>
                <input type="number" min={0} placeholder="0" className="input-field"
                  value={minPrice}
                  onChange={(e) => setFilter('min_price', e.target.value)} />
              </div>
              {/* Max Price */}
              <div>
                <label className="form-label">Max Price (₹)</label>
                <input type="number" min={0} placeholder="Any" className="input-field"
                  value={maxPrice}
                  onChange={(e) => setFilter('max_price', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="label-text text-olive">Active filters:</span>
            {q && (
              <span className="badge-gold flex items-center gap-1">
                "{q}"
                <button onClick={() => handleSearchChange('')} aria-label="Remove search filter"><X size={11} /></button>
              </span>
            )}
            {category && (
              <span className="badge-gold flex items-center gap-1">
                {displayedCats.find((c) => String(c.id) === category)?.name ?? category}
                <button onClick={() => setFilter('category', '')} aria-label="Remove category filter"><X size={11} /></button>
              </span>
            )}
            {era && (
              <span className="badge-gold flex items-center gap-1">
                {era}
                <button onClick={() => setFilter('era', '')} aria-label="Remove era filter"><X size={11} /></button>
              </span>
            )}
            {minPrice && (
              <span className="badge-gold flex items-center gap-1">
                Min {formatPrice(Number(minPrice))}
                <button onClick={() => setFilter('min_price', '')} aria-label="Remove min price"><X size={11} /></button>
              </span>
            )}
            {maxPrice && (
              <span className="badge-gold flex items-center gap-1">
                Max {formatPrice(Number(maxPrice))}
                <button onClick={() => setFilter('max_price', '')} aria-label="Remove max price"><X size={11} /></button>
              </span>
            )}
            <button onClick={clearAll} className="btn-ghost text-xs py-1 px-2">Clear all</button>
          </div>
        )}

        {/* Offline indicator */}
        {usingMock && (
          <div className="flex items-center gap-2 p-3 bg-walnut/10 border border-olive/20 mb-6 font-sans text-xs text-olive">
            <AlertTriangle size={14} />
            Demo mode — backend server offline. Showing sample data.
          </div>
        )}

        {/* Result count */}
        {!isLoading && (
          <p className="font-sans text-xs text-olive mb-6">
            {sorted.length === 0
              ? 'No listings found'
              : `${sorted.length} listing${sorted.length === 1 ? '' : 's'} found`}
          </p>
        )}

        {/* Grid */}
        {error ? (
          <div className="text-center py-20">
            <AlertTriangle size={32} className="text-red-600 mx-auto mb-4" />
            <p className="editorial-heading text-xl text-espresso mb-2">Failed to Load Listings</p>
            <p className="font-sans text-sm text-olive mb-6">{error}</p>
            <button onClick={() => fetchListings({})} className="btn-secondary flex items-center gap-2 mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : isLoading ? (
          <ListingGrid>
            {Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </ListingGrid>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="display-heading text-5xl text-olive/30 mb-4">∅</p>
            <p className="editorial-heading text-xl text-espresso mb-2">No Treasures Found</p>
            <p className="font-sans text-sm text-olive mb-6">
              Try adjusting your search or filters to discover more listings.
            </p>
            <button onClick={clearAll} className="btn-secondary mx-auto">Clear Filters</button>
          </div>
        ) : (
          <ListingGrid>
            {sorted.map((l) => <ListingCard key={l.id} listing={l} />)}
          </ListingGrid>
        )}
      </div>
    </main>
  );
}
