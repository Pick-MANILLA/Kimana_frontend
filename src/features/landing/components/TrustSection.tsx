import {
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ShieldIcon,
} from '../../../components/ui/icons';

const PRINCIPLES = [
  {
    icon: (color: string) => <ShieldIcon size={24} color={color} />,
    title: 'Transparent FX',
    description:
      'Guaranteed mid-market exchange rates with transparent, fixed fee structures. Zero post-trade markups or hidden spreads.',
  },
  {
    icon: (color: string) => <ClockIcon size={24} color={color} />,
    title: 'Clear Payment Status',
    description:
      'Step-by-step milestone visibility across funding, conversion, banking rails, and recipient credit delivery.',
  },
  {
    icon: (color: string) => <DocumentCheckIcon size={24} color={color} />,
    title: 'Business-Ready Records',
    description:
      'Automated trade document linking, immutable transaction hashes, and 1-click exportable tax-compliant audit logs.',
  },
  {
    icon: (color: string) => <CheckCircleIcon size={24} color={color} />,
    title: 'Verification-First Onboarding',
    description:
      'Rigorous Corporate Affairs Commission (CAC) verification, director BVN/NIN checks, and automated sanctions screening.',
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="py-24 border-t relative" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-canvas)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            TRUST & SECURITY
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl" style={{ color: 'var(--color-text-primary)' }}>
            Built on product principles.
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Cross-border financial operations demand strict operational integrity. We embed transparency, compliance, and auditability directly into the platform core.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:border-brand-500/50"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--color-surface-2)' }}
                >
                  {p.icon('var(--color-brand-400)')}
                </div>

                <h3 className="mt-6 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {p.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.description}
                </p>
              </div>

              <div className="mt-6 border-t pt-4 text-[11px] font-semibold text-emerald-400 flex items-center gap-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <CheckCircleIcon size={12} color="var(--color-success)" /> Core Standard
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
