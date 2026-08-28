import { brand } from '../../copy';

export interface LogoProps {
  size?: number;
  variant?: 'brand' | 'light' | 'dark' | 'auto';
  className?: string;
}

export function LogoMark({
  size = 40,
  variant = 'auto',
  className = '',
}: LogoProps) {
  const secondaryColor =
    variant === 'light'
      ? '#111118'
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
        <linearGradient id="kimana-orange-main" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FF3800" />
        </linearGradient>
        <linearGradient id="kimana-orange-glow" x1="13" y1="6" x2="34" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF8533" />
          <stop offset="100%" stopColor="#FF5500" />
        </linearGradient>
      </defs>

      {/* Left Pillar (Stability & Financial Infrastructure) */}
      <rect x="6" y="6" width="6.5" height="28" rx="3.25" fill="url(#kimana-orange-main)" />

      {/* Upper Forward Arm (Cross-Border Flow & Growth) */}
      <rect
        x="13"
        y="17.5"
        width="21"
        height="6.5"
        rx="3.25"
        fill="url(#kimana-orange-glow)"
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
}: LogoProps) {
  const textColor =
    variant === 'light'
      ? '#111118'
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

