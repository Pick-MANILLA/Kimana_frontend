'use client';

import { BackButton } from '../../components/ui/BackButton';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { Stepper } from '../../components/ui/Stepper';
import { footerDisclaimer, onboardingSteps } from '../../copy';

const ONBOARDING_BACK_ROUTES = [
  '/',                             // 0: Business details -> Landing page
  '/onboarding/business-details',  // 1: Directors & UBO -> Business details
  '/onboarding/directors-ubo',    // 2: Documents -> Directors & UBO
  '/onboarding/documents',        // 3: Verification -> Documents
  '/onboarding/verification',     // 4: Approved -> Verification
];

export function OnboardingLayout({ stepIndex, title, subtitle, children }) {
  const backTarget = ONBOARDING_BACK_ROUTES[stepIndex] ?? '/';

  return (
    <div className="min-h-screen px-gutter py-8" style={{ background: 'var(--color-canvas)' }}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <BackButton to={backTarget} />
          <LogoWithWordmark size={30} />
        </div>

        <div className="mt-4">
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
