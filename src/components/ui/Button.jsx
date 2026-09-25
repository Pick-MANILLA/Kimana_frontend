export function Button({ variant = 'solid', disabled, className = '', style, onMouseEnter, onMouseLeave, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

  const restBackground = variant === 'solid' ? 'var(--color-brand-600)' : 'transparent';
  const hoverBackground = variant === 'solid' ? 'var(--color-brand-700)' : 'var(--color-surface-2)';

  const variantStyle =
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

  // Colors come from CSS custom properties set via inline `style`, which
  // always wins over a stylesheet rule — including Tailwind's `hover:`
  // classes — so the hover swap has to happen the same way, on the DOM
  // node directly, rather than through a class.
  return (
    <button
      className={`${base} ${className}`}
      style={{ ...variantStyle, ...style }}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBackground;
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = restBackground;
        onMouseLeave?.(e);
      }}
      {...rest}
    />
  );
}
