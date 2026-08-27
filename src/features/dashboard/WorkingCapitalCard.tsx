import type { WorkingCapitalOffer } from '../../api/types/dashboard';
import { ArrowUpRightIcon } from '../../components/ui/icons';
import { dashboardCopy } from '../../copy';
import { formatMoney } from '../../money/money';

export function WorkingCapitalCard({ offer }: { offer: WorkingCapitalOffer }) {
  return (
    <div className="mt-4 rounded-md p-4" style={{ background: 'var(--color-surface-2)' }}>
      <span
        className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ background: 'var(--color-brand-800)', color: 'var(--color-brand-200)' }}
      >
        {dashboardCopy.workingCapital}
      </span>
      <p className="mt-2.5 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Advance up to {formatMoney(offer.maxAdvance)}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {offer.basisDescription} · {offer.monthlyRatePercent}% / month
      </p>
      <button type="button" className="mt-2.5 flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brand-400)' }}>
        {dashboardCopy.applyNow} <ArrowUpRightIcon size={13} />
      </button>
    </div>
  );
}
