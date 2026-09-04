import { Badge } from '../../components/ui/Badge';
import { formatMoney } from '../../money/money';

export function WorkingCapitalCard({ offer }) {
  return (
    <div
      className="mt-4 rounded-xl border p-5 transition-all"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-400)' }}>
          Working Capital
        </span>
        <Badge tone="warning">Coming soon</Badge>
      </div>

      <p className="mt-3 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {offer
          ? `Advance up to ${formatMoney(offer.maxAdvance)}`
          : 'Build your verified payment history with Kimana.'}
      </p>

      <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {offer
          ? `${offer.basisDescription} · ${offer.monthlyRatePercent}% / month`
          : "Access to working capital is part of Kimana's longer-term roadmap."}
      </p>
    </div>
  );
}
