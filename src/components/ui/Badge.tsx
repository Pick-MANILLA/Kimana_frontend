import type { ReactNode } from 'react';
import type { StatusTone } from '../../state/transferStatusColor';

const TONE_STYLE: Record<StatusTone, { background: string; color: string }> = {
  success: { background: 'var(--color-success)', color: 'var(--color-on-success)' },
  danger: { background: 'var(--color-danger)', color: 'var(--color-on-danger)' },
  warning: { background: 'var(--color-warning)', color: 'var(--color-on-warning)' },
  info: { background: 'var(--color-info)', color: 'var(--color-on-info)' },
  neutral: { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' },
};

export function Badge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
      style={TONE_STYLE[tone]}
    >
      {children}
    </span>
  );
}
