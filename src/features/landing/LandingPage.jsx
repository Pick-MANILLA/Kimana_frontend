import { AfricanBusinessFocusSection } from './components/AfricanBusinessFocusSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LandingFooter } from './components/LandingFooter';
import { LandingNavbar } from './components/LandingNavbar';
import { PaymentCertaintySection } from './components/PaymentCertaintySection';
import { ScrollEffects } from './components/ScrollEffects';
import { ProofBarSection } from './components/ProofBarSection';
import { WorkingCapitalSection } from './components/WorkingCapitalSection';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}>
      <ScrollEffects />

      {/* Navigation Bar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section & Product Visualization */}
        <HeroSection />

        {/* Product Proof Principles Bar */}
        <ProofBarSection />

        {/* African Business SME Focus Section */}
        <AfricanBusinessFocusSection />

        {/* Section A — Payment Certainty */}
        <PaymentCertaintySection />

        {/* How It Works (Visual Storytelling) */}
        <HowItWorksSection />

        {/* Section C — Working Capital Vision */}
        <WorkingCapitalSection />

        {/* Final Franklin-Inspired CTA */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
