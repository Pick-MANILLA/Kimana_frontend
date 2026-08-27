import type { ApiClient } from '../contract';
import { auditApi } from './auditApi';
import { authApi } from './authApi';
import { dashboardApi } from './dashboardApi';
import { tradeDocumentApi, opsTradeDocumentApi } from './documentsApi';
import { ledgerApi } from './ledgerApi';
import { onboardingApi } from './onboardingApi';
import { opsLedgerApi, opsTransactionApi } from './opsApi';
import { customerDelayApi, partnerApi } from './partnersApi';
import { quoteApi } from './quoteApi';
import { reconciliationApi } from './reconciliationApi';
import { recipientApi } from './recipientApi';
import { screeningApi } from './screeningApi';
import { transferApi } from './transferApi';

export const mockApiClient: ApiClient = {
  auth: authApi,
  dashboard: dashboardApi,
  onboarding: onboardingApi,
  screening: screeningApi,
  quote: quoteApi,
  recipients: recipientApi,
  transfers: transferApi,
  ledger: ledgerApi,
  tradeDocuments: tradeDocumentApi,
  reconciliation: reconciliationApi,
  partners: partnerApi,
  delays: customerDelayApi,
  audit: auditApi,
  opsTransactions: opsTransactionApi,
  opsLedger: opsLedgerApi,
  opsTradeDocuments: opsTradeDocumentApi,
};
