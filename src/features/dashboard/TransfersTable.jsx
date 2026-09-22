import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ExclamationTriangleIcon } from '../../components/ui/icons';
import { dashboardCopy, transferStatusLabel } from '../../copy';
import { countryName, formatShortDate } from '../../lib/formatDate';
import { formatMoney, formatMoneyCompact } from '../../money/money';
import { transferStatusTone } from '../../state/transferStatusColor';

export function TransfersTable({ transfers, recipientsById, isLoading, isError, onRetry }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-md" style={{ background: 'var(--color-surface-2)' }} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="my-4 rounded-xl border p-8 text-center"
        style={{ borderColor: 'var(--color-danger)', background: 'color-mix(in srgb, var(--color-danger) 8%, transparent)' }}
      >
        <ExclamationTriangleIcon size={28} color="var(--color-danger)" />
        <p className="mt-3 font-semibold" style={{ color: 'var(--color-danger)' }}>Unable to load transfer history</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          A connection issue prevented retrieving your ledger records.
        </p>
        {onRetry ? (
          <Button type="button" className="mt-4" variant="outline" onClick={onRetry}>
            Retry Connection
          </Button>
        ) : null}
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <div className="my-4 rounded-xl border border-dashed p-8 text-center" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>No transfers recorded yet</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Your initiated cross-border payouts will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Below sm: stacked cards — the 6-column table can't shrink to 360px
          without either truncating data or forcing a horizontal scroll. */}
      <div className="flex flex-col gap-3 sm:hidden">
        {transfers.map((t) => {
          const recipient = recipientsById?.get(t.recipientId);
          return (
            <div
              key={t.id}
              className="rounded-xl border p-3.5"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold" style={{ color: 'var(--color-brand-600)' }}>{t.reference}</p>
                  <p className="mt-1 font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{recipient?.accountName ?? '—'}</p>
                  {recipient ? <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{countryName(recipient.country)}</p> : null}
                </div>
                <Badge tone={transferStatusTone[t.state.status]}>{transferStatusLabel[t.state.status]}</Badge>
              </div>
              <div className="mt-2.5 flex items-end justify-between gap-3 border-t pt-2.5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div>
                  <p className="font-extrabold text-sm" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(t.sendAmount)}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatMoneyCompact(t.receiveAmount)}</p>
                </div>
                <p className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{formatShortDate(t.updatedAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* sm and up: full table */}
      <div className="hidden overflow-x-auto sm:block">
      <table className="w-full min-w-[640px] border-collapse text-sm text-left">
        <thead>
          <tr className="border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
            {[
              dashboardCopy.table.reference,
              dashboardCopy.table.beneficiary,
              dashboardCopy.table.amount,
              dashboardCopy.table.rate,
              dashboardCopy.table.status,
              dashboardCopy.table.date,
            ].map((heading) => (
              <th key={heading} className="px-3 py-2 text-left text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
          {transfers.map((t) => {
            const recipient = recipientsById?.get(t.recipientId);
            return (
              <tr key={t.id} className="transition-colors hover:bg-[var(--color-surface-2)]">
                <td className="px-3 py-3">
                  <p className="font-mono font-bold" style={{ color: 'var(--color-brand-600)' }}>{t.reference}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{recipient?.accountName ?? '—'}</p>
                  {recipient ? <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{countryName(recipient.country)}</p> : null}
                </td>
                <td className="px-3 py-3">
                  <p className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(t.sendAmount)}</p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatMoneyCompact(t.receiveAmount)}</p>
                </td>
                <td className="px-3 py-3" style={{ color: 'var(--color-text-primary)' }}>
                  {t.quote.breakdown.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={transferStatusTone[t.state.status]}>{transferStatusLabel[t.state.status]}</Badge>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatShortDate(t.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}
