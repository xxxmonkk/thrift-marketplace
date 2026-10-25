import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  PlusSquare,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CATEGORIES = [
  { name: 'Cameras',     id: '1' },
  { name: 'Shoes',       id: '2' },
  { name: 'Bags',        id: '3' },
  { name: 'Clothing',    id: '4' },
  { name: 'Accessories', id: '5' },
];

export function Navbar() {
  const { isAuthenticated, user, logout, isRole } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const catRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserOpen(false);
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link';

  return (
    <>
      {/* Announcement Strip */}
      <div className="announcement-strip">
        Every object carries a story.&nbsp;&nbsp;
        <span className="text-gold">Discover yours.</span>
      </div>

      {/* Main Navbar */}
      <header className="bg-espresso border-b border-walnut sticky top-0 z-40">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">

            {/* Wordmark */}
            <Link
              to="/"
              className="display-heading text-2xl text-gold tracking-[0.2em] hover:text-ivory transition-colors"
              aria-label="Salixir — Home"
            >
              SALIXIR
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/browse" className={navLinkClass}>
                Browse
              </NavLink>

              {/* Categories Dropdown */}
              <div ref={catRef} className="relative">
                <button
                  onClick={() => setCatOpen((p) => !p)}
                  className="nav-link flex items-center gap-1"
                  aria-expanded={catOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-150 ${catOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {catOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-espresso border border-walnut shadow-vintage-lg py-1 animate-fade-in">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/browse?category=${cat.id}`}
                        onClick={() => setCatOpen(false)}
                        className="block px-4 py-2 font-sans text-sm text-parchment/80 hover:text-gold hover:bg-walnut/30 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen((p) => !p)}
                aria-label="Toggle search"
                className="nav-link"
              >
                <Search size={18} />
              </button>

              {/* Cart (buyers and guests) */}
              {(!isAuthenticated || isRole('buyer')) && (
                <Link to="/cart" className="nav-link relative" aria-label={`Cart, ${itemCount} items`}>
                  <ShoppingBag size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gold text-espresso text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Account */}
              {isAuthenticated ? (
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => setUserOpen((p) => !p)}
                    className="nav-link flex items-center gap-2"
                    aria-expanded={userOpen}
                    aria-haspopup="true"
                  >
                    <User size={18} />
                    <span className="max-w-[80px] truncate text-xs">{user?.name}</span>
                    <ChevronDown size={12} className={`transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-espresso border border-walnut shadow-vintage-lg py-1 animate-fade-in">
                      <div className="px-4 py-2 border-b border-walnut/50">
                        <p className="font-sans text-xs text-parchment/50 uppercase tracking-widest">Signed in as</p>
                        <p className="font-sans text-sm text-gold font-medium truncate">{user?.name}</p>
                        <p className="font-sans text-xs text-parchment/40 capitalize">{user?.role}</p>
                      </div>

                      {isRole('buyer') && (
                        <Link to="/orders" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-parchment/80 hover:text-gold hover:bg-walnut/30 transition-colors">
                          <Package size={14} /> My Orders
                        </Link>
                      )}
                      {isRole('seller') && (
                        <>
                          <Link to="/seller" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-parchment/80 hover:text-gold hover:bg-walnut/30 transition-colors">
                            <LayoutDashboard size={14} /> My Listings
                          </Link>
                          <Link to="/seller/create" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-parchment/80 hover:text-gold hover:bg-walnut/30 transition-colors">
                            <PlusSquare size={14} /> New Listing
                          </Link>
                        </>
                      )}
                      {isRole('admin') && (
                        <Link to="/admin" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 font-sans text-sm text-parchment/80 hover:text-gold hover:bg-walnut/30 transition-colors">
                          <Shield size={14} /> Admin Queue
                        </Link>
                      )}
                      <div className="border-t border-walnut/50 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 font-sans text-sm text-red-400 hover:text-red-300 hover:bg-walnut/30 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="nav-link">Sign In</Link>
                  <Link to="/signup" className="btn-primary py-2 px-4 text-xs">Join</Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden text-parchment/80 hover:text-gold transition-colors"
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Search Bar (desktop) */}
          {searchOpen && (
            <div className="hidden md:block pb-4 animate-slide-up">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  autoFocus
                  type="search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search vintage treasures…"
                  className="flex-1 px-4 py-2 bg-walnut/30 border border-walnut text-parchment placeholder-parchment/30 font-sans text-sm focus:outline-none focus:border-gold"
                />
                <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="btn-ghost py-2 px-3">
                  <X size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-espresso border-t border-walnut animate-slide-up">
            <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                  type="search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 px-3 py-2 bg-walnut/30 border border-walnut text-parchment placeholder-parchment/30 font-sans text-sm focus:outline-none focus:border-gold"
                />
                <button type="submit" className="btn-primary py-2 px-3 text-sm">Go</button>
              </form>

              <Link to="/" onClick={() => setMobileOpen(false)}
                className="block nav-link py-2">Home</Link>
              <Link to="/browse" onClick={() => setMobileOpen(false)}
                className="block nav-link py-2">Browse</Link>

              <div className="py-2">
                <p className="label-text text-parchment/40 mb-2">Categories</p>
                <div className="space-y-1 pl-2">
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.id} to={`/browse?category=${cat.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="block nav-link py-1 text-xs">{cat.name}</Link>
                  ))}
                </div>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-walnut/50 pt-3">
                    <p className="font-sans text-xs text-parchment/40 mb-2">
                      {user?.name} · <span className="capitalize">{user?.role}</span>
                    </p>
                    {isRole('buyer') && (
                      <>
                        <Link to="/cart" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 nav-link py-2">
                          <ShoppingBag size={15} /> Cart {itemCount > 0 && `(${itemCount})`}
                        </Link>
                        <Link to="/orders" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 nav-link py-2">
                          <Package size={15} /> My Orders
                        </Link>
                      </>
                    )}
                    {isRole('seller') && (
                      <>
                        <Link to="/seller" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 nav-link py-2">
                          <LayoutDashboard size={15} /> My Listings
                        </Link>
                        <Link to="/seller/create" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 nav-link py-2">
                          <PlusSquare size={15} /> New Listing
                        </Link>
                      </>
                    )}
                    {isRole('admin') && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 nav-link py-2">
                        <Shield size={15} /> Admin Queue
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 font-sans text-sm text-red-400 py-2 mt-2">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 border-t border-walnut/50 space-y-3">
                  <Link to="/cart" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 nav-link py-1">
                    <ShoppingBag size={15} /> Cart {itemCount > 0 && `(${itemCount})`}
                  </Link>
                  <div className="flex gap-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 py-2 text-center text-sm">Sign In</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 py-2 text-center text-sm">Join</Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
