import { DocumentsPage } from '../../../src/features/onboarding/DocumentsPage';
import { RequireSession } from '../../../src/features/auth/RequireSession';

export default function Page() {
  return (
    <RequireSession>
      <DocumentsPage />
    </RequireSession>
  );
}
