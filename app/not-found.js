import Link from 'next/link';
import { LogoWithWordmark } from '../src/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center" style={{ backgroundColor: 'var(--color-canvas)' }}>
      <LogoWithWordmark size={30} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Page not found
        </h1>
        <p className="mt-2 text-sm max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold"
        style={{ background: 'var(--color-brand-600)', color: 'var(--color-text-on-brand)' }}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
