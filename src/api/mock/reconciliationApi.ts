import type { ReconciliationApi } from '../types/reconciliation';
import { apiError, simulateNetwork } from './simulate';

export const reconciliationApi: ReconciliationApi = {
  async getDashboard(_date) {
    await simulateNetwork();
    return [];
  },

  async listBreaks(_filter) {
    await simulateNetwork();
    return [];
  },

  async getBreak(id) {
    await simulateNetwork();
    throw apiError('NOT_FOUND', `No break ${id}.`, false);
  },

  async updateBreakStatus(id, status, resolutionNote) {
    await simulateNetwork();
    if (status === 'resolved' && !resolutionNote?.trim()) {
      throw apiError('VALIDATION', 'A resolution note is required to close a break.', false);
    }
    throw apiError('NOT_FOUND', `No break ${id}.`, false);
  },
};
