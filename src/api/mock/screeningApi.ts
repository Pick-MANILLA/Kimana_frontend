import type { ScreeningApi } from '../types/screening';
import { apiError, simulateNetwork } from './simulate';

export const screeningApi: ScreeningApi = {
  async getCustomerStatus(transferId) {
    await simulateNetwork();
    return { transferId, outcome: 'clear' };
  },

  async getQueue(_filter) {
    await simulateNetwork();
    return [];
  },

  async getQueueItem(id) {
    await simulateNetwork();
    throw apiError('NOT_FOUND', `No queue item ${id}.`, false);
  },

  async decide(_id, input) {
    await simulateNetwork();
    if (!input.note.trim()) {
      throw apiError('VALIDATION', 'A note is required for every screening decision.', false);
    }
    throw apiError('NOT_FOUND', 'That queue item no longer exists.', false);
  },
};
