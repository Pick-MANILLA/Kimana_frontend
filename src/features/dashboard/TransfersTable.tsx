import type { Recipient, Transfer } from '../../api/types/transfer';
import { Badge } from '../../components/ui/Badge';
import { dashboardCopy, transferStatusLabel } from '../../copy';
import { countryName, formatShortDate } from '../../lib/formatDate';
import { formatMoney, formatMoneyCompact } from '../../money/money';
import { transferStatusTone } from '../../state/transferStatusColor';

interface TransfersTableProps {
  transfers: readonly Transfer[];
  recipientsById: ReadonlyMap<string, Recipient>;
}

export function TransfersTable({ transfers, recipientsById }: TransfersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            {[
              dashboardCopy.table.reference,
              dashboardCopy.table.beneficiary,
              dashboardCopy.table.amount,
              dashboardCopy.table.rate,
              dashboardCopy.table.status,
              dashboardCopy.table.date,
            ].map((heading) => (
              <th
                key={heading}
                className="px-3 py-2 text-left text-xs font-medium tracking-wide uppercase"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => {
            const recipient = recipientsById.get(t.recipientId);
            return (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td className="px-3 py-3">
                  <p className="font-medium" style={{ color: 'var(--color-brand-400)' }}>
                    {t.reference}
                  </p>
                  {t.tradeDescription ? (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {t.tradeDescription}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <p style={{ color: 'var(--color-text-primary)' }}>{recipient?.accountName ?? '—'}</p>
                  {recipient ? (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {countryName(recipient.country)}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {formatMoney(t.sendAmount)}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatMoneyCompact(t.receiveAmount)}
                  </p>
                </td>
                <td className="px-3 py-3" style={{ color: 'var(--color-text-primary)' }}>
                  {t.quote.breakdown.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={transferStatusTone[t.state.status]}>{transferStatusLabel[t.state.status]}</Badge>
                </td>
                <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatShortDate(t.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
