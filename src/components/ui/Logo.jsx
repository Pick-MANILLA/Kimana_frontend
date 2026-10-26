import { brand } from '../../copy';

export function LogoMark({
  size = 40,
  variant = 'auto',
  className = '',
}) {
  const secondaryColor =
    variant === 'light'
      ? '#2D142C'
      : variant === 'dark'
      ? '#FFFFFF'
      : 'var(--color-text-primary)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label={`${brand.name} mark`}
    >
      <defs>
        <linearGradient id="kimana-brand-main" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EE4540" />
          <stop offset="100%" stopColor="#C72C41" />
        </linearGradient>
        <linearGradient id="kimana-brand-glow" x1="13" y1="6" x2="34" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2706C" />
          <stop offset="100%" stopColor="#EE4540" />
        </linearGradient>
      </defs>

      {/* Left Pillar (Stability & Financial Infrastructure) */}
      <rect x="6" y="6" width="6.5" height="28" rx="3.25" fill="url(#kimana-brand-main)" />

      {/* Upper Forward Arm (Cross-Border Flow & Growth) */}
      <rect
        x="13"
        y="17.5"
        width="21"
        height="6.5"
        rx="3.25"
        fill="url(#kimana-brand-glow)"
        transform="rotate(-42 13 20.75)"
      />

      {/* Lower Interlocking Bridge (Global Connection & Trust) */}
      <rect
        x="13"
        y="15.75"
        width="21"
        height="6.5"
        rx="3.25"
        fill={secondaryColor}
        transform="rotate(42 13 19)"
      />
    </svg>
  );
}

export function LogoWithWordmark({
  size = 36,
  variant = 'auto',
  className = '',
}) {
  const textColor =
    variant === 'light'
      ? '#2D142C'
      : variant === 'dark'
      ? '#FFFFFF'
      : 'var(--color-text-primary)';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={size} variant={variant} />
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize: `${size * 0.56}px`,
          lineHeight: 1,
          color: textColor,
        }}
      >
        {brand.name}
      </span>
    </div>
  );
}

export const Logo = LogoWithWordmark;
