import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ArrowRightIcon, CheckCircleIcon } from '../../../components/ui/icons';

const STEPS = [
  {
    number: '01',
    title: 'Create your business profile',
    description:
      'Enter your company legal name, CAC RC registration number, and industry sector to establish your corporate Kimana identity.',
    highlights: ['CAC registry lookup', 'Multi-user admin controls', '< 3 minute setup'],
  },
  {
    number: '02',
    title: 'Complete verification',
    description:
      'Automated KYB verification cross-references director BVN/NIN records with NIBSS and runs real-time sanctions screening.',
    highlights: ['Instant BVN verification', 'OFAC & Sanctions scan', 'CBN compliance ready'],
  },
  {
    number: '03',
    title: 'Get your FX quote and fund your payment',
    description:
      'Lock in guaranteed mid-market exchange quotes with transparent fees. Fund locally via instant bank transfer or dedicated virtual account.',
    highlights: ['2-minute rate lock', '0% spread markup', 'Local NIP bank transfer'],
  },
  {
    number: '04',
    title: 'Track settlement and payout',
    description:
      'Follow your money step-by-step from funding to correspondent bank payout, with automated invoice linking and tax-compliant receipts.',
    highlights: ['Live state machine tracking', 'Automated proof of payment', '1-click ERP sync'],
  },
];

export function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-28 border-t relative overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-1)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            SIMPLE WORKFLOW
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--color-text-primary)' }}>
            Four steps to cross-border certainty.
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Engineered for speed, transparency, and compliance so your team can manage global supplier payments without friction.
          </p>
        </div>

        {/* Franklin-Style Vertical Visual Storytelling Rows */}
        <div className="mt-20 flex flex-col gap-12">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group rounded-2xl border p-8 sm:p-10 transition-all duration-300 hover:border-brand-500/50"
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
                {/* Large Number Badge Column */}
                <div className="lg:col-span-3">
                  <span className="text-6xl sm:text-7xl font-black tracking-tight" style={{ color: 'var(--color-brand-400)' }}>
                    {step.number}
                  </span>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Step {step.number} of 04
                  </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-6">
                  <h3 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {step.description}
                  </p>
                </div>

                {/* Highlights Column */}
                <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <ul className="flex flex-col gap-3">
                    {step.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        <CheckCircleIcon size={14} color="var(--color-success)" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div
          className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-2xl border p-8"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Ready to streamline your business payments?
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Create your corporate profile in minutes with your CAC number.
            </p>
          </div>

          <Button type="button" onClick={() => navigate('/onboarding/business-details')}>
            Get started <ArrowRightIcon size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
