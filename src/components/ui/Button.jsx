/*
 * Pill button following the soft state template:
 *   default → hover (lifts, brightens) → focus (violet glow ring)
 *   → pressed (sinks, violet outline) → loading (spinner chip) → success (check chip)
 * All states are pure CSS (`.k-btn` in app/globals.css), so callers' Tailwind
 * classes for size/width still apply on top.
 *
 * variant: 'solid' (primary, filled violet) | 'outline' (soft glass pill)
 * loading: shows a spinner chip, sets aria-busy, blocks clicks
 * success: shows a check chip (e.g. right after a save)
 */
export function Button({
  variant = 'solid',
  loading = false,
  success = false,
  disabled,
  className = '',
  children,
  ...rest
}) {
  const kind = variant === 'solid' ? 'k-btn--solid' : 'k-btn--ghost';
  const state = loading ? 'loading' : success ? 'success' : undefined;

  return (
    <button
      className={`k-btn ${kind} ${className}`}
      data-state={state}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
      {loading ? (
        <span className="k-btn-chip" aria-hidden="true">
          <span className="k-btn-spinner" />
        </span>
      ) : success ? (
        <span className="k-btn-chip" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}
