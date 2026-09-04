import { CheckCircleIcon } from './icons';

export function Stepper({ steps, currentIndex }) {
  return (
    <ol className="flex items-center justify-center gap-0" aria-label="Onboarding progress">
      {steps.map((label, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <li key={label} className="flex items-center">
            <div className="flex items-center gap-2" aria-current={isCurrent ? 'step' : undefined}>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={
                  isCompleted || isCurrent
                    ? { background: 'var(--color-brand-600)', color: 'var(--color-text-on-brand)' }
                    : { border: '1.5px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }
                }
              >
                {isCompleted ? <CheckCircleIcon size={14} color="var(--color-text-on-brand)" /> : index + 1}
              </span>
              <span
                className="hidden text-sm sm:inline"
                style={{
                  color: isCurrent
                    ? 'var(--color-text-primary)'
                    : isCompleted
                      ? 'var(--color-brand-300)'
                      : 'var(--color-text-secondary)',
                  fontWeight: isCurrent ? 600 : 500,
                }}
              >
                {label}
              </span>
            </div>
            {!isLast ? (
              <span
                className="mx-3 h-px w-8 sm:w-12"
                style={{ background: isCompleted ? 'var(--color-brand-600)' : 'var(--color-border-subtle)' }}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
