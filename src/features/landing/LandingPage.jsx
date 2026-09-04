import { AfricanBusinessFocusSection } from './components/AfricanBusinessFocusSection';
import { DocumentsReconciliationSection } from './components/DocumentsReconciliationSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LandingFooter } from './components/LandingFooter';
import { LandingNavbar } from './components/LandingNavbar';
import { PaymentCertaintySection } from './components/PaymentCertaintySection';
import { ProductCenterpieceSection } from './components/ProductCenterpieceSection';
import { ProofBarSection } from './components/ProofBarSection';
import { TrustSection } from './components/TrustSection';
import { WhyKimanaSection } from './components/WhyKimanaSection';
import { WorkingCapitalSection } from './components/WorkingCapitalSection';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}>
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

        {/* Product Dashboard Centerpiece */}
        <ProductCenterpieceSection />

        {/* Section B — Documents & Reconciliation */}
        <DocumentsReconciliationSection />

        {/* Why Businesses Choose Kimana */}
        <WhyKimanaSection />

        {/* How It Works (Visual Storytelling) */}
        <HowItWorksSection />

        {/* Section C — Working Capital Vision */}
        <WorkingCapitalSection />

        {/* Trust & Principles */}
        <TrustSection />

        {/* Final Franklin-Inspired CTA */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
