'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { ArrowRightIcon } from '../../../components/ui/icons';

export function FinalCtaSection() {
  const router = useRouter();

  return (
    <section className="py-28 border-t relative overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-canvas)' }}>
      {/* Background radial highlight */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] opacity-15 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 text-center relative z-10">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
          GET STARTED WITH KIMANA
        </span>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          Make your next cross-border payment with confidence.
        </h2>

        <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Create your business profile and see how Kimana works. Transparent FX rates, milestone tracking, and business-ready records tailored for African trade.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <Button
            type="button"
            className="text-base px-10 py-4 font-extrabold"
            onClick={() => router.push('/onboarding/business-details')}
          >
            Get started <ArrowRightIcon size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
