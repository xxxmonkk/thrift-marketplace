import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../api/client';

// Documented demo credentials from api-contract.md
const DEMO_ACCOUNTS = [
  { label: 'Admin',  email: 'admin@thrift.test',   password: 'admin123',  role: 'admin'  },
  { label: 'Seller', email: 'seller1@thrift.test',  password: 'seller123', role: 'seller' },
  { label: 'Buyer',  email: 'buyer1@thrift.test',   password: 'buyer123',  role: 'buyer'  },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.data.error);
      } else {
        setError('Unable to sign in. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <main className="min-h-screen flex">
      {/* Art panel (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-espresso">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Portrait_of_a_Woman%2C_probably_Maria_Trip_-_Rembrandt_van_Rijn.jpg/600px-Portrait_of_a_Woman%2C_probably_Maria_Trip_-_Rembrandt_van_Rijn.jpg"
          alt="Rembrandt — Portrait of a Woman, atmospheric background"
          className="w-full h-full object-cover object-top img-vintage opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/60 to-espresso/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="display-heading text-5xl text-parchment mb-4">SALIXIR</p>
          <p className="font-serif italic text-parchment/70 text-lg leading-relaxed max-w-xs">
            "Objects with a past.<br />Treasures for a new chapter."
          </p>
          <div className="mt-6 border-l-2 border-gold/50 pl-4">
            <p className="font-sans text-xs text-parchment/40">Rembrandt van Rijn — Portrait of a Woman, c. 1639</p>
            <p className="font-sans text-xs text-parchment/30">Public Domain · Rijksmuseum, Amsterdam</p>
          </div>
        </div>
        {/* Ornamental corner */}
        <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-gold/30" aria-hidden="true" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-gold/30" aria-hidden="true" />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-parchment p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="display-heading text-3xl text-gold tracking-[0.2em]">SALIXIR</Link>
          </div>

          <p className="label-text text-sepia/70 mb-2">Welcome back</p>
          <h1 className="editorial-heading text-3xl text-espresso mb-8">Sign In</h1>

          {/* Demo accounts */}
          <div className="mb-6 p-4 bg-ivory border border-border-soft">
            <p className="label-text text-olive mb-3">Demo Accounts (from docs)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="font-sans text-xs px-3 py-1.5 border border-border-soft hover:border-gold hover:text-gold transition-colors capitalize"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 mb-5">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <p className="font-sans text-sm">{error}</p>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-7">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-olive hover:text-espresso transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5"
              aria-busy={isSubmitting}
            >
              <LogIn size={16} />
              {isSubmitting ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 font-sans text-sm text-center text-olive">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sepia hover:text-gold underline-gold transition-colors font-medium">
              Join Salixir
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
