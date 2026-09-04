export function StatTile({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-md p-4" style={{ background: 'var(--color-surface-1)' }}>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </p>
        <p className="mt-0.5 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
