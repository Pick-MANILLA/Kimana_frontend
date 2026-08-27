import type { LedgerApi } from '../types/ledger';
import { simulateNetwork } from './simulate';
import { store } from './seed';

export const ledgerApi: LedgerApi = {
  async getBalances(_customerId) {
    await simulateNetwork();
    return store.balances;
  },

  async getStatement(_customerId, _filter) {
    await simulateNetwork();
    return { items: [] };
  },

  async requestStatementExport(_customerId, _filter) {
    await simulateNetwork();
    return { requestId: `export_${Math.random().toString(36).slice(2, 10)}` };
  },
};
