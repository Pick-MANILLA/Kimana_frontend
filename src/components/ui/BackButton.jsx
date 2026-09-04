'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from './icons';

export function BackButton({ to, onClick, label = 'Back', className = '' }) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label ? `Back (${label})` : 'Go back to previous page'}
      className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 select-none ${className}`}
      style={{
        color: 'var(--color-text-secondary)',
      }}
    >
      <ArrowLeftIcon size={16} color="currentColor" />
      <span>{label}</span>
    </button>
  );
}
