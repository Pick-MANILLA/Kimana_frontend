import { Badge } from '../../components/ui/Badge';
import { CheckCircleIcon, DownloadIcon, ShieldIcon } from '../../components/ui/icons';

const RECONCILIATION_RECORDS = [
  { ref: 'TXN-8844', beneficiary: 'Amsterdam Commodities BV', amount: '$45,000.00 USD', status: 'Completed', recStatus: 'Reconciliation ready' },
  { ref: 'TXN-8843', beneficiary: 'Kerala Spices Corp', amount: '$18,500.00 USD', status: 'Paying out', recStatus: 'Reconciliation ready' },
  { ref: 'TXN-8842', beneficiary: 'Naturalia Foods GmbH', amount: '$22,000.00 USD', status: 'Screened', recStatus: 'Reconciliation ready' },
  { ref: 'TXN-8841', beneficiary: 'Rotterdam Grain Exchange', amount: '$78,000.00 USD', status: 'Completed', recStatus: 'Reconciliation ready' },
];

export function ReconciliationView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>ERP Audit & Settlement Reconciliation</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Structured ledger outputs formatted for immediate import into QuickBooks, Xero, or custom enterprise accounting software
          </p>
        </div>
        <Badge tone="success">0 Discrepancies Found</Badge>
      </div>

      <div className="rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-2">
            <ShieldIcon size={20} color="var(--color-brand-400)" />
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Reconciliation Packet Ledger</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
              style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
            >
              <DownloadIcon size={14} /> Export CSV
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
              style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
            >
              <DownloadIcon size={14} /> Export MT940
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wider text-neutral-400" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {RECONCILIATION_RECORDS.map((row) => (
                <tr key={row.ref} className="hover:opacity-90 transition-opacity">
                  <td className="py-3.5 px-4 font-mono font-bold" style={{ color: 'var(--color-brand-400)' }}>{row.ref}</td>
                  <td className="py-3.5 px-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>{row.beneficiary}</td>
                  <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--color-text-primary)' }}>{row.amount}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-emerald-400">{row.status}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircleIcon size={12} color="var(--color-success)" /> {row.recStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
