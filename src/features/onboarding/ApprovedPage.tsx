import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { approvedCopy } from '../../copy';
import { formatMoney } from '../../money/money';
import { OnboardingLayout } from './OnboardingLayout';
import { useOnboardingApplication } from './useOnboardingApplication';

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md px-4 py-3" style={{ background: 'var(--color-surface-2)' }}>
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

export function ApprovedPage() {
  const navigate = useNavigate();
  const { data: application, isLoading } = useOnboardingApplication();
  const summary = application?.approvedSummary;
  const businessName = application?.business?.legalName ?? 'Your business';

  return (
    <OnboardingLayout stepIndex={4} title={approvedCopy.title} subtitle={approvedCopy.subtitle}>
      {isLoading || !summary ? (
        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading your account…
        </p>
      ) : (
        <>
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-brand-600)' }}
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4.5 10.2L8 13.7L15.5 6.2" stroke="var(--color-brand-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {businessName}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {approvedCopy.accountIdLabel}: {summary.accountId}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <InfoTile label={approvedCopy.riskRating} value={summary.riskRatingLabel} />
            <InfoTile label={approvedCopy.segment} value={summary.segment} />
            <InfoTile label={approvedCopy.corridor} value={summary.corridor} />
            <InfoTile label={approvedCopy.monthlyLimit} value={formatMoney(summary.monthlyLimit, { useCode: true })} />
          </div>

          <div className="flex justify-end pt-8">
            <Button type="button" onClick={() => navigate('/dashboard')}>
              {approvedCopy.enterDashboard}
            </Button>
          </div>
        </>
      )}
    </OnboardingLayout>
  );
}
