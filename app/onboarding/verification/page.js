import { VerificationPage } from '../../../src/features/onboarding/VerificationPage';
import { RequireSession } from '../../../src/features/auth/RequireSession';

export default function Page() {
  return (
    <RequireSession>
      <VerificationPage />
    </RequireSession>
  );
}
