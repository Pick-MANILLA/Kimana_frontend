import { Badge } from '../../../components/ui/Badge';
import { CheckCircleIcon, DocumentCheckIcon, ShieldIcon, ClockIcon } from '../../../components/ui/icons';

const REASONS = [
  {
    title: 'Payment Certainty',
    subtitle: 'Predictable settlement timelines without surprise banking holds',
    description:
      'Eliminate black-box delays. Every payment step is validated through automated state machines, giving your finance team complete confidence when paying international suppliers.',
    icon: (color) => <ShieldIcon size={24} color={color} />,
    badge: 'Core Principle',
  },
  {
    title: 'Transparent FX',
    subtitle: 'Zero margin markups & guaranteed rate locks',
    description:
      'Know your exact landed payout amount before transferring funds. Lock in mid-market exchange rates with fixed, transparent processing fees.',
    icon: (color) => <ClockIcon size={24} color={color} />,
    badge: '0% Spread',
  },
  {
    title: 'Trade Documentation',
    subtitle: 'Bind commercial invoices directly to transaction records',
    description:
      'Satisfy CBN regulatory requirement with built-in document attachment. Link invoices, bills of lading, and customs Form M directly to payment IDs.',
    icon: (color) => <DocumentCheckIcon size={24} color={color} />,
    badge: 'CBN Ready',
  },
  {
    title: 'Real-Time Payment Tracking',
    subtitle: 'Step-by-step milestone progression',
    description:
      'Track money movement from local NIP deposit through compliance screening to final beneficiary credit in real time.',
    icon: (color) => <CheckCircleIcon size={24} color={color} />,
    badge: 'Live Status',
  },
  {
    title: '1-Click Reconciliation',
    subtitle: 'Audit-ready financial logs for accounting software',
    description:
      'Export structured CSV, MT940, and PDF payment packets formatted for immediate import into QuickBooks, Xero, or custom ERP systems.',
    icon: (color) => <DocumentCheckIcon size={24} color={color} />,
    badge: 'ERP Sync',
  },
];

export function WhyKimanaSection() {
  return (
    <section id="why-kimana" className="py-28 border-t relative overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-1)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            WHY BUSINESSES CHOOSE KIMANA
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl" style={{ color: 'var(--color-text-primary)' }}>
            Financial infrastructure designed for certainty.
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Built around strict operational principles to ensure every cross-border payment is transparent, compliant, and predictable.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-8 flex flex-col justify-between transition-all hover:border-brand-500/50"
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                    {reason.icon('var(--color-brand-400)')}
                  </div>
                  <Badge tone="info">{reason.badge}</Badge>
                </div>

                <h3 className="mt-6 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {reason.title}
                </h3>

                <span className="mt-1 block text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>
                  {reason.subtitle}
                </span>

                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {reason.description}
                </p>
              </div>

              <div className="mt-6 border-t pt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1.5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <CheckCircleIcon size={14} color="var(--color-success)" /> Operational Standard
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
