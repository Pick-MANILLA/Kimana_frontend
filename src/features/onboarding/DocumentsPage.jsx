'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { documentsCopy } from '../../copy';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

// Some OSes report an empty MIME type, so the extension is the fallback signal.
function validateFile(file) {
  if (file.size > MAX_FILE_SIZE_BYTES) return documentsCopy.tooLarge;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeOk = !file.type || ALLOWED_MIME_TYPES.includes(file.type);
  if (!ALLOWED_EXTENSIONS.includes(extension) || !mimeOk) return documentsCopy.unsupportedType;
  return null;
}

function toRowError(err) {
  return {
    message: err?.code === 'NETWORK' ? documentsCopy.network : err?.message || documentsCopy.uploadFailedFallback,
    retryable: err?.retryable !== false,
  };
}

export function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: application } = useOnboardingApplication();
  const [confirmed, setConfirmed] = useState(false);
  const [progressByType, setProgressByType] = useState({});
  const [errorByType, setErrorByType] = useState({});
  const fileInputRefs = useRef({});
  const lastFileByType = useRef({});

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }) => {
      if (!application) throw new Error('Application not loaded yet');
      setProgressByType((prev) => ({ ...prev, [type]: 0 }));
      return api.onboarding.uploadDocument(
        application.id,
        { type, fileName: file.name, mimeType: file.type, sizeBytes: file.size, data: file },
        (percent) => setProgressByType((prev) => ({ ...prev, [type]: percent })),
      );
    },
    onSuccess: (doc) => applyDocument(doc),
    onError: (err, { type }) => failRow(type, toRowError(err)),
  });

  const retryMutation = useMutation({
    mutationFn: ({ documentId, type }) => {
      if (!application) throw new Error('Application not loaded yet');
      setProgressByType((prev) => ({ ...prev, [type]: 0 }));
      return api.onboarding.retryDocumentUpload(application.id, documentId);
    },
    onSuccess: (doc) => applyDocument(doc),
    onError: (err, { type }) => failRow(type, toRowError(err)),
  });

  function setRowError(type, error) {
    setErrorByType((prev) => ({ ...prev, [type]: error }));
  }

  function failRow(type, error) {
    setProgressByType((prev) => ({ ...prev, [type]: undefined }));
    setRowError(type, error);
  }

  function applyDocument(doc) {
    queryClient.setQueryData(onboardingQueryKey, (prev) =>
      prev ? { ...prev, documents: [...prev.documents.filter((d) => d.type !== doc.type), doc] } : prev,
    );
    setProgressByType((prev) => ({ ...prev, [doc.type]: undefined }));
  }

  function triggerPicker(type) {
    fileInputRefs.current[type]?.click();
  }

  function onFileChosen(type, e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setRowError(type, { message: validationError, retryable: false });
      return;
    }
    lastFileByType.current[type] = file;
    setRowError(type, undefined);
    uploadMutation.mutate({ type, file });
  }

  function handleRetry(type, doc) {
    setRowError(type, undefined);
    const file = lastFileByType.current[type];
    // A thrown upload never created a server record, so re-send the file itself.
    if (errorByType[type] && file) {
      uploadMutation.mutate({ type, file });
    } else if (doc) {
      retryMutation.mutate({ documentId: doc.id, type });
    }
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
          const rowError = errorByType[item.type];
          const isFailed = Boolean(rowError) || doc?.status === 'failed';
          const isUploading = !isFailed && (doc?.status === 'uploading' || progress !== undefined);
          const canRetry = rowError ? rowError.retryable : doc?.status === 'failed';
          const failureMessage = rowError?.message ?? doc?.errorMessage ?? documentsCopy.failed;

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
                {isFailed ? (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-danger)' }} role="alert">
                    {failureMessage}
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
                {isFailed ? (
                  <>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: 'var(--color-danger)', color: 'var(--color-on-danger)' }}
                    >
                      {documentsCopy.failedBadge}
                    </span>
                    {canRetry ? (
                      <Button type="button" variant="outline" onClick={() => handleRetry(item.type, doc)}>
                        {documentsCopy.retry}
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" onClick={() => triggerPicker(item.type)}>
                        {documentsCopy.chooseAnother}
                      </Button>
                    )}
                  </>
                ) : doc?.status === 'uploaded' ? (
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
        <Button type="button" variant="outline" onClick={() => router.push('/onboarding/directors-ubo')}>
          {documentsCopy.back}
        </Button>
        <Button type="button" disabled={!canContinue} onClick={() => router.push('/onboarding/verification')}>
          {documentsCopy.continue}
        </Button>
      </div>
    </OnboardingLayout>
  );
}
