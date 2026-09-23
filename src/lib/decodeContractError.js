/**
 * Turns an on-chain revert from SettlementVault into plain-English guidance.
 *
 * Selectors are the first 4 bytes of keccak256 of each error signature in
 * kimana_contract/abi/SettlementVault.json (custom errors plus the inherited
 * OpenZeppelin ones). Verify or regenerate any entry with `cast sig "<signature>"`.
 *
 * Returns null when the error carries no recognisable revert data, so callers
 * keep their existing message instead of a vague on-chain fallback.
 */

const WALLET_REJECTED = 'Transaction was cancelled in your wallet.';

const MSG = {
  dailyLimit: 'This transfer exceeds the 24-hour settlement limit. Reduce the amount or try again tomorrow.',
  perSettlementLimit: 'This amount is above the maximum for a single settlement. Split it into smaller transfers.',
  insufficientFree: 'The settlement vault doesn’t have enough free balance for this amount right now. Try a smaller amount or retry shortly.',
  rateDivergence: 'The exchange rate moved too far from the market rate before it could be locked. Refresh your quote to continue.',
  quoteExpired: 'This quote has expired on-chain. Request a new quote to continue.',
  quoteStale: 'The locked rate is too old to settle. Request a new quote to continue.',
  quoteUsed: 'This quote has already been used for a settlement. Request a new quote for another transfer.',
  quoteLocked: 'This quote is already locked and being processed. Check your transfer history before retrying.',
  quoteCancelled: 'This quote was cancelled. Request a new quote to continue.',
  duplicateRef: 'This transfer has already been submitted. Check your transfer history before retrying.',
  wrongState: 'This transfer isn’t in a state that allows this step. Refresh the page to see its latest status.',
  amountMismatch: 'The amount no longer matches the locked quote. Request a new quote to continue.',
  alreadyFunded: 'This transfer has already been funded.',
  notFunded: 'This transfer hasn’t been funded yet. Complete the funding step first.',
  currencyUnsupported: 'This currency isn’t currently supported for on-chain settlement.',
  zeroAmount: 'Enter an amount greater than zero.',
  paused: 'On-chain settlement is temporarily paused. Your funds are safe. Try again later.',
  platform: 'Settlement couldn’t be completed because of a configuration issue on our side. Contact support with your transfer reference.',
};

const ERROR_DICTIONARY = {
  // === Limits and liquidity
  '0x473a3226': MSG.dailyLimit, // ExceedsDailyLimit(uint256,uint256)
  '0xe4069ff3': MSG.perSettlementLimit, // ExceedsPerSettlementLimit(uint256,uint256)
  '0x4aeb0dcb': MSG.insufficientFree, // InsufficientFreeBalance(uint256,uint256)

  // === Quote lifecycle
  '0x99e28725': MSG.rateDivergence, // RateDivergenceTooHigh(bytes32,uint256,uint256)
  '0xcb089b44': MSG.quoteExpired, // QuoteExpired(bytes32,uint64)
  '0x24408ce2': MSG.quoteStale, // QuoteLockTooOld(bytes32,uint64,uint64)
  '0xe6b79916': MSG.quoteUsed, // QuoteAlreadyUsed(bytes32)
  '0x69489f08': MSG.quoteLocked, // QuoteAlreadyLocked(bytes32)
  '0x46e642ba': MSG.quoteCancelled, // QuoteIsCancelled(bytes32)
  '0xc606e672': MSG.duplicateRef, // RefAlreadyUsed(bytes32)
  '0x646a887f': MSG.wrongState, // QuoteNotLocked(bytes32)
  '0xf8618030': MSG.wrongState, // InvalidQuote()
  '0x6b3ba056': MSG.wrongState, // InvalidStatus(bytes32,uint8,uint8)
  '0x840efeb4': MSG.amountMismatch, // ReceiveAmountMismatch(uint256,uint256)
  '0x24449e0f': MSG.amountMismatch, // SettleAmountMismatch(bytes32,uint256,uint256)
  '0x88d818f8': MSG.amountMismatch, // FundAmountMismatch(bytes32,uint256,uint256)

  // === Funding
  '0x153e403d': MSG.alreadyFunded, // AlreadyFunded(bytes32)
  '0x47386530': MSG.notFunded, // NotFunded(bytes32)

  // === Input
  '0x7eddd6a4': MSG.currencyUnsupported, // CurrencyNotSupported(bytes3)
  '0x1f2a2005': MSG.zeroAmount, // ZeroAmount()

  // === Pause
  '0xd93c0665': MSG.paused, // EnforcedPause()

  // === Platform configuration: nothing the user can fix
  '0xd92e233d': MSG.platform, // ZeroAddress()
  '0xbec09223': MSG.platform, // UnsupportedAssetDecimals(uint8)
  '0x4be7f273': MSG.platform, // UnsupportedCurrencyDecimals(uint8)
  '0x7d21e99a': MSG.platform, // ZeroRef()
  '0xf31b690c': MSG.platform, // InvalidLimits(uint256,uint256)
  '0x43fc9fb5': MSG.platform, // PartnerNotAllowed(address)
  '0x2cdd6dc7': MSG.platform, // NotSettlementPartner(bytes32,address)
  '0x9d7a38b6': MSG.platform, // ZeroQuoteId()
  '0x524df01f': MSG.platform, // QuoteTtlTooLong(uint64,uint64)
  '0x377f962d': MSG.platform, // InvalidQuoteConfig()
  '0x299dcf9a': MSG.platform, // ZeroRate()
  '0x47bf1f9c': MSG.platform, // CannotRescueAssetToken()
  '0xe49a7571': MSG.platform, // PartnerCurrencyMismatch(address,bytes3,bytes3)
  '0xa47fe5cf': MSG.platform, // InvalidPartnerConfig()
  '0x8dfc202b': MSG.platform, // ExpectedPause()
  '0x6697b232': MSG.platform, // AccessControlBadConfirmation()
  '0x19ca5ebb': MSG.platform, // AccessControlEnforcedDefaultAdminDelay(uint48)
  '0x3fc3c27a': MSG.platform, // AccessControlEnforcedDefaultAdminRules()
  '0xc22c8022': MSG.platform, // AccessControlInvalidDefaultAdmin(address)
  '0xe2517d3f': MSG.platform, // AccessControlUnauthorizedAccount(address,bytes32)
  '0x3ee5aeb5': MSG.platform, // ReentrancyGuardReentrantCall()
  '0x6dfcc650': MSG.platform, // SafeCastOverflowedUintDowncast(uint8,uint256)
  '0x5274afe7': MSG.platform, // SafeERC20FailedOperation(address)
};

const SELECTOR_PATTERN = /0x[0-9a-fA-F]{8}/g;

function isWalletRejection(error) {
  const code = error?.code ?? error?.cause?.code ?? error?.info?.error?.code;
  return code === 4001 || code === 'ACTION_REJECTED';
}

// ethers v5, ethers v6, viem, and raw JSON-RPC each nest revert data differently.
function collectRevertCandidates(error) {
  return [
    error?.data,
    error?.data?.data,
    error?.revertData,
    error?.error?.data,
    error?.error?.data?.data,
    error?.info?.error?.data,
    error?.cause?.data,
    error?.message,
  ].filter((value) => typeof value === 'string');
}

export function decodeContractError(error) {
  if (!error) return null;
  if (isWalletRejection(error)) return WALLET_REJECTED;

  for (const candidate of collectRevertCandidates(error)) {
    for (const match of candidate.match(SELECTOR_PATTERN) ?? []) {
      const message = ERROR_DICTIONARY[match.toLowerCase()];
      if (message) return message;
    }
  }
  return null;
}
