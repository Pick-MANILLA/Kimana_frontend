import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import type { OnboardingDocumentType, UploadedDocument } from '../../api/types/onboarding';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { documentsCopy } from '../../copy';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

export function DocumentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: application } = useOnboardingApplication();
  const [confirmed, setConfirmed] = useState(false);
  const [progressByType, setProgressByType] = useState<Partial<Record<OnboardingDocumentType, number>>>({});
  const fileInputRefs = useRef<Partial<Record<OnboardingDocumentType, HTMLInputElement | null>>>({});

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: OnboardingDocumentType; file: File }) => {
      if (!application) throw new Error('Application not loaded yet');
      setProgressByType((prev) => ({ ...prev, [type]: 0 }));
      return api.onboarding.uploadDocument(
        application.id,
        { type, fileName: file.name, mimeType: file.type, sizeBytes: file.size, data: file },
        (percent) => setProgressByType((prev) => ({ ...prev, [type]: percent })),
      );
    },
    onSuccess: (doc) => applyDocument(doc),
  });

  const retryMutation = useMutation({
    mutationFn: (documentId: string) => {
      if (!application) throw new Error('Application not loaded yet');
      return api.onboarding.retryDocumentUpload(application.id, documentId);
    },
    onSuccess: (doc) => applyDocument(doc),
  });

  function applyDocument(doc: UploadedDocument) {
    queryClient.setQueryData(onboardingQueryKey, (prev: typeof application) =>
      prev ? { ...prev, documents: [...prev.documents.filter((d) => d.type !== doc.type), doc] } : prev,
    );
    setProgressByType((prev) => ({ ...prev, [doc.type]: undefined }));
  }

  function triggerPicker(type: OnboardingDocumentType) {
    fileInputRefs.current[type]?.click();
  }

  function onFileChosen(type: OnboardingDocumentType, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadMutation.mutate({ type, file });
  }

  const documents = application?.documents ?? [];
  const requiredSatisfied = documentsCopy.checklist
    .filter((item) => item.required)
    .every((item) => documents.find((d) => d.type === item.type)?.status === 'uploaded');
  const canContinue = requiredSatisfied && confirmed;

  return (
    <OnboardingLayout stepIndex={2} title={documentsCopy.title} subtitle={documentsCopy.subtitle}>
      <ul className="space-y-3">
        {documentsCopy.checklist.map((item) => {
          const doc = documents.find((d) => d.type === item.type);
          const progress = progressByType[item.type];
          const isUploading = doc?.status === 'uploading' || progress !== undefined;

          return (
            <li
              key={item.type}
              className="flex items-center justify-between gap-4 rounded-md px-4 py-3.5"
              style={{ border: '1px solid var(--color-border-subtle)' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {isUploading ? `${documentsCopy.uploading} ${progress ?? doc?.uploadProgressPercent ?? 0}%` : item.hint}
                </p>
                {doc?.status === 'failed' ? (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-danger)' }}>
                    {documentsCopy.failed}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <input
                  ref={(el) => {
                    fileInputRefs.current[item.type] = el;
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={(e) => onFileChosen(item.type, e)}
                />
                {doc?.status === 'uploaded' ? (
                  <>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: 'var(--color-success)', color: 'var(--color-on-success)' }}
                    >
                      {documentsCopy.uploaded}
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerPicker(item.type)}
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-brand-400)' }}
                    >
                      {documentsCopy.replace}
                    </button>
                  </>
                ) : doc?.status === 'failed' ? (
                  <Button type="button" variant="outline" onClick={() => retryMutation.mutate(doc.id)}>
                    {documentsCopy.retry}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" disabled={isUploading} onClick={() => triggerPicker(item.type)}>
                    {isUploading ? '…' : documentsCopy.upload}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <Checkbox
          label={documentsCopy.confirmAuthentic}
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
      </div>

      <div className="flex justify-between gap-3 pt-8">
        <Button type="button" variant="outline" onClick={() => navigate('/onboarding/directors-ubo')}>
          {documentsCopy.back}
        </Button>
        <Button type="button" disabled={!canContinue} onClick={() => navigate('/onboarding/verification')}>
          {documentsCopy.continue}
        </Button>
      </div>
    </OnboardingLayout>
  );
}
