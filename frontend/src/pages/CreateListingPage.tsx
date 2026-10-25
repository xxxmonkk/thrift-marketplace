import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, AlertTriangle } from 'lucide-react';
import { createListing } from '../api/listings';
import { getCategories } from '../api/categories';
import { ApiRequestError } from '../api/client';
import type { Category } from '../types/api';

const ERAS = [
  'Victorian (1837–1901)',
  'Edwardian (1901–1914)',
  'Roaring Twenties (1920s)',
  'Art Deco (1930s)',
  'Mid-Century Modern (1950s)',
  'Psychedelic Retro (1960s)',
  'Vintage 1970s',
  'Post-Modern 1980s',
  'Y2K & 90s Vintage',
];

const CONDITIONS = [
  { value: 'like new', label: 'Like New (Mint / Pristine)' },
  { value: 'good',     label: 'Good (Authentic vintage wear)' },
  { value: 'fair',     label: 'Fair (Noticeable patina / Character)' },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Cameras' },
  { id: 2, name: 'Shoes' },
  { id: 3, name: 'Bags' },
  { id: 4, name: 'Clothing' },
  { id: 5, name: 'Accessories' },
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '1',
    era: ERAS[0],
    condition: 'good',
    image_url: '',
  });

  useEffect(() => {
    getCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
          setFormData((prev) => ({ ...prev, category_id: String(data[0].id) }));
        }
      })
      .catch((err) => {
        console.warn('Backend categories unavailable, using default catalogue categories:', err);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price in INR.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide a title for the piece.');
      return;
    }

    const imgUrl = formData.image_url.trim() || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800';

    setLoading(true);
    try {
      await createListing({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: Math.round(priceNum), // backend requires whole number
        category_id: parseInt(formData.category_id, 10),
        era: formData.era,
        item_condition: formData.condition as any,
        image_urls: [imgUrl], // backend requires non-empty array of valid URLs
      });

      navigate('/seller');
    } catch (err: any) {
      console.error(err);
      if (err instanceof ApiRequestError && err.status === 0) {
        setError('Cannot connect to backend server (http://localhost:4000) to submit listing. Please ensure the backend server is running.');
      } else {
        setError(err.data?.error || err.message || 'Failed to submit listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-12 max-w-3xl">
      <Link
        to="/seller"
        className="inline-flex items-center gap-2 font-sans text-xs text-parchment/60 hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Studio
      </Link>

      <div className="border-b border-walnut pb-4 mb-8">
        <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold/80 block mb-1">
          Cataloguing Artifacts
        </span>
        <h1 className="font-serif text-3xl text-ivory">Consign a New Vintage Piece</h1>
        <p className="font-sans text-sm text-parchment/60 mt-1">
          All submitted pieces are placed in <span className="text-amber-400">pending</span> status for
          curatorial review before becoming live.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded flex items-center gap-3 text-rose-300 font-sans text-sm mb-6">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
            Piece Title *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. 1954 Leica M3 Rangefinder Camera"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-serif placeholder:font-sans placeholder:text-parchment/30 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
              Category *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-sans focus:outline-none focus:border-gold transition-colors"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
              Price (INR ₹) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="1"
              step="any"
              placeholder="e.g. 14500"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-sans placeholder:text-parchment/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
              Era / Epoch
            </label>
            <select
              name="era"
              value={formData.era}
              onChange={handleChange}
              className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-sans focus:outline-none focus:border-gold transition-colors"
            >
              {ERAS.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
              Preservation Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-sans focus:outline-none focus:border-gold transition-colors"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
            Image URL (Public web link)
          </label>
          <input
            type="url"
            name="image_url"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.image_url}
            onChange={handleChange}
            className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-sans placeholder:text-parchment/30 focus:outline-none focus:border-gold transition-colors"
          />
          <p className="font-sans text-[11px] text-parchment/40 mt-1">
            Leave blank to use a curated museum vintage default image.
          </p>
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-wider text-parchment/80 mb-2">
            Provenance & Description
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Share the origins, history, patina, and unique characteristics of this piece..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-espresso border border-walnut px-4 py-3 text-ivory font-sans placeholder:text-parchment/30 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <Link to="/seller" className="btn-secondary text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <PlusCircle size={16} />
            {loading ? 'Submitting to Archive...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
