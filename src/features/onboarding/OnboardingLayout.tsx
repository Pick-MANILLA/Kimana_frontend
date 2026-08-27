import type { ReactNode } from 'react';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { Stepper } from '../../components/ui/Stepper';
import { footerDisclaimer, onboardingSteps } from '../../copy';

interface OnboardingLayoutProps {
  stepIndex: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function OnboardingLayout({ stepIndex, title, subtitle, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen px-gutter py-8" style={{ background: 'var(--color-canvas)' }}>
      <div className="mx-auto max-w-2xl">
        <LogoWithWordmark />

        <div className="mt-6">
          <Stepper steps={onboardingSteps} currentIndex={stepIndex} />
        </div>

        <h1 className="mt-8 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {subtitle}
        </p>

        <hr className="mt-6 mb-8" style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)' }} />

        {children}

        <p className="mt-10 text-center text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {footerDisclaimer}
        </p>
      </div>
    </div>
  );
}
