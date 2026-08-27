import type { AuditApi } from '../types/audit';
import { simulateNetwork } from './simulate';

export const auditApi: AuditApi = {
  async list(_filter) {
    await simulateNetwork();
    return { items: [] };
  },
};
