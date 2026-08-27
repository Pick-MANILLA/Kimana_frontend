import type { DashboardApi } from '../types/dashboard';
import { simulateNetwork } from './simulate';
import { store } from './seed';

const TERMINAL_NON_COMPLETE = new Set(['REJECTED', 'EXPIRED', 'REVERSED']);

export const dashboardApi: DashboardApi = {
  async getOverview(_customerId) {
    await simulateNetwork();

    const approved = store.onboarding.approvedSummary;
    const business = store.onboarding.business;
    const firstPrincipal = store.onboarding.principals[0];
    const firstName = firstPrincipal?.fullName.split(/\s+/)[0];

    const inProgressCount = store.transfers.filter(
      (t) => t.state.status !== 'COMPLETED' && !TERMINAL_NON_COMPLETE.has(t.state.status),
    ).length;

    return {
      displayName: firstName ?? store.session.displayName,
      businessName: business?.legalName ?? 'Adunola Exports Ltd',
      accountId: approved?.accountId ?? 'AEL-00029',
      balances: store.balances,
      balanceHighlights: [
        { currency: 'NGN', secondaryLine: '≈ USD 29,330', deltaText: '+₦2.4M this month', deltaTone: 'success' },
        { currency: 'USD', secondaryLine: 'Pending: +$18,500', deltaText: 'TXN-8843 settling', deltaTone: 'success' },
        { currency: 'EUR', secondaryLine: '≈ USD 19,760', deltaText: 'TXN-8842 in progress', deltaTone: 'warning' },
      ],
      stats: {
        volume30d: { amountMinor: 16_350_000, currency: 'USD' },
        transfersInProgress: inProgressCount,
        // Computed over the customer's full history, not just the 5 recent rows shown below.
        payoutSuccessRatePercent: 98.3,
        avgSettlementSeconds: 402,
      },
      pendingActions: store.pendingActions,
      workingCapitalOffer: store.workingCapitalOffer,
    };
  },
};
