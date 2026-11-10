'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { LogoWithWordmark } from '../../../components/ui/Logo';
import { ArrowRightIcon, ChevronDownIcon } from '../../../components/ui/icons';
import { HeroProductPreview } from './HeroProductPreview';
import './HeroSection.css';

// U+2011 (non-breaking hyphen): Bodoni Moda's plain hyphen-minus glyph is
// empty, so '-' would render as a gap. This one draws and never line-breaks.
const LINE_ONE = ['Cross\u2011border', 'payments.'];

export function HeroSection() {
  const router = useRouter();

  const handleExploreClick = () => {
    const section = document.getElementById('proof-bar');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-scene relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Subtle ambient brand spotlight overlay */}
      <div
        className="hero-glow pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] opacity-15 blur-[140px] z-10"
        style={{
          background: 'radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-12">
        {/* Visual Hierarchy Header */}
        <div className="hero-parallax-copy mx-auto max-w-5xl text-center">
          {/* Big brand lockup */}
          <div className="hero-logo mb-10 flex justify-center">
            <LogoWithWordmark size={88} />
          </div>

          {/* Large Headline */}
          <h1
            className="hero-title text-[2.6rem] sm:text-6xl lg:text-[5rem]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {LINE_ONE.map((word, i) => (
              <span key={word}>
                <span className="hero-word" style={{ '--i': i }}>
                  {word}
                </span>
                {i < LINE_ONE.length - 1 ? ' ' : null}
              </span>
            ))}
          </h1>

          {/* Supporting Copy */}
          <p
            className="hero-fade-up mt-8 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)', '--d': '0.85s' }}
          >
            Kimana helps African businesses move money across borders with transparent FX, clear payment tracking, and business-ready records.
          </p>

          {/* CTA Buttons */}
          <div className="hero-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ '--d': '1.05s' }}>
            <Button
              type="button"
              className="w-full sm:w-auto text-base px-9 py-4 font-bold"
              onClick={() => router.push('/onboarding/business-details')}
            >
              Get started <ArrowRightIcon size={18} />
            </Button>
            <button
              type="button"
              onClick={handleExploreClick}
              className="k-btn k-btn--ghost px-8 py-3.5"
            >
              Explore Kimana <ChevronDownIcon size={16} color="var(--color-text-secondary)" />
            </button>
          </div>
        </div>

        {/* Product Visualization Centerpiece */}
        <div className="hero-fade-up mt-16 lg:mt-24" style={{ '--d': '1.3s' }}>
          <div className="hero-tilt-stage">
            <div className="hero-tilt">
              <HeroProductPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
