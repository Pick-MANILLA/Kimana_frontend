import type { CustomerDelayApi, PartnerApi } from '../types/partners';
import { simulateNetwork } from './simulate';

export const partnerApi: PartnerApi = {
  async getStatuses() {
    await simulateNetwork();
    const now = new Date().toISOString();
    return [
      { id: 'partner_collection', kind: 'collection', name: 'Collections partner', status: 'healthy', lastCheckedAt: now },
      { id: 'partner_payout', kind: 'payout', name: 'Payout partner', status: 'healthy', lastCheckedAt: now },
      { id: 'partner_fx', kind: 'fx', name: 'FX liquidity partner', status: 'healthy', lastCheckedAt: now },
    ];
  },
};

export const customerDelayApi: CustomerDelayApi = {
  async getDelayNotice(_transferId) {
    await simulateNetwork();
    return null;
  },
};
