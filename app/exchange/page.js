import { ExchangePage } from '../../src/features/exchange/ExchangePage';
import { RequireSession } from '../../src/features/auth/RequireSession';

export const metadata = {
  title: 'Exchange — Kimana',
};

export default function Page() {
  return (
    <RequireSession>
      <ExchangePage />
    </RequireSession>
  );
}
