import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

// Per scope.md: prototype uses a hardcoded illustrative timeline.
// The only real status is 'paid'. shipped/delivered are display-only milestones.
export function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const steps = [
    {
      key: 'paid',
      label: 'Order Confirmed',
      description: 'Payment verified and listing secured.',
      Icon: CheckCircle,
    },
    {
      key: 'shipped',
      label: 'Preparing Shipment',
      description: 'The seller is carefully packing your item.',
      Icon: Package,
    },
    {
      key: 'in_transit',
      label: 'In Transit',
      description: 'Your vintage treasure is on its way.',
      Icon: Truck,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Enjoy your piece of history!',
      Icon: Clock,
    },
  ];

  // In the prototype only 'paid' is a real status
  const activeIndex = status === 'paid' ? 0 : 0;

  return (
    <div className="mt-4">
      <p className="label-text text-olive mb-4">Order Journey</p>

      {/* Note about illustrative timeline */}
      <p className="font-sans text-xs text-olive/70 italic mb-4 border-l-2 border-gold/30 pl-3">
        Illustrative shipment milestones. Live tracking is not available in the prototype.
      </p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-5 bottom-5 w-px bg-border-soft" aria-hidden="true" />

        <ol className="space-y-6">
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            const { Icon } = step;
            return (
              <li key={step.key} className="flex items-start gap-4 relative">
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-gold border-gold text-white'
                      : isPast
                      ? 'bg-sepia/20 border-sepia text-sepia'
                      : 'bg-ivory border-border-soft text-olive/40'
                  }`}
                >
                  <Icon size={14} />
                </div>
                <div className="pt-0.5">
                  <p className={`font-sans text-sm font-medium ${isActive ? 'text-espresso' : isPast ? 'text-sepia' : 'text-olive/50'}`}>
                    {step.label}
                    {isActive && (
                      <span className="ml-2 font-sans text-[10px] bg-gold/20 text-sepia px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </p>
                  <p className={`font-sans text-xs mt-0.5 ${isActive ? 'text-walnut' : 'text-olive/50'}`}>
                    {step.description}
                  </p>
                  {isActive && (
                    <p className="font-sans text-xs text-olive/50 mt-1">
                      {new Date(createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
