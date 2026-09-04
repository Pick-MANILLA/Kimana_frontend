import { Badge } from '../../../components/ui/Badge';
import { ArrowUpRightIcon, ClockIcon, ShieldIcon } from '../../../components/ui/icons';

export function WorkingCapitalSection() {
  return (
    <section id="working-capital" className="py-28 border-t relative overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-1)' }}>
      {/* Background ambient lighting glow */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[450px] w-[600px] opacity-10 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <Badge tone="warning">FUTURE VISION · IN DEVELOPMENT</Badge>
              <span className="text-xs font-semibold text-neutral-400">
                Section C · Long-Term Product Vision
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--color-text-primary)' }}>
              Turn payment history into financial opportunity.
            </h2>
          </div>
          <p className="text-base sm:text-lg lg:max-w-md leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Kimana is being built toward a smarter path to working capital, using verified business activity and payment history to help eligible businesses access financing as the platform grows.
          </p>
        </div>

        {/* Vision Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            className="rounded-2xl border p-8 flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 font-bold" style={{ color: 'var(--color-brand-400)' }}>
                01
              </div>
              <h3 className="mt-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Verified Cash Flow History
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Every cross-border settlement processed through Kimana builds a transparent, verifiable trade record without manual paperwork.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>
              <ShieldIcon size={14} color="var(--color-brand-400)" /> Verifiable Cash Flow Signal
            </div>
          </div>

          <div
            className="rounded-2xl border p-8 flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 font-bold" style={{ color: 'var(--color-brand-400)' }}>
                02
              </div>
              <h3 className="mt-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Predictable Trade Finance
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                As your transaction history grows, eligible African businesses will unlock revolving credit options designed for inventory & supplier payments.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-amber-400">
              <ClockIcon size={14} color="var(--color-warning)" /> In Active Development
            </div>
          </div>

          <div
            className="rounded-2xl border p-8 flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 font-bold" style={{ color: 'var(--color-brand-400)' }}>
                03
              </div>
              <h3 className="mt-4 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Performance-Based Credit
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Replacing traditional collateral requirements with performance-based risk modeling grounded in actual payment fulfillment.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>
              <ArrowUpRightIcon size={14} color="var(--color-brand-400)" /> Smart Credit Signal
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
