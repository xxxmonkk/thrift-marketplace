import { Link } from 'react-router-dom';

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-walnut" aria-label="Site footer">
      {/* Ornamental top divider */}
      <div className="section-container pt-12 pb-3">
        <div className="ornament-divider">
          <span className="text-gold text-xs tracking-widest font-sans uppercase">Salixir</span>
        </div>
      </div>

      <div className="section-container pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="display-heading text-3xl text-gold tracking-[0.2em] mb-3">SALIXIR</p>
            <p className="font-serif italic text-parchment/60 text-sm leading-relaxed mb-4">
              "Objects with a past.<br />Treasures for a new chapter."
            </p>
            <p className="font-sans text-xs text-olive leading-relaxed">
              A curated marketplace for vintage fashion, accessories, collectibles,
              and second-hand treasures. Every listing is reviewed before going live.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="label-text text-gold/70 mb-4">Browse</h3>
            <ul className="space-y-2">
              {[
                { label: 'All Listings', to: '/browse' },
                { label: 'Cameras',     to: '/browse?category=1' },
                { label: 'Shoes',       to: '/browse?category=2' },
                { label: 'Bags',        to: '/browse?category=3' },
                { label: 'Clothing',    to: '/browse?category=4' },
                { label: 'Accessories', to: '/browse?category=5' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-sans text-sm text-parchment/50 hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="label-text text-gold/70 mb-4">Sellers</h3>
            <ul className="space-y-2">
              {[
                { label: 'My Listings',   to: '/seller'        },
                { label: 'New Listing',   to: '/seller/create' },
                { label: 'Create Account', to: '/signup'        },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-sans text-sm text-parchment/50 hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="label-text text-gold/70 mb-4">Account</h3>
            <ul className="space-y-2">
              {[
                { label: 'Sign In',     to: '/login'  },
                { label: 'Join Salixir', to: '/signup' },
                { label: 'My Orders',   to: '/orders' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-sans text-sm text-parchment/50 hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-walnut/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs text-olive">
            © {YEAR} Salixir. A prototype vintage marketplace.
          </p>
          <p className="font-serif italic text-xs text-olive/60">
            All listings are reviewed by our curators before appearing in the marketplace.
          </p>
        </div>
      </div>
    </footer>
  );
}
