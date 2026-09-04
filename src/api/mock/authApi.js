import { simulateNetwork } from './simulate';
import { store } from './seed';

export const authApi = {
  async getSession() {
    await simulateNetwork({ minMs: 100, maxMs: 250, failureRate: 0 });
    return store.session;
  },
};
