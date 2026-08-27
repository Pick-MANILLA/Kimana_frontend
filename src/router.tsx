import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

const BusinessDetailsPage = lazy(() =>
  import('./features/onboarding/BusinessDetailsPage').then((m) => ({ default: m.BusinessDetailsPage })),
);
const DirectorsUboPage = lazy(() =>
  import('./features/onboarding/DirectorsUboPage').then((m) => ({ default: m.DirectorsUboPage })),
);
const DocumentsPage = lazy(() =>
  import('./features/onboarding/DocumentsPage').then((m) => ({ default: m.DocumentsPage })),
);
const VerificationPage = lazy(() =>
  import('./features/onboarding/VerificationPage').then((m) => ({ default: m.VerificationPage })),
);
const ApprovedPage = lazy(() =>
  import('./features/onboarding/ApprovedPage').then((m) => ({ default: m.ApprovedPage })),
);
const HomePage = lazy(() => import('./features/dashboard/HomePage').then((m) => ({ default: m.HomePage })));
const TokenPreviewPage = lazy(() => import('./App'));

function RouteFallback() {
  return <div className="min-h-screen" style={{ background: 'var(--color-canvas)' }} aria-hidden="true" />;
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/onboarding/business-details" replace /> },
  { path: '/onboarding/business-details', element: withSuspense(<BusinessDetailsPage />) },
  { path: '/onboarding/directors-ubo', element: withSuspense(<DirectorsUboPage />) },
  { path: '/onboarding/documents', element: withSuspense(<DocumentsPage />) },
  { path: '/onboarding/verification', element: withSuspense(<VerificationPage />) },
  { path: '/onboarding/approved', element: withSuspense(<ApprovedPage />) },
  { path: '/dashboard', element: withSuspense(<HomePage />) },
  { path: '/dev/tokens', element: withSuspense(<TokenPreviewPage />) },
  // /ops mounts here once the back office is built — a separate lazy branch
  // so its bundle never ships to the customer app.
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
