import { Badge } from '../../components/ui/Badge';
import { CheckCircleIcon, DocumentCheckIcon, ShieldIcon } from '../../components/ui/icons';

const DOCUMENTS_LIST = [
  {
    ref: 'TXN-8844',
    title: 'Commercial Invoice #INV-8844-AMS',
    type: 'Commercial Invoice',
    status: 'Verified',
    date: 'Aug 26, 2026',
    size: '2.4 MB',
  },
  {
    ref: 'TXN-8844',
    title: 'Form M Customs Entry #CBN-FM-2026-91',
    type: 'Form M',
    status: 'Cleared',
    date: 'Aug 26, 2026',
    size: '1.8 MB',
  },
  {
    ref: 'TXN-8844',
    title: 'Pre-Arrival Assessment Report (PAAR)',
    type: 'PAAR Certificate',
    status: 'Approved',
    date: 'Aug 25, 2026',
    size: '3.1 MB',
  },
  {
    ref: 'TXN-8841',
    title: 'Bill of Lading #BOL-ROT-772',
    type: 'Bill of Lading',
    status: 'Verified',
    date: 'Aug 22, 2026',
    size: '4.0 MB',
  },
];

export function DocumentsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Trade Documentation Repository</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Transaction-linked trade invoices, Form M entries, and PAAR certificates required for CBN trade compliance
          </p>
        </div>
        <Badge tone="info">CBN KYB Tier 3 Compliant</Badge>
      </div>

      <div className="rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-2">
            <DocumentCheckIcon size={20} color="var(--color-brand-400)" />
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Linked Payment Trade Documents</h3>
          </div>
          <span className="text-xs text-neutral-400">Showing 4 verified records</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {DOCUMENTS_LIST.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border p-4 transition-colors"
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-bold shrink-0" style={{ color: 'var(--color-brand-400)' }}>
                  PDF
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                    {doc.title}
                    <span className="text-[10px] font-mono text-neutral-400 font-normal">({doc.ref})</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Type: {doc.type} · {doc.date} · {doc.size}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircleIcon size={12} color="var(--color-success)" /> {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border p-4 flex items-center justify-between text-xs text-neutral-400" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-2">
            <ShieldIcon size={16} color="var(--color-brand-400)" />
            <span>All trade files cryptographically hashed and linked to immutable payment ledgers.</span>
          </div>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>NDPA Data Protection Certified</span>
        </div>
      </div>
    </div>
  );
}
