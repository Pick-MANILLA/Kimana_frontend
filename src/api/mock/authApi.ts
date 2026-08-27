import type { AuthApi } from '../types/auth';
import { simulateNetwork } from './simulate';
import { store } from './seed';

export const authApi: AuthApi = {
  async getSession() {
    await simulateNetwork({ minMs: 100, maxMs: 250, failureRate: 0 });
    return store.session;
  },
};
