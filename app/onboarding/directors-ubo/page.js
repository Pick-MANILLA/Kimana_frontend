import { DirectorsUboPage } from '../../../src/features/onboarding/DirectorsUboPage';
import { RequireSession } from '../../../src/features/auth/RequireSession';

export default function Page() {
  return (
    <RequireSession>
      <DirectorsUboPage />
    </RequireSession>
  );
}
