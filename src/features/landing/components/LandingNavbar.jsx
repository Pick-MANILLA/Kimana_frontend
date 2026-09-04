'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/Button';
import { LogoWithWordmark } from '../../../components/ui/Logo';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';
import { ChevronRightIcon, MenuIcon, XIcon } from '../../../components/ui/icons';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'var(--color-navbar-bg)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4.5 lg:px-12">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <LogoWithWordmark />
        </Link>

        {/* Center: Navigation links */}
        <nav className="hidden items-center gap-8 md:flex">
          <button
            type="button"
            onClick={() => handleNavClick('product')}
            className="text-sm font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Product
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('solutions')}
            className="text-sm font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Solutions
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="text-sm font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('working-capital')}
            className="text-sm font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Working Capital
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('why-kimana')}
            className="text-sm font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Resources
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Log in
          </Link>
          <Button type="button" onClick={() => router.push('/onboarding/business-details')}>
            Get started
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size={34} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-surface-1)',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="border-b px-6 py-6 md:hidden"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => handleNavClick('product')}
              className="flex items-center justify-between text-left text-base font-medium py-2.5 border-b"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              Product <ChevronRightIcon size={16} color="var(--color-text-secondary)" />
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('solutions')}
              className="flex items-center justify-between text-left text-base font-medium py-2.5 border-b"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              Solutions <ChevronRightIcon size={16} color="var(--color-text-secondary)" />
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="flex items-center justify-between text-left text-base font-medium py-2.5 border-b"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              How it works <ChevronRightIcon size={16} color="var(--color-text-secondary)" />
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('working-capital')}
              className="flex items-center justify-between text-left text-base font-medium py-2.5 border-b"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              Working Capital <ChevronRightIcon size={16} color="var(--color-text-secondary)" />
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('why-kimana')}
              className="flex items-center justify-between text-left text-base font-medium py-2.5 border-b"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              Resources <ChevronRightIcon size={16} color="var(--color-text-secondary)" />
            </button>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full rounded-full py-3 text-center text-sm font-semibold border"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Log in
              </Link>
              <Button
                type="button"
                className="w-full py-3"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/onboarding/business-details');
                }}
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
