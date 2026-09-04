'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { ArrowRightIcon, ChevronDownIcon } from '../../../components/ui/icons';
import { Prism } from '../../../components/ui/Prism';
import { HeroProductPreview } from './HeroProductPreview';

export function HeroSection() {
  const router = useRouter();

  const handleExploreClick = () => {
    const section = document.getElementById('proof-bar');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Prism WebGL Background strictly scoped to the Hero section */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Prism
          animationType="rotate"
          timeScale={0.35}
          scale={3.8}
          glow={0.95}
          bloom={1.1}
          noise={0.3}
          suspendWhenOffscreen={true}
        />
        {/* Dark Kimana overlay & subtle radial gradient ensuring maximum text readability & brand color harmony */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 20%, rgba(11, 14, 20, 0.45) 0%, rgba(11, 14, 20, 0.85) 70%, var(--color-canvas) 100%),
              linear-gradient(to bottom, rgba(11, 14, 20, 0.2) 0%, rgba(11, 14, 20, 0.7) 60%, var(--color-canvas) 100%)
            `,
          }}
        />
      </div>

      {/* Subtle ambient brand spotlight overlay */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] opacity-15 blur-[140px] z-10"
        style={{
          background: 'radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-12">
        {/* Visual Hierarchy Header */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Small Eyebrow / Announcement */}
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4.5 py-1.5 text-xs font-extrabold tracking-widest uppercase mb-8 backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 85, 0, 0.12)',
              borderColor: 'rgba(255, 85, 0, 0.3)',
              color: 'var(--color-brand-400)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            BUILT FOR AFRICAN BUSINESSES
          </div>

          {/* Large Headline */}
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.05]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Cross-border payments,
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500">
              without the uncertainty.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p
            className="mt-7 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Kimana helps African businesses move money across borders with transparent FX, clear payment tracking, and business-ready records.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              type="button"
              className="w-full sm:w-auto text-base px-9 py-4 font-bold shadow-lg shadow-brand-500/10"
              onClick={() => router.push('/onboarding/business-details')}
            >
              Get started <ArrowRightIcon size={18} />
            </Button>
            <button
              type="button"
              onClick={handleExploreClick}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold border transition-all hover:bg-white/5 backdrop-blur-sm"
              style={{
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
            >
              Explore Kimana <ChevronDownIcon size={16} color="var(--color-text-secondary)" />
            </button>
          </div>
        </div>

        {/* Product Visualization Centerpiece */}
        <div className="mt-16 lg:mt-24">
          <HeroProductPreview />
        </div>
      </div>
    </section>
  );
}
