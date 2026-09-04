import { simulateNetwork } from './simulate';

export const partnerApi = {
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

export const customerDelayApi = {
  async getDelayNotice(_transferId) {
    await simulateNetwork();
    return null;
  },
};
