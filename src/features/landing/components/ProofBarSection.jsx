import { CheckCircleIcon, DocumentCheckIcon, ShieldIcon, ClockIcon } from '../../../components/ui/icons';

const PRINCIPLES = [
  {
    title: 'TRANSPARENT FX',
    subtitle: 'Zero margin markup & guaranteed 2-min quote lock',
    icon: (color) => <ShieldIcon size={18} color={color} />,
  },
  {
    title: 'CLEAR PAYMENT STATUS',
    subtitle: 'End-to-end milestone tracking across banking rails',
    icon: (color) => <ClockIcon size={18} color={color} />,
  },
  {
    title: 'BUSINESS-READY RECORDS',
    subtitle: 'Automated invoice linking & tax-compliant audit logs',
    icon: (color) => <DocumentCheckIcon size={18} color={color} />,
  },
  {
    title: 'VERIFICATION-FIRST ONBOARDING',
    subtitle: 'CAC lookup & automated NIBSS director screening',
    icon: (color) => <CheckCircleIcon size={18} color={color} />,
  },
];

export function ProofBarSection() {
  return (
    <section id="proof-bar" className="py-12 border-t border-b" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-1)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-4 rounded-xl border transition-all"
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--color-surface-2)' }}
              >
                {p.icon('var(--color-brand-400)')}
              </div>
              <div>
                <span className="block text-xs font-black tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  {p.title}
                </span>
                <span className="mt-1 block text-xs leading-normal" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
