import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type Variant = 'solid' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'solid', disabled, className = '', style, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

  const variantStyle: CSSProperties =
    variant === 'solid'
      ? {
          background: disabled ? 'var(--color-brand-900)' : 'var(--color-brand-600)',
          color: 'var(--color-text-on-brand)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }
      : {
          background: 'transparent',
          color: 'var(--color-brand-600)',
          border: '1px solid var(--color-brand-600)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        };

  return (
    <button
      className={`${base} ${className}`}
      style={{ ...variantStyle, ...style }}
      disabled={disabled}
      {...rest}
    />
  );
}
