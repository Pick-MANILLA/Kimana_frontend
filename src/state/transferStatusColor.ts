import type { TransferStatus } from '../api/types/transfer';

export type StatusTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

/** Which semantic chip color a status badge renders in. */
export const transferStatusTone: Record<TransferStatus, StatusTone> = {
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

const TERMINAL_STATUSES: ReadonlySet<TransferStatus> = new Set(['COMPLETED', 'REJECTED', 'EXPIRED', 'REVERSED']);

export function isTerminalStatus(status: TransferStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}
