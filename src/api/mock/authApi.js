import { apiError, simulateNetwork } from './simulate';
import { store } from './seed';

export const authApi = {
  async getSession() {
    await simulateNetwork({ minMs: 100, maxMs: 250, failureRate: 0 });
    return store.session;
  },

  /** input: { email, password, displayName, legalName } */
  async register(input) {
    await simulateNetwork();
    if (!input?.email || !input?.password) {
      throw apiError('VALIDATION', 'Email and password are required.', false);
    }
    store.session = { ...store.session, displayName: input.displayName ?? store.session.displayName };
    return store.session;
  },

  /** input: { email, password } */
  async login(_input) {
    await simulateNetwork();
    return store.session;
  },

  async logout() {
    await simulateNetwork({ minMs: 100, maxMs: 200, failureRate: 0 });
  },
};
