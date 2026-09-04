import { ArrowUpRightIcon } from '../../components/ui/icons';
import { formatMoney } from '../../money/money';

const DELTA_COLOR = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export function BalanceCard({ currencyName, currency, balance, secondaryLine, deltaText, deltaTone }) {
  return (
    <div className="rounded-md p-4" style={{ background: 'var(--color-surface-1)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {currencyName}
        </p>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: 'var(--color-brand-800)', color: 'var(--color-brand-200)' }}
        >
          {currency}
        </span>
      </div>

      <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {formatMoney(balance)}
      </p>

      {secondaryLine ? (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {secondaryLine}
        </p>
      ) : null}

      <p className="mt-2 flex items-center gap-1 text-xs font-medium" style={{ color: DELTA_COLOR[deltaTone] }}>
        <ArrowUpRightIcon size={12} color={DELTA_COLOR[deltaTone]} />
        {deltaText}
      </p>
    </div>
  );
}
