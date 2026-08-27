import type { ReactNode } from 'react';
import type { PendingAction, PendingActionKind } from '../../api/types/dashboard';
import { CheckCircleIcon, EmptyCircleIcon, ExclamationTriangleIcon } from '../../components/ui/icons';
import { dashboardCopy } from '../../copy';

const ICON_BY_KIND: Record<PendingActionKind, (color: string) => ReactNode> = {
  action_required: (color) => <ExclamationTriangleIcon color={color} size={16} />,
  in_review: (color) => <EmptyCircleIcon color={color} size={16} />,
  submitted: (color) => <CheckCircleIcon color={color} size={16} />,
};

const COLOR_BY_KIND: Record<PendingActionKind, string> = {
  action_required: 'var(--color-warning)',
  in_review: 'var(--color-text-secondary)',
  submitted: 'var(--color-text-secondary)',
};

export function PendingActionsPanel({ actions }: { actions: readonly PendingAction[] }) {
  const urgentCount = actions.filter((a) => a.kind === 'action_required').length;

  return (
    <div className="mt-4 rounded-md p-4" style={{ background: 'var(--color-surface-1)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {dashboardCopy.pendingActions}
        </h2>
        {urgentCount > 0 ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: 'var(--color-warning)', color: 'var(--color-on-warning)' }}
          >
            {dashboardCopy.urgentCount(urgentCount)}
          </span>
        ) : null}
      </div>

      <ul className="mt-4 space-y-3">
        {actions.map((action) => (
          <li key={action.id} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 shrink-0">{ICON_BY_KIND[action.kind](COLOR_BY_KIND[action.kind])}</span>
            <span>
              <span className="block" style={{ color: 'var(--color-text-primary)' }}>
                {action.title}
              </span>
              <span className="block text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {action.subtitle}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
