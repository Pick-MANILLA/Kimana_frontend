import type { BusinessDetails, DocumentFileInput, OnboardingApi, UploadedDocument } from '../types/onboarding';
import { apiError, delay, simulateNetwork } from './simulate';
import { store } from './seed';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const INDUSTRY_SEGMENT_LABEL: Record<BusinessDetails['industry'], string> = {
  agriculture_agro_export: 'Agro Exporter',
  textiles_apparel: 'Textiles Exporter',
  solid_minerals: 'Solid Minerals Exporter',
  manufacturing: 'Manufacturing Exporter',
  oil_gas_services: 'Oil & Gas Services',
  technology: 'Technology Exporter',
  trading_commodities: 'Commodities Trader',
  other: 'Trading Business',
};

function generateAccountId(legalName: string): string {
  const initials = legalName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  const serial = Math.floor(Math.random() * 90000 + 10000);
  return `${initials || 'KMA'}-${serial}`;
}

function assertFile(file: DocumentFileInput): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimeType)) {
    throw apiError('VALIDATION', 'That file type isn’t supported. Upload a PDF, JPG, or PNG.', false);
  }
  if (file.sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw apiError('VALIDATION', 'That file is larger than 10 MB. Compress it or choose a smaller copy.', false);
  }
}

async function runUpload(doc: UploadedDocument, onProgress?: (percent: number) => void): Promise<UploadedDocument> {
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    await delay(180, 320);
    const percent = Math.round((i / steps) * 100);
    onProgress?.(percent);
    const idx = store.onboarding.documents.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      store.onboarding = {
        ...store.onboarding,
        documents: store.onboarding.documents.map((d) =>
          d.id === doc.id ? { ...d, uploadProgressPercent: percent } : d,
        ),
      };
    }
  }

  const failed = Math.random() < 0.12;
  const finalDoc: UploadedDocument = failed
    ? { ...doc, status: 'failed', uploadProgressPercent: 100, errorMessage: 'Upload interrupted. Try again.' }
    : { ...doc, status: 'uploaded', uploadProgressPercent: 100, uploadedAt: new Date().toISOString() };

  store.onboarding = {
    ...store.onboarding,
    documents: store.onboarding.documents.map((d) => (d.id === doc.id ? finalDoc : d)),
  };
  return finalDoc;
}

export const onboardingApi: OnboardingApi = {
  async getApplication(customerId) {
    await simulateNetwork();
    if (customerId !== store.onboarding.customerId) {
      throw apiError('NOT_FOUND', 'No application found for this customer.', false);
    }
    return store.onboarding;
  },

  async saveBusinessDetails(applicationId, business) {
    await simulateNetwork();
    if (applicationId !== store.onboarding.id) throw apiError('NOT_FOUND', 'Application not found.', false);
    store.onboarding = { ...store.onboarding, business, status: 'draft' };
    return store.onboarding;
  },

  async savePrincipals(applicationId, principals) {
    await simulateNetwork();
    if (applicationId !== store.onboarding.id) throw apiError('NOT_FOUND', 'Application not found.', false);
    store.onboarding = { ...store.onboarding, principals: [...principals] };
    return store.onboarding;
  },

  async uploadDocument(applicationId, file, onProgress) {
    if (applicationId !== store.onboarding.id) throw apiError('NOT_FOUND', 'Application not found.', false);
    assertFile(file);
    await delay(150, 300);

    const doc: UploadedDocument = {
      id: `doc_${Math.random().toString(36).slice(2, 10)}`,
      type: file.type,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      status: 'uploading',
      uploadProgressPercent: 0,
    };
    store.onboarding = {
      ...store.onboarding,
      documents: [...store.onboarding.documents.filter((d) => d.type !== file.type), doc],
    };

    return runUpload(doc, onProgress);
  },

  async retryDocumentUpload(applicationId, documentId) {
    if (applicationId !== store.onboarding.id) throw apiError('NOT_FOUND', 'Application not found.', false);
    const existing = store.onboarding.documents.find((d) => d.id === documentId);
    if (!existing) throw apiError('NOT_FOUND', 'Document not found.', false);

    const resetDoc: UploadedDocument = { ...existing, status: 'uploading', uploadProgressPercent: 0, errorMessage: undefined };
    store.onboarding = {
      ...store.onboarding,
      documents: store.onboarding.documents.map((d) => (d.id === documentId ? resetDoc : d)),
    };
    return runUpload(resetDoc);
  },

  async removeDocument(applicationId, documentId) {
    await simulateNetwork();
    if (applicationId !== store.onboarding.id) throw apiError('NOT_FOUND', 'Application not found.', false);
    store.onboarding = {
      ...store.onboarding,
      documents: store.onboarding.documents.filter((d) => d.id !== documentId),
    };
  },

  async submit(applicationId) {
    if (applicationId !== store.onboarding.id) throw apiError('NOT_FOUND', 'Application not found.', false);
    store.onboarding = { ...store.onboarding, status: 'submitted', submittedAt: new Date().toISOString() };
    await delay(300, 500);
    store.onboarding = { ...store.onboarding, status: 'in_review' };

    // Total KYB check simulation window — kept in step with VerificationPage's
    // local checklist animation so the screen doesn't finish before this resolves.
    await delay(6000, 6500);

    const business = store.onboarding.business;
    const legalName = business?.legalName ?? 'Your business';
    store.onboarding = {
      ...store.onboarding,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      approvedSummary: {
        accountId: generateAccountId(legalName),
        riskRatingLabel: 'Medium-Low',
        segment: business ? INDUSTRY_SEGMENT_LABEL[business.industry] : 'Trading Business',
        corridor: 'NGN → USD / EUR',
        monthlyLimit: { amountMinor: 100_000_00, currency: 'USD' },
      },
    };
    return store.onboarding;
  },
};
