'use client';

import { useToast } from '../../hooks/useToast';
import { CheckCircleIcon, EmptyCircleIcon, ExclamationTriangleIcon, XIcon } from './icons';

const TONE = {
  success: { icon: CheckCircleIcon, color: 'var(--color-success)' },
  error: { icon: ExclamationTriangleIcon, color: 'var(--color-danger)' },
  warning: { icon: ExclamationTriangleIcon, color: 'var(--color-warning)' },
  info: { icon: EmptyCircleIcon, color: 'var(--color-info)' },
};

function ToastItem({ toast: item, onDismiss }) {
  const { icon: Icon, color } = TONE[item.type] ?? TONE.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl border text-sm font-medium"
      style={{
        background: 'var(--color-surface-1)',
        borderColor: 'var(--color-border-subtle)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Icon size={16} color={color} />
      <span>{item.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-2 opacity-60 hover:opacity-100 focus-visible:outline-2"
      >
        <XIcon size={14} color="currentColor" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </>
  );
}
