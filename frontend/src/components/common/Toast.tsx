import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, type = 'info', duration = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  const clsMap: Record<ToastType, string> = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
  };
  const IconMap: Record<ToastType, React.ElementType> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };
  const Icon = IconMap[type];
  const colorMap: Record<ToastType, string> = {
    success: 'text-emerald-700',
    error: 'text-red-700',
    info: 'text-sepia',
  };

  return (
    <div role="alert" aria-live="polite" className={clsMap[type]}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${colorMap[type]}`} />
      <p className="flex-1 text-espresso text-sm leading-relaxed">{message}</p>
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-olive hover:text-espresso transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ── Toast Manager ─────────────────────────────────────────
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message}
            type={t.type}
            onDismiss={() => removeToast(t.id)}
          />
        </div>
      ))}
    </div>
  );
}
