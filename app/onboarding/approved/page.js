import { ApprovedPage } from '../../../src/features/onboarding/ApprovedPage';
import { RequireSession } from '../../../src/features/auth/RequireSession';

export default function Page() {
  return (
    <RequireSession>
      <ApprovedPage />
    </RequireSession>
  );
}
