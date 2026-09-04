import { apiError, simulateNetwork } from './simulate';

const REQUIRED_TYPES = ['form_m', 'form_q', 'paar', 'bill_of_lading', 'commercial_invoice'];

export const tradeDocumentApi = {
  async getChecklist(_transferId) {
    await simulateNetwork();
    return REQUIRED_TYPES.map((type) => ({ type, required: true, satisfied: false }));
  },

  async listDocuments(_transferId) {
    await simulateNetwork();
    return [];
  },

  async uploadDocument(transferId, type, file, onProgress) {
    await simulateNetwork();
    onProgress?.(100);
    return {
      id: `tdoc_${Math.random().toString(36).slice(2, 10)}`,
      transferId,
      type,
      status: 'submitted',
      fileName: file.fileName,
      uploadedAt: new Date().toISOString(),
    };
  },
};

export const opsTradeDocumentApi = {
  async review(documentId, _decision) {
    await simulateNetwork();
    throw apiError('NOT_FOUND', `No document ${documentId}.`, false);
  },
};
