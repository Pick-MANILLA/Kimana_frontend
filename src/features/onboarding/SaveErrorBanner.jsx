import { ExclamationTriangleIcon } from '../../components/ui/icons';
import { onboardingErrorsCopy } from '../../copy';

/** Turns an ApiError into the banner message and whether to show the support contact. */
function describeSaveError(error) {
  switch (error?.code) {
    case 'NETWORK':
    case 'TIMEOUT':
      return { message: onboardingErrorsCopy.network, showSupport: false };
    case 'UNAUTHORIZED':
      return { message: onboardingErrorsCopy.sessionExpired, showSupport: false };
    case 'CONFLICT':
    case 'FORBIDDEN':
      return { message: error.message || onboardingErrorsCopy.generic, showSupport: true };
    default:
      return { message: error?.message || onboardingErrorsCopy.generic, showSupport: false };
  }
}

export function SaveErrorBanner({ error }) {
  if (!error) return null;
  const { message, showSupport } = describeSaveError(error);
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{ background: 'var(--color-danger)', color: 'var(--color-on-danger)' }}
      role="alert"
    >
      <ExclamationTriangleIcon size={18} />
      <div>
        <p className="font-medium">{message}</p>
        {showSupport ? (
          <p className="mt-1 text-xs">
            {onboardingErrorsCopy.supportPrompt}{' '}
            <a
              href={`mailto:${onboardingErrorsCopy.supportEmail}`}
              className="font-semibold underline"
              style={{ color: 'var(--color-on-danger)' }}
            >
              {onboardingErrorsCopy.supportEmail}
            </a>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
