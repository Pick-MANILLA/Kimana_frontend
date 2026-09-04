import { simulateNetwork } from './simulate';
import { DEMO_CUSTOMER_ID, store } from './seed';

export const recipientApi = {
  async listRecipients(customerId) {
    await simulateNetwork();
    return store.recipients.filter((r) => r.customerId === customerId);
  },

  async validateBankAccount(input) {
    await simulateNetwork({ minMs: 500, maxMs: 1200 });
    // Deterministic demo resolution — a real integration would call the partner's name-lookup API.
    return { accountName: `Verified Beneficiary (${input.accountNumber.slice(-4)})` };
  },

  async saveRecipient(input) {
    await simulateNetwork();
    const recipient = {
      id: `rcpt_${Math.random().toString(36).slice(2, 10)}`,
      customerId: DEMO_CUSTOMER_ID,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
      bankName: 'Partner Bank',
      currency: input.currency,
      country: input.country,
      validationStatus: 'valid',
      savedAt: new Date().toISOString(),
    };
    store.recipients.push(recipient);
    return recipient;
  },
};
