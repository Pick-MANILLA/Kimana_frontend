import { simulateNetwork } from './simulate';

export const auditApi = {
  async list(_filter) {
    await simulateNetwork();
    return { items: [] };
  },
};
