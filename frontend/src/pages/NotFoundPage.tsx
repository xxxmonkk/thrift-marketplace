import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="section-container py-24 text-center">
      <div className="max-w-md mx-auto bg-espresso/40 border border-walnut p-8 md:p-12 rounded shadow-vintage-lg">
        <Compass className="w-16 h-16 text-gold/60 mx-auto mb-6 animate-pulse" />
        <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold/70 block mb-2">
          Catalogue Error 404
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-ivory mb-4">
          Lost in the Archives
        </h1>
        <p className="font-sans text-sm text-parchment/70 leading-relaxed mb-8">
          The artifact or chamber you seek does not exist, has been relocated, or has vanished into the annals of history.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 text-xs w-full sm:w-auto justify-center">
            <ArrowLeft size={14} /> Return to Gallery
          </Link>
          <Link to="/browse" className="btn-secondary text-xs w-full sm:w-auto justify-center">
            Browse Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
