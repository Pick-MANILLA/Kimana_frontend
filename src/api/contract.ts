import type { AuthApi } from './types/auth';
import type { AuditApi } from './types/audit';
import type { DashboardApi } from './types/dashboard';
import type { TradeDocumentApi, OpsTradeDocumentApi } from './types/documents';
import type { LedgerApi, OpsLedgerApi } from './types/ledger';
import type { OnboardingApi } from './types/onboarding';
import type { OpsTransactionApi } from './types/opsTransactions';
import type { CustomerDelayApi, PartnerApi } from './types/partners';
import type { QuoteApi } from './types/quote';
import type { ReconciliationApi } from './types/reconciliation';
import type { ScreeningApi } from './types/screening';
import type { RecipientApi, TransferApi } from './types/transfer';

/**
 * The complete server contract. Both the mock layer (src/api/mock/) and the
 * eventual live client implement this same interface, so swapping one for
 * the other is a single module change wherever an ApiClient is constructed.
 */
export interface ApiClient {
  readonly auth: AuthApi;
  readonly dashboard: DashboardApi;
  readonly onboarding: OnboardingApi;
  readonly screening: ScreeningApi;
  readonly quote: QuoteApi;
  readonly recipients: RecipientApi;
  readonly transfers: TransferApi;
  readonly ledger: LedgerApi;
  readonly tradeDocuments: TradeDocumentApi;
  readonly reconciliation: ReconciliationApi;
  readonly partners: PartnerApi;
  readonly delays: CustomerDelayApi;
  readonly audit: AuditApi;

  // Ops-only surfaces. Bundled here rather than a separate interface so one
  // ApiClient type covers both areas — route-level code splitting (not this
  // contract) is what keeps ops code out of the customer bundle.
  readonly opsTransactions: OpsTransactionApi;
  readonly opsLedger: OpsLedgerApi;
  readonly opsTradeDocuments: OpsTradeDocumentApi;
}
