import { apiError, simulateNetwork } from './simulate';
import { store } from './seed';

const TERMINAL = new Set(['COMPLETED', 'REJECTED', 'EXPIRED', 'REVERSED']);

export const transferApi = {
  async createTransfer(_input) {
    await simulateNetwork();
    throw apiError('SERVER_ERROR', "Transfer creation isn't wired up yet.", false);
  },

  async getTransfer(id) {
    await simulateNetwork();
    const transfer = store.transfers.find((t) => t.id === id);
    if (!transfer) throw apiError('NOT_FOUND', "That transfer couldn't be found.", false);
    return transfer;
  },

  async getTimeline(id) {
    await simulateNetwork();
    const transfer = store.transfers.find((t) => t.id === id);
    if (!transfer) throw apiError('NOT_FOUND', "That transfer couldn't be found.", false);
    // Use the rich history array seeded on each transfer; fall back to
    // the single current-state entry for any transfer that predates it.
    const history =
      transfer.history ?? [{ status: transfer.state.status, enteredAt: transfer.state.enteredAt }];
    return {
      transferId: id,
      history,
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
