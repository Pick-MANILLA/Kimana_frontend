import { HomePage } from '../../src/features/dashboard/HomePage';
import { RequireSession } from '../../src/features/auth/RequireSession';

export default function Page() {
  return (
    <RequireSession>
      <HomePage />
    </RequireSession>
  );
}
