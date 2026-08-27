import type { OpsLedgerApi } from '../types/ledger';
import type { OpsTransactionApi } from '../types/opsTransactions';
import { apiError, simulateNetwork } from './simulate';

export const opsTransactionApi: OpsTransactionApi = {
  async search(_filter) {
    await simulateNetwork();
    return { items: [] };
  },

  async getDetail(transferId) {
    await simulateNetwork();
    throw apiError('NOT_FOUND', `No transaction ${transferId}.`, false);
  },

  async initiateAction(transferId, input) {
    await simulateNetwork();
    if (!input.note.trim()) {
      throw apiError('VALIDATION', 'A note is required to initiate a manual action.', false);
    }
    return {
      id: `mact_${Math.random().toString(36).slice(2, 10)}`,
      transferId,
      type: input.type,
      note: input.note,
      initiatedBy: 'ops_stub_initiator',
      initiatedAt: new Date().toISOString(),
      status: 'pending_approval',
    };
  },

  async approveAction(actionId, note) {
    await simulateNetwork();
    if (!note.trim()) throw apiError('VALIDATION', 'A note is required to approve an action.', false);
    throw apiError('NOT_FOUND', `No pending action ${actionId}.`, false);
  },

  async rejectAction(actionId, note) {
    await simulateNetwork();
    if (!note.trim()) throw apiError('VALIDATION', 'A note is required to reject an action.', false);
    throw apiError('NOT_FOUND', `No pending action ${actionId}.`, false);
  },
};

export const opsLedgerApi: OpsLedgerApi = {
  async getAccountEntries(_accountId, _filter) {
    await simulateNetwork();
    return { items: [] };
  },
};
