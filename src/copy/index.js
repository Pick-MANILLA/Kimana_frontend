export const brand = {
  name: 'Kimana',
};

export const footerDisclaimer =
  'Secured and encrypted. Processed under CBN KYC guidelines and the Nigeria Data Protection Act.';

export function timeOfDayGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const onboardingSteps = [
  'Business details',
  'Directors & UBO',
  'Documents',
  'Verification',
  'Approved',
];

export const businessDetailsCopy = {
  title: 'Business details',
  subtitle: 'Register your company to access cross-border payments and trade finance.',
  authSectionTitle: 'Account Authentication',
  email: { label: 'Business Email Address', placeholder: 'name@company.com' },
  password: { label: 'Password', placeholder: 'Minimum 6 characters' },
  confirmPassword: { label: 'Confirm Password', placeholder: 'Re-enter your password' },
  legalName: { label: 'Registered Business Name', placeholder: 'e.g. Adunola Exports Ltd' },
  cacNumber: { label: 'RC Number (CAC)', placeholder: 'RC-1234567' },
  businessType: { label: 'Business Type', placeholder: 'Select an option' },
  industry: { label: 'Industry / Sector', placeholder: 'Select an option' },
  state: { label: 'Primary State of Operation', placeholder: 'Select an option' },
  continue: 'Continue',
};

export const businessTypeOptions = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'limited_liability_company', label: 'Limited Liability Company' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'public_limited_company', label: 'Public Limited Company' },
];

export const industryOptions = [
  { value: 'agriculture_agro_export', label: 'Agriculture & Agro-export' },
  { value: 'textiles_apparel', label: 'Textiles & Apparel' },
  { value: 'solid_minerals', label: 'Solid Minerals' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'oil_gas_services', label: 'Oil & Gas Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'trading_commodities', label: 'Trading & Commodities' },
  { value: 'other', label: 'Other' },
];

export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

export const directorsUboCopy = {
  title: 'Directors & beneficial owners',
  subtitle: 'All directors and any individual owning 25%+ must be identified (CBN KYC requirement).',
  fullName: { label: 'Director Full Name', placeholder: 'As on government-issued ID' },
  bvn: { label: 'Bank Verification Number (BVN)', placeholder: '11-digit BVN' },
  dateOfBirth: { label: 'Date of Birth', placeholder: 'DD/MM/YYYY' },
  nin: { label: 'National Identification Number (NIN)', placeholder: '11-digit NIN' },
  uboSectionTitle: 'Ultimate Beneficial Owner',
  uboSectionHint: '(if different from director)',
  uboFullName: { label: 'Full Name', placeholder: 'UBO full name' },
  uboOwnership: { label: 'Ownership %', placeholder: 'e.g. 60' },
  addAnother: 'Add another director',
  back: 'Back',
  continue: 'Continue',
};

export const documentsCopy = {
  title: 'Upload documents',
  subtitle: 'Certified copies required. PDF, JPG, or PNG — max 10 MB each.',
  confirmAuthentic: 'I confirm all uploaded documents are authentic and unaltered',
  uploaded: 'Uploaded',
  upload: 'Upload',
  replace: 'Replace',
  retry: 'Retry',
  uploading: 'Uploading…',
  failed: 'Upload failed',
  back: 'Back',
  continue: 'Continue',
  checklist: [
    { type: 'cac_certificate', title: 'CAC Certificate of Incorporation', hint: 'Form CAC2 or CAC1.1', required: true },
    { type: 'memart', title: 'Memorandum & Articles of Association', hint: 'Signed and certified copy', required: true },
    { type: 'proof_of_address', title: 'Proof of Business Address', hint: 'Utility bill, within 3 months', required: true },
    { type: 'directors_id', title: "Director's Valid Government ID", hint: 'NIN slip, passport, or driver’s licence', required: true },
    { type: 'board_resolution', title: 'Board Resolution (optional)', hint: 'Authorising payment signatories', required: false },
  ],
};

export const verificationCopy = {
  title: 'Running KYB checks',
  subtitle: 'This takes less than 60 seconds. Please keep this window open.',
  back: 'Back',
  checks: [
    { key: 'cac_lookup', title: 'CAC Registration Lookup', hint: 'Verifying RC Number with the Corporate Affairs Commission' },
    { key: 'director_identity', title: 'Director Identity (NIBSS)', hint: 'Cross-referencing BVN with Nigeria Inter-Bank Settlement System' },
    { key: 'sanctions_pep', title: 'Sanctions & PEP Screening', hint: 'Checking OFAC SDN, EU Consolidated List, UN Sanctions' },
    { key: 'adverse_media', title: 'Adverse Media Scan', hint: 'Scanning news sources and public enforcement records' },
    { key: 'risk_rating', title: 'Risk Rating Assignment', hint: 'Applying segment, corridor, and volume risk model' },
  ],
};

export const approvedCopy = {
  title: 'Account approved',
  subtitle: 'Your business is verified and ready to send cross-border payments.',
  accountIdLabel: 'Account ID',
  riskRating: 'Risk Rating',
  segment: 'Segment',
  corridor: 'Corridor',
  monthlyLimit: 'Monthly Limit',
  enterDashboard: 'Enter dashboard',
};

export const dashboardCopy = {
  newTransfer: '+ New Transfer',
  recentTransfers: 'Recent Transfers',
  last5: 'Last 5 transactions',
  viewAll: 'View all',
  liveFxRates: 'Live FX Rates',
  fxRefreshHint: 'Indicative · 2-min refresh',
  getFirmQuote: 'Get firm quote',
  pendingActions: 'Pending Actions',
  urgentCount: (n) => `${n} urgent`,
  workingCapital: 'Working Capital',
  applyNow: 'Apply now',
  stats: {
    volume30d: '30-day volume',
    inProgress: 'In progress',
    payoutSuccess: 'Payout success',
    avgSettlement: 'Avg. settlement',
  },
  table: {
    reference: 'Reference',
    beneficiary: 'Beneficiary',
    amount: 'Amount',
    rate: 'Rate (NGN)',
    status: 'Status',
    date: 'Date',
  },
};

/** Plain-language transfer status labels — never the raw enum value. */
export const transferStatusLabel = {
  CREATED: 'Getting started',
  QUOTED: 'Quote ready',
  SCREENED: 'Screened',
  AWAITING_FUNDS: 'Awaiting funds',
  FUNDED: 'Funds received',
  SETTLING: 'Settling',
  SETTLED: 'Settled',
  PAYING_OUT: 'Paying out',
  COMPLETED: 'Completed',
  REJECTED: 'Not completed',
  EXPIRED: 'Expired',
  REVERSING: 'Reversing',
  REVERSED: 'Reversed',
};

/** One line explaining what's happening and what, if anything, the customer should do. */
export const transferStatusDescription = {
  CREATED: 'We’re setting up your transfer.',
  QUOTED: 'Your rate is locked in. Review and confirm to continue.',
  SCREENED: 'Your transfer passed routine checks and is moving forward.',
  AWAITING_FUNDS: 'Send your payment using the reference provided to continue.',
  FUNDED: 'We’ve received your funds and are getting ready to convert them.',
  SETTLING: 'Your money is being converted at the locked-in rate.',
  SETTLED: 'Conversion is complete. We’re preparing the payout.',
  PAYING_OUT: 'Your money is on its way to the recipient.',
  COMPLETED: 'This transfer is complete.',
  REJECTED: 'This transfer couldn’t be completed. See below for what to do next.',
  EXPIRED: 'This transfer expired before it was funded. Start a new one when you’re ready.',
  REVERSING: 'We’re reversing this transfer and returning your funds.',
  REVERSED: 'This transfer was reversed. Your funds have been returned.',
};

export const transferFailureCopy = {
  network: 'A connection issue interrupted this transfer. Try again — your progress is saved.',
  validation: 'Something in this transfer needs correcting before it can proceed.',
  compliance_hold: 'This transfer is under review. We’ll update you as soon as it clears.',
  partner_failure: 'Our payment partner couldn’t complete this step. We’re retrying automatically.',
};

// ---------------------------------------------------------------------------
// Exchange page copy
// ---------------------------------------------------------------------------

export const exchangeCopy = {
  pageTitle: 'Exchange',
  pageSubtitle: 'Convert between your local-currency balances and your settlement balance, or send funds to an external destination.',

  settlementBalanceLabel: 'Settlement Balance',
  settlementBalanceCurrencyName: 'Settlement Unit',
  settlementBalanceCurrencyCode: 'XSD',
  settlementBalanceDescription: 'Your available settlement balance, ready to convert or send externally.',

  tabs: {
    toSettlement: 'Local → Settlement',
    fromSettlement: 'Settlement → Local',
    externalPayout: 'External Payout',
  },

  // ── Convert local → settlement ──────────────────────────────────────────
  convertIn: {
    title: 'Convert to settlement balance',
    subtitle: 'Choose a local-currency balance to convert. The rate is locked for 90 seconds once you request a firm quote.',
    sourceLabel: 'From',
    sourcePlaceholder: 'Select currency',
    amountLabel: 'Amount to convert',
    amountPlaceholder: '0.00',
    indicativeRateLabel: 'Indicative rate',
    getQuote: 'Get firm quote',
    loadingRate: 'Fetching rate…',
    noRate: 'Select a currency to see the rate',
  },

  // ── Convert settlement → local ──────────────────────────────────────────
  convertOut: {
    title: 'Convert to local currency',
    subtitle: 'Convert part of your settlement balance back to a local currency at the locked rate.',
    destinationLabel: 'To',
    destinationPlaceholder: 'Select currency',
    amountLabel: 'Amount (XSD)',
    amountPlaceholder: '0.00',
    indicativeRateLabel: 'Indicative rate',
    getQuote: 'Get firm quote',
    loadingRate: 'Fetching rate…',
    noRate: 'Select a destination currency to see the rate',
  },

  // ── External payout ──────────────────────────────────────────────────────
  payout: {
    title: 'Send to external destination',
    subtitle: 'Transfer settlement balance to an external destination. A flat dispatch fee applies.',
    amountLabel: 'Amount (XSD)',
    amountPlaceholder: '0.00',
    destinationRefLabel: 'Destination reference',
    destinationRefPlaceholder: 'Enter destination reference',
    destinationRefHint: 'Provide the exact reference for the destination you want to send to.',
    getQuote: 'Get firm quote',
  },

  // ── Shared quote / confirm step ─────────────────────────────────────────
  quote: {
    title: 'Confirm conversion',
    payoutTitle: 'Confirm payout',
    quoteExpiresIn: 'Quote expires in',
    quoteExpired: 'Quote expired — request a new one',
    breakdown: {
      youSend: 'You send',
      youReceive: 'You receive',
      destination: 'Destination',
      rate: 'Exchange rate',
      fee: 'Dispatch fee',
      noFee: 'No fee',
      totalDeducted: 'Total deducted',
    },
    confirm: 'Confirm',
    requote: 'Get new quote',
    back: 'Back',
    processing: 'Processing…',
  },

  // ── Success step ─────────────────────────────────────────────────────────
  success: {
    conversionTitle: 'Conversion complete',
    payoutTitle: 'Payout submitted',
    conversionBody: 'Your balances have been updated. The converted amount is now available.',
    payoutBody: 'Your payout is being processed. Track its progress below.',
    reference: 'Reference',
    done: 'Done',
    viewPayouts: 'View payout status',
    goBack: 'Back to exchange',
  },

  // ── Payout history / status tracker ─────────────────────────────────────
  payoutHistory: {
    title: 'Recent payouts',
    empty: 'No payouts yet.',
    reference: 'Reference',
    amount: 'Amount',
    destination: 'Destination',
    status: 'Status',
    date: 'Date',
  },

  // ── Errors ───────────────────────────────────────────────────────────────
  errors: {
    amountRequired: 'Enter an amount to continue.',
    amountPositive: 'Amount must be greater than zero.',
    amountExceedsBalance: 'Amount exceeds your available balance.',
    currencyRequired: 'Select a currency to continue.',
    destinationRequired: 'Enter a destination reference to continue.',
    destinationTooShort: 'Destination reference is too short — check and try again.',
    quoteExpired: 'This quote has expired. Request a new one to continue.',
    generic: 'Something went wrong. Try again.',
    network: 'A connection issue interrupted this request. Check your signal and try again.',
  },
};

/** Plain-language labels for settlement payout statuses. */
export const payoutStatusLabel = {
  SUBMITTED: 'Submitted',
  PROCESSING: 'Processing',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  FAILED: 'Not completed',
  CANCELLED: 'Cancelled',
};

/** One-line customer-facing descriptions for each payout status. */
export const payoutStatusDescription = {
  SUBMITTED: 'Your payout request has been received and is queued.',
  PROCESSING: 'We\'re preparing your funds for dispatch.',
  DISPATCHED: 'Your funds are on their way to the destination.',
  COMPLETED: 'Your payout was delivered successfully.',
  FAILED: 'This payout couldn\'t be completed. Contact support if funds haven\'t returned.',
  CANCELLED: 'This payout was cancelled before dispatch.',
};

/** Badge tone for each payout status — mirrors transferStatusTone conventions. */
export const payoutStatusTone = {
  SUBMITTED: 'neutral',
  PROCESSING: 'info',
  DISPATCHED: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'danger',
};

/** Human-readable currency names for local balances shown on the exchange page. */
export const currencyName = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  GHS: 'Ghanaian Cedi',
  KES: 'Kenyan Shilling',
  ZAR: 'South African Rand',
  XOF: 'West African CFA Franc',
  XAF: 'Central African CFA Franc',
  EGP: 'Egyptian Pound',
  XSD: 'Settlement Unit',
};

// ---------------------------------------------------------------------------
// Transfers history page copy
// ---------------------------------------------------------------------------

export const transfersPageCopy = {
  pageTitle: 'Transfers',
  pageSubtitle: 'Full history of your cross-border payments.',

  // ── Toolbar ───────────────────────────────────────────────────────────────
  searchPlaceholder: 'Search by reference or beneficiary…',
  filterStatus: 'Status',
  filterStatusAll: 'All statuses',
  filterCurrency: 'Currency',
  filterCurrencyAll: 'All currencies',
  filterDateFrom: 'From',
  filterDateTo: 'To',
  filterAmountMin: 'Min amount',
  filterAmountMax: 'Max amount',
  clearFilters: 'Clear filters',
  exportBtn: 'Download statement',
  exportToast: 'Your statement export has been queued. You will be notified when it is ready.',
  startTransfer: '+ New Transfer',

  // ── Table headers ─────────────────────────────────────────────────────────
  colReference: 'Reference',
  colBeneficiary: 'Beneficiary',
  colAmount: 'Amount',
  colRate: 'Rate (NGN)',
  colStatus: 'Status',
  colDate: 'Date',
  colDescription: 'Description',

  // ── Pagination ────────────────────────────────────────────────────────────
  pageSize: 8,
  showingOf: (from, to, total) => `Showing ${from}–${to} of ${total}`,
  prevPage: 'Previous',
  nextPage: 'Next',

  // ── Loading / error / empty states ────────────────────────────────────────
  loadingTitle: 'Loading transfers…',
  errorTitle: 'Could not load transfers',
  errorBody: 'A connection issue prevented your transfers from loading. Check your signal and try again.',
  errorRetry: 'Try again',
  emptyTitle: 'No transfers yet',
  emptyBody: 'When you send your first cross-border payment it will appear here.',
  emptyAction: 'Start a transfer',
  noMatchTitle: 'No matching transfers',
  noMatchBody: 'Try adjusting your search or filters.',

  // ── Detail panel ──────────────────────────────────────────────────────────
  detailTitle: 'Transfer details',
  detailClose: 'Close',
  detailReference: 'Reference',
  detailBeneficiary: 'Beneficiary',
  detailDescription: 'Description',
  detailSendAmount: 'You sent',
  detailReceiveAmount: 'Beneficiary received',
  detailRate: 'Exchange rate',
  detailCreated: 'Created',
  detailUpdated: 'Last updated',
  detailPayoutRef: 'Payout reference',
  detailReversalReason: 'Reversal reason',
  timelineTitle: 'Status timeline',
  timelineLoadingTitle: 'Loading timeline…',
  timelineErrorTitle: 'Could not load timeline',
  timelineErrorRetry: 'Retry',
};
