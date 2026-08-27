import { brand } from '../../copy';

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[10px]"
      style={{ width: size, height: size, background: 'var(--color-brand-600)' }}
      aria-hidden="true"
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

export function LogoWithWordmark() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <LogoMark size={36} />
      <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {brand.name}
      </span>
    </div>
  );
}
