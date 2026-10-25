import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../api/client';

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [role, setRole]         = useState<'buyer' | 'seller'>(initialRole);
  const [showPw, setShowPw]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                 e.name     = 'Name is required.';
    if (!email.trim())                e.email    = 'Email is required.';
    if (password.length < 6)          e.password = 'Password must be at least 6 characters.';
    if (password !== confirm)         e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      // Redirect based on role
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 0) {
          setApiError('Unable to connect to the authentication server (http://localhost:4000). Please ensure the backend is running.');
        } else {
          setApiError(err.data?.error || err.message || 'Registration failed.');
        }
      } else {
        setApiError('Registration failed. Please check your network connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Art panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-espresso">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Jan_Vermeer_van_Delft_013.jpg/600px-Jan_Vermeer_van_Delft_013.jpg"
          alt="Vermeer — Woman Reading a Letter, atmospheric background"
          className="w-full h-full object-cover img-vintage opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/70 to-espresso/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="display-heading text-5xl text-parchment mb-4">SALIXIR</p>
          <p className="font-serif italic text-parchment/70 text-lg leading-relaxed max-w-xs">
            Join a community of collectors and sellers of extraordinary vintage objects.
          </p>
          <div className="mt-6 border-l-2 border-gold/50 pl-4">
            <p className="font-sans text-xs text-parchment/40">Jan Vermeer — Woman Reading a Letter, c.1663</p>
            <p className="font-sans text-xs text-parchment/30">Public Domain · Rijksmuseum, Amsterdam</p>
          </div>
        </div>
        <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-gold/30" aria-hidden="true" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-gold/30" aria-hidden="true" />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center bg-parchment p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="display-heading text-3xl text-gold tracking-[0.2em]">SALIXIR</Link>
          </div>

          <p className="label-text text-sepia/70 mb-2">Start your collection</p>
          <h1 className="editorial-heading text-3xl text-espresso mb-8">Create Account</h1>

          <form onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 mb-5">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <p className="font-sans text-sm">{apiError}</p>
              </div>
            )}

            {/* Name */}
            <div className="mb-4">
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <input id="reg-name" type="text" autoComplete="name"
                value={name} onChange={(e) => setName(e.target.value)}
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Your Name" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input id="reg-email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pr-11 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-olive hover:text-espresso transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="mb-5">
              <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
              <input id="reg-confirm" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className={`input-field ${errors.confirm ? 'border-red-400' : ''}`}
                placeholder="Repeat password" />
              {errors.confirm && <p className="form-error">{errors.confirm}</p>}
            </div>

            {/* Role selector */}
            <div className="mb-7">
              <p className="form-label">I want to</p>
              <div className="grid grid-cols-2 gap-3">
                {(['buyer', 'seller'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 border text-left transition-all ${
                      role === r
                        ? 'border-gold bg-gold/5 text-espresso'
                        : 'border-border-soft text-olive hover:border-sepia'
                    }`}
                    aria-pressed={role === r}
                  >
                    <p className="font-sans font-medium text-sm capitalize">{r === 'buyer' ? '🛍 Browse & Buy' : '🏷 Sell Items'}</p>
                    <p className="font-sans text-xs mt-0.5 opacity-70">
                      {r === 'buyer' ? 'Discover vintage treasures' : 'List your vintage pieces'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5" aria-busy={isSubmitting}>
              <UserPlus size={16} />
              {isSubmitting ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 font-sans text-sm text-center text-olive">
            Already have an account?{' '}
            <Link to="/login" className="text-sepia hover:text-gold underline-gold transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
