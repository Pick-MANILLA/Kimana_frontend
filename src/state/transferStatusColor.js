/** Which semantic chip color a status badge renders in. */
export const transferStatusTone = {
  CREATED: 'neutral',
  QUOTED: 'neutral',
  SCREENED: 'info',
  AWAITING_FUNDS: 'warning',
  FUNDED: 'info',
  SETTLING: 'info',
  SETTLED: 'info',
  PAYING_OUT: 'info',
  COMPLETED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'danger',
  REVERSING: 'warning',
  REVERSED: 'danger',
};

const TERMINAL_STATUSES = new Set(['COMPLETED', 'REJECTED', 'EXPIRED', 'REVERSED']);

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}
