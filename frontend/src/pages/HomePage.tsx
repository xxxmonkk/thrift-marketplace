import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Star } from 'lucide-react';
import { getListings } from '../api/listings';
import type { Listing } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { ListingCard, ListingGrid } from '../components/marketplace/ListingCard';
import { ListingCardSkeleton } from '../components/common/Skeleton';
import mockListings from '../mockData';

// ─── Verified Unsplash images (direct CDN, no API key, CORS-safe) ──────────

/** Hero primary — curated vintage garments & retro clothing in warm editorial light */
const HERO_IMG_PRIMARY =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=85&w=1200';

/** Hero secondary decorative — vintage leather bag & satchel */
const HERO_IMG_BAG =
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600';

/** Hero decorative — vintage classic film camera */
const HERO_IMG_CAMERA =
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600';

/** Editorial section — warm vintage clothing atelier */
const EDITORIAL_IMG =
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=85&w=900';

const COLLECTIONS = [
  {
    name: 'Vintage Cameras',
    caption: 'Timeless lenses & shutters',
    href: '/browse?category=1',
    img: 'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?auto=format&fit=crop&q=80&w=600',
    imgAlt: 'Antique film camera with leather body and brass lens',
  },
  {
    name: 'Shoes & Heels',
    caption: 'Walk through history',
    href: '/browse?category=2',
    img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
    imgAlt: 'Classic vintage leather shoes on warm neutral background',
  },
  {
    name: 'Bags & Satchels',
    caption: 'Carry it with character',
    href: '/browse?category=3',
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
    imgAlt: 'Aged leather satchel with brass clasp on textured surface',
  },
  {
    name: 'Vintage Clothing',
    caption: 'Fashion from another era',
    href: '/browse?category=4',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600',
    imgAlt: 'Vintage tailored garments in warm editorial setting',
  },
  {
    name: 'Accessories',
    caption: 'The finishing touch',
    href: '/browse?category=5',
    img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600',
    imgAlt: 'Vintage luxury leather watch and classic timepiece accessories',
  },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Safe image with graceful fallback (no broken-image icon, no infinite loop) ──
interface SafeImgProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
}

function SafeImg({ src, alt, className, loading = 'lazy', fallbackSrc }: SafeImgProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`${className ?? ''} flex flex-col items-center justify-center bg-espresso/80 border border-gold/20 p-3`}
        role="img"
        aria-label={alt}
      >
        <span className="text-gold/40 text-lg mb-1">✦</span>
        <span className="font-serif italic text-[11px] text-parchment/60 text-center px-2 leading-snug">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
}

export function HomePage() {
  const { isAuthenticated, isRole } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getListings()
      .then((data) => {
        setListings(data.slice(0, 8));
        setUsingMock(false);
      })
      .catch(() => {
        setListings((mockListings as Listing[]).slice(0, 8));
        setUsingMock(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden bg-espresso"
        aria-label="Hero"
      >
        {/* Content */}
        <div className="relative z-10 section-container py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left: text ── */}
            <div className="max-w-xl">
              <p className="label-text text-gold/70 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-gold/50" />
                Curated Vintage Collection · Est. 2024
              </p>

              <h1
                className="display-heading text-5xl md:text-6xl lg:text-7xl text-parchment mb-6"
                style={{ lineHeight: 1.08 }}
              >
                Some Things Are
                <br />
                Too Timeless{' '}
                <em className="text-gold not-italic font-light">
                  To Be Forgotten.
                </em>
              </h1>

              <p className="font-sans text-base text-parchment/65 mb-10 leading-relaxed max-w-[420px]">
                Discover extraordinary vintage finds, forgotten treasures, and enduring
                pieces with stories of their own. Every object reviewed by our curators.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse" className="btn-primary px-8 py-3.5 text-sm">
                  Explore the Collection
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/browse?era=1990s"
                  className="btn-secondary px-8 py-3.5 text-sm border-parchment/30 text-parchment/70 hover:border-gold hover:text-gold"
                >
                  Browse by Era
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 mt-12">
                {[
                  { icon: Shield, text: 'Curator-reviewed listings' },
                  { icon: Clock, text: 'Secure checkout' },
                  { icon: Star, text: 'Authentic vintage pieces' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-parchment/50 font-sans text-xs"
                  >
                    <Icon size={13} className="text-gold/60" />
                    {text}
                  </div>
                ))}
              </div>

              {/* Mobile hero image showcase (visible on mobile only, below trust indicators) */}
              <div className="mt-10 md:hidden flex flex-col gap-3">
                <div
                  className="relative overflow-hidden shadow-vintage-lg border border-gold/25 w-full max-w-sm mx-auto"
                  style={{ aspectRatio: '16/10' }}
                >
                  <SafeImg
                    src={HERO_IMG_PRIMARY}
                    alt="Curated collection of vintage retro clothing garments on wooden hangers"
                    className="w-full h-full object-cover img-vintage"
                    loading="eager"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ boxShadow: 'inset 0 0 40px rgba(33,23,19,0.6)' }}
                  />
                  <span className="absolute bottom-2 left-2 font-serif italic text-xs text-parchment/90 bg-espresso/80 px-2 py-0.5 border border-gold/20">
                    Vintage Fashion Archive
                  </span>
                </div>

                <div className="flex justify-center gap-3 w-full max-w-sm mx-auto">
                  <div className="w-1/2 aspect-square overflow-hidden shadow-vintage border border-gold/20 relative">
                    <SafeImg
                      src={HERO_IMG_BAG}
                      alt="Aged vintage leather satchel bag"
                      className="w-full h-full object-cover img-vintage"
                      loading="eager"
                    />
                    <span className="absolute bottom-1 left-1 font-serif italic text-[10px] text-parchment/80 bg-espresso/85 px-1.5 py-0.5">
                      Leather Goods
                    </span>
                  </div>
                  <div className="w-1/2 aspect-square overflow-hidden shadow-vintage border border-gold/20 relative">
                    <SafeImg
                      src={HERO_IMG_CAMERA}
                      alt="Classic vintage film camera"
                      className="w-full h-full object-cover img-vintage"
                      loading="eager"
                    />
                    <span className="absolute bottom-1 left-1 font-serif italic text-[10px] text-parchment/80 bg-espresso/85 px-1.5 py-0.5">
                      Classic Optics
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: image composition (desktop only) ── */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-[460px]">

                {/* Primary image — Large vintage clothing */}
                <div
                  className="relative overflow-hidden shadow-vintage-lg border border-gold/20"
                  style={{ aspectRatio: '4/5' }}
                >
                  <SafeImg
                    src={HERO_IMG_PRIMARY}
                    alt="Curated collection of vintage retro clothing garments on wooden hangers"
                    className="w-full h-full object-cover img-vintage"
                    loading="eager"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ boxShadow: 'inset 0 0 60px rgba(33,23,19,0.55)' }}
                  />
                </div>

                {/* Decorative floating square images — Vintage Bag & Camera near lower-left */}
                <div className="absolute -bottom-10 -left-12 flex items-center gap-3 z-20">
                  {/* Small square: Vintage Bag */}
                  <div
                    className="w-28 h-28 sm:w-32 sm:h-32 overflow-hidden shadow-vintage-lg border border-gold/30 bg-espresso relative group"
                  >
                    <SafeImg
                      src={HERO_IMG_BAG}
                      alt="Aged vintage leather satchel bag with brass clasp"
                      className="w-full h-full object-cover img-vintage transition-transform duration-500 group-hover:scale-105"
                      loading="eager"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ boxShadow: 'inset 0 0 20px rgba(33,23,19,0.5)' }}
                    />
                    <span className="absolute bottom-1.5 left-2 font-serif italic text-[10px] text-parchment/80 bg-espresso/80 px-1.5 py-0.5 border border-gold/20">
                      Leather Goods
                    </span>
                  </div>

                  {/* Small square: Vintage Camera */}
                  <div
                    className="w-28 h-28 sm:w-32 sm:h-32 overflow-hidden shadow-vintage-lg border border-gold/30 bg-espresso relative group"
                  >
                    <SafeImg
                      src={HERO_IMG_CAMERA}
                      alt="Classic vintage film camera with brass shutter"
                      className="w-full h-full object-cover img-vintage transition-transform duration-500 group-hover:scale-105"
                      loading="eager"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ boxShadow: 'inset 0 0 20px rgba(33,23,19,0.5)' }}
                    />
                    <span className="absolute bottom-1.5 left-2 font-serif italic text-[10px] text-parchment/80 bg-espresso/80 px-1.5 py-0.5 border border-gold/20">
                      Classic Optics
                    </span>
                  </div>
                </div>

                {/* Gold frame accent */}
                <div
                  className="absolute -inset-3 border border-gold/15 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Floating caption */}
                <div
                  className="absolute right-0 bg-espresso/90 border-l-2 border-gold/60 px-3 py-2 max-w-[160px] shadow-vintage"
                  style={{ bottom: '4rem', transform: 'translateX(8px)' }}
                >
                  <p className="font-serif italic text-parchment/80 text-[11px] leading-snug">
                    Pieces authenticated &amp; reviewed by our curators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner ornaments */}
        <div
          className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-gold/30"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-gold/30"
          aria-hidden="true"
        />

        {/* Mobile faint background */}
        <div
          className="absolute inset-0 md:hidden pointer-events-none"
          style={{ opacity: 0.12 }}
        >
          <SafeImg
            src={HERO_IMG_PRIMARY}
            alt=""
            className="w-full h-full object-cover img-vintage"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/60" />
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ──────────────────────────── */}
      <section className="bg-ivory page-section" aria-labelledby="collections-heading">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="label-text text-sepia/70 mb-3">Curated by Category</p>
            <h2
              id="collections-heading"
              className="editorial-heading text-4xl text-espresso mb-4"
            >
              Explore the Archive
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="text-gold text-xl">✦</span>
            </div>
            <p className="font-sans text-sm text-olive max-w-md mx-auto mt-2">
              Five curated collections spanning decades of craftsmanship and style.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {COLLECTIONS.map((col) => (
              <Link
                key={col.name}
                to={col.href}
                className="group block relative overflow-hidden bg-espresso focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{ aspectRatio: '3/4' }}
                aria-label={`Browse ${col.name}`}
              >
                <SafeImg
                  src={col.img}
                  alt={col.imgAlt}
                  className="w-full h-full object-cover img-vintage group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/92 via-espresso/25 to-transparent" />

                {/* Hover gold border */}
                <div
                  className="absolute inset-0 border-2 border-transparent group-hover:border-gold/40 transition-colors duration-300 pointer-events-none"
                />

                {/* Category label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif font-semibold text-parchment text-sm leading-tight">
                    {col.name}
                  </p>
                  <p className="font-sans text-[11px] text-parchment/55 mt-0.5">
                    {col.caption}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-sans text-[10px] tracking-wider uppercase">Browse</span>
                    <ArrowRight size={10} />
                  </div>
                </div>

                {/* Corner ornament */}
                <div
                  className="absolute top-2 right-2 w-5 h-5 border-t border-r border-transparent group-hover:border-gold/55 transition-colors duration-300"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="bg-parchment page-section" aria-labelledby="featured-heading">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="label-text text-sepia/70 mb-2">Recently Curated</p>
              <h2 id="featured-heading" className="editorial-heading text-3xl text-espresso">
                New Arrivals
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {usingMock && (
                <span className="font-sans text-xs text-olive bg-walnut/10 border border-olive/20 px-3 py-1">
                  ⚡ Demo mode — backend offline
                </span>
              )}
              <Link to="/browse" className="btn-ghost flex items-center gap-2">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <ListingGrid>
              {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </ListingGrid>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-serif italic text-olive text-lg">No listings available yet.</p>
              <p className="font-sans text-sm text-olive/60 mt-2">
                Check back soon for new arrivals.
              </p>
            </div>
          ) : (
            <ListingGrid>
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </ListingGrid>
          )}
        </div>
      </section>

      {/* ── EDITORIAL SECTION ─────────────────────────────── */}
      <section
        className="bg-espresso page-section overflow-hidden"
        aria-labelledby="editorial-heading"
      >
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <p className="label-text text-gold/60 mb-4">The Salixir Philosophy</p>
              <h2
                id="editorial-heading"
                className="display-heading text-4xl md:text-5xl text-parchment mb-6 leading-tight"
              >
                Every Object Carries
                <br />
                <em className="text-gold not-italic font-light">a Hidden Story.</em>
              </h2>
              <p className="font-sans text-parchment/60 leading-relaxed mb-4 text-sm">
                We believe that objects outlive their owners, carrying memories and meaning
                across time. A vintage camera captures more than photographs — it carries
                the gaze of everyone who held it.
              </p>
              <p className="font-sans text-parchment/60 leading-relaxed mb-8 text-sm">
                Salixir was built for the collectors, the romantics, and the sustainably-minded —
                those who understand that the most extraordinary things are often the ones
                with a past.
              </p>
              <Link to="/browse" className="btn-primary px-8 py-3 text-sm">
                Start Discovering
              </Link>
            </div>

            {/* Art */}
            <div className="relative">
              <div className="absolute -inset-4 border border-gold/10" aria-hidden="true" />
              <div className="relative overflow-hidden">
                <SafeImg
                  src={EDITORIAL_IMG}
                  alt="Warm atelier with vintage garments and golden editorial light"
                  className="w-full max-h-[520px] object-cover img-vintage shadow-vintage-lg"
                />
                <div
                  className="absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 60px rgba(33,23,19,0.4)' }}
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-espresso/85 p-3 border-l-2 border-gold/50">
                <p className="font-serif italic text-parchment/80 text-xs">
                  "The most extraordinary things are often the ones with a past."
                </p>
                <p className="font-sans text-parchment/40 text-[10px] mt-1">
                  The Salixir Archive · Est. 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICE SHOWCASE ────────────────────────────────── */}
      {!isLoading && listings.length > 0 && (
        <section className="bg-ivory py-12" aria-label="Price range highlights">
          <div className="section-container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Under ₹1,000', range: '?max_price=1000', subtitle: 'Affordable finds' },
                {
                  label: '₹1,000–₹3,000',
                  range: '?min_price=1000&max_price=3000',
                  subtitle: 'Mid-range treasures',
                },
                { label: 'Above ₹3,000', range: '?min_price=3000', subtitle: 'Premium collectibles' },
              ].map(({ label, range, subtitle }) => (
                <Link
                  key={label}
                  to={`/browse${range}`}
                  className="group block border border-border-soft bg-parchment p-6 hover:border-gold hover:shadow-vintage transition-all duration-200"
                >
                  <p className="editorial-heading text-2xl text-espresso mb-1 group-hover:text-sepia transition-colors">
                    {label}
                  </p>
                  <p className="font-sans text-sm text-olive">{subtitle}</p>
                  <div className="flex items-center gap-1 mt-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-sans text-xs">Browse</span>
                    <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="bg-walnut py-16" aria-label="Seller call to action">
        <div className="section-container text-center">
          <h2 className="editorial-heading text-3xl text-parchment mb-3">
            Have Vintage Treasures to Share?
          </h2>
          <p className="font-sans text-parchment/60 mb-8 text-sm max-w-md mx-auto">
            Become a Salixir seller and connect your vintage items with collectors who will
            love them. All listings are reviewed by our curators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated && isRole('seller') ? '/seller/create' : '/signup?role=seller'}
              className="btn-primary px-8 py-3"
            >
              Start Selling
            </Link>
            <Link
              to="/browse"
              className="btn-secondary border-parchment/30 text-parchment/70 hover:border-gold hover:text-gold px-8 py-3"
            >
              Explore First
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
