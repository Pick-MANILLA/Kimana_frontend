import type { Recipient, Transfer } from '../../api/types/transfer';
import { Badge } from '../../components/ui/Badge';
import { dashboardCopy, transferStatusLabel } from '../../copy';
import { countryName, formatShortDate } from '../../lib/formatDate';
import { formatMoney, formatMoneyCompact } from '../../money/money';
import { transferStatusTone } from '../../state/transferStatusColor';
import type { CompletedDemoTransfer } from './NewTransferModal';

interface TransfersTableProps {
  transfers?: readonly Transfer[];
  recipientsById?: ReadonlyMap<string, Recipient>;
  customTransfers?: readonly CompletedDemoTransfer[];
}

const DEFAULT_DEMO_TRANSFERS: readonly CompletedDemoTransfer[] = [
  { reference: 'TXN-8844', beneficiary: 'Amsterdam Commodities BV', amount: '$45,000.00', currency: 'USD', status: 'Completed', date: 'Aug 27' },
  { reference: 'TXN-8843', beneficiary: 'Kerala Spices Corp', amount: '$18,500.00', currency: 'USD', status: 'Paying out', date: 'Aug 27' },
  { reference: 'TXN-8842', beneficiary: 'Naturalia Foods GmbH', amount: '$22,000.00', currency: 'USD', status: 'Screened', date: 'Aug 26' },
  { reference: 'TXN-8841', beneficiary: 'Rotterdam Grain Exchange', amount: '$78,000.00', currency: 'USD', status: 'Completed', date: 'Aug 25' },
];

export function TransfersTable({ transfers, recipientsById, customTransfers = [] }: TransfersTableProps) {
  // If real API transfers are provided (e.g. from overview query), render them using standard Kimana formatting
  if (transfers && transfers.length > 0) {
    return (
      <div className="overflow-x-auto">
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
    );
  }

  // Otherwise render MVP demo records (with newly added custom transfers prepended)
  const allTransfers = [...customTransfers, ...DEFAULT_DEMO_TRANSFERS];

  const getBadgeTone = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'settled':
        return 'success';
      case 'paying out':
      case 'settling':
      case 'in progress':
        return 'info';
      case 'screened':
      case 'quoted':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-sm text-left">
        <thead>
          <tr className="border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
            <th className="px-3 py-2.5">Reference</th>
            <th className="px-3 py-2.5">Beneficiary</th>
            <th className="px-3 py-2.5">Amount</th>
            <th className="px-3 py-2.5">Currency</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
          {allTransfers.map((t) => (
            <tr key={t.reference} className="transition-colors hover:bg-[var(--color-surface-2)]">
              <td className="px-3 py-3 font-mono font-bold" style={{ color: 'var(--color-brand-600)' }}>{t.reference}</td>
              <td className="px-3 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.beneficiary}</td>
              <td className="px-3 py-3 font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{t.amount}</td>
              <td className="px-3 py-3">
                <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                  {t.currency}
                </span>
              </td>
              <td className="px-3 py-3">
                <Badge tone={getBadgeTone(t.status)}>{t.status}</Badge>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
