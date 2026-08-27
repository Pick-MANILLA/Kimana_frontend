import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { CheckCircleIcon, EmptyCircleIcon, SpinnerIcon } from '../../components/ui/icons';
import { verificationCopy } from '../../copy';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

const STEP_DURATION_MS = 1200;

export function VerificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: application } = useOnboardingApplication();
  const [doneCount, setDoneCount] = useState(0);
  const startedRef = useRef(false);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!application) throw new Error('Application not loaded yet');
      return api.onboarding.submit(application.id);
    },
  });

  useEffect(() => {
    if (startedRef.current || !application) return;
    startedRef.current = true;
    submitMutation.mutate();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- gated on application.id alone; mutation identity isn't stable across renders.
  }, [application?.id]);

  useEffect(() => {
    if (doneCount >= verificationCopy.checks.length) return;
    const timer = setTimeout(() => setDoneCount((c) => c + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [doneCount]);

  const animationComplete = doneCount >= verificationCopy.checks.length;

  useEffect(() => {
    if (animationComplete && submitMutation.isSuccess) {
      queryClient.setQueryData(onboardingQueryKey, submitMutation.data);
      navigate('/onboarding/approved');
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- navigate/queryClient are stable; submitMutation.data tracked via isSuccess.
  }, [animationComplete, submitMutation.isSuccess]);

  return (
    <OnboardingLayout stepIndex={3} title={verificationCopy.title} subtitle={verificationCopy.subtitle}>
      <ul className="space-y-3">
        {verificationCopy.checks.map((check, index) => {
          const isDone = index < doneCount;
          const isActive = index === doneCount && !animationComplete;

          return (
            <li
              key={check.key}
              className="flex items-center gap-3 rounded-md px-4 py-3.5"
              style={{ border: '1px solid var(--color-border-subtle)' }}
            >
              <span className="shrink-0" style={{ color: isDone ? 'var(--color-brand-400)' : 'var(--color-text-secondary)' }}>
                {isDone ? (
                  <CheckCircleIcon color="var(--color-brand-400)" />
                ) : isActive ? (
                  <SpinnerIcon color="var(--color-text-primary)" />
                ) : (
                  <EmptyCircleIcon color="var(--color-text-secondary)" />
                )}
              </span>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: isDone ? 'var(--color-brand-400)' : isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {check.title}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {check.hint}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {submitMutation.isError ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--color-danger)' }}>
          We couldn’t complete these checks. Check your connection and try again.
        </p>
      ) : null}

      <div className="pt-8">
        <Button type="button" variant="outline" onClick={() => navigate('/onboarding/documents')}>
          {verificationCopy.back}
        </Button>
      </div>
    </OnboardingLayout>
  );
}
