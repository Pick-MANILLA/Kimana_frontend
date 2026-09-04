import { apiError, simulateNetwork } from './simulate';
import { store } from './seed';

const TERMINAL = new Set(['COMPLETED', 'REJECTED', 'EXPIRED', 'REVERSED']);

export const transferApi = {
  async createTransfer(_input) {
    await simulateNetwork();
    throw apiError('SERVER_ERROR', 'Transfer creation isn’t wired up yet.', false);
  },

  async getTransfer(id) {
    await simulateNetwork();
    const transfer = store.transfers.find((t) => t.id === id);
    if (!transfer) throw apiError('NOT_FOUND', 'That transfer couldn’t be found.', false);
    return transfer;
  },

  async getTimeline(id) {
    await simulateNetwork();
    const transfer = store.transfers.find((t) => t.id === id);
    if (!transfer) throw apiError('NOT_FOUND', 'That transfer couldn’t be found.', false);
    return {
      transferId: id,
      history: [{ status: transfer.state.status, enteredAt: transfer.state.enteredAt }],
      isTerminal: TERMINAL.has(transfer.state.status),
    };
  },

  async listTransfers(customerId, filter) {
    await simulateNetwork();
    return store.transfers.filter(
      (t) => t.customerId === customerId && (!filter?.status || t.state.status === filter.status),
    );
  },
};
