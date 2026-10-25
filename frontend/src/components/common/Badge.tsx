import type { ListingStatus, ItemCondition } from '../../types/api';

// ── Status badge ──────────────────────────────────────────
interface StatusBadgeProps {
  status: ListingStatus;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<ListingStatus, { cls: string; label: string }> = {
    live:              { cls: 'badge-live',    label: 'Live'              },
    pending:           { cls: 'badge-pending', label: 'Pending Review'   },
    sold:              { cls: 'badge-sold',    label: 'Sold'             },
    rejected:          { cls: 'badge-rejected',label: 'Rejected'         },
    changes_requested: { cls: 'badge-changes', label: 'Changes Requested'},
  };
  const { cls, label } = map[status] ?? { cls: 'badge-gold', label: status };
  return <span className={cls}>{label}</span>;
}

// ── Condition badge ────────────────────────────────────────
interface ConditionBadgeProps {
  condition: ItemCondition;
}
export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const map: Record<ItemCondition, { cls: string; label: string }> = {
    'like new': { cls: 'badge bg-teal-100 text-teal-800 border border-teal-200', label: 'Like New' },
    'good':     { cls: 'badge bg-blue-100 text-blue-800 border border-blue-200', label: 'Good'     },
    'fair':     { cls: 'badge bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'Fair' },
  };
  const { cls, label } = map[condition] ?? { cls: 'badge-gold', label: condition };
  return <span className={cls}>{label}</span>;
}

// ── Era badge ─────────────────────────────────────────────
interface EraBadgeProps {
  era: string;
}
export function EraBadge({ era }: EraBadgeProps) {
  return <span className="badge-gold">{era}</span>;
}
