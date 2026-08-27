import { useQuery } from '@tanstack/react-query';
import { api, DEMO_CUSTOMER_ID } from '../../api';
import { Button } from '../../components/ui/Button';
import { ArrowUpRightIcon, CheckCircleIcon, ClockIcon, PlusIcon } from '../../components/ui/icons';
import { dashboardCopy, timeOfDayGreeting } from '../../copy';
import { formatLongDate } from '../../lib/formatDate';
import { formatMoney } from '../../money/money';
import { BalanceCard } from './BalanceCard';
import { FxRatesPanel } from './FxRatesPanel';
import { PendingActionsPanel } from './PendingActionsPanel';
import { Sidebar } from './Sidebar';
import { StatTile } from './StatTile';
import { TransfersTable } from './TransfersTable';
import { WorkingCapitalCard } from './WorkingCapitalCard';

const CURRENCY_FULL_NAME: Record<string, string> = { NGN: 'Nigerian Naira', USD: 'US Dollar', EUR: 'Euro' };

export function HomePage() {
  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.dashboard.getOverview(DEMO_CUSTOMER_ID),
  });
  const transfersQuery = useQuery({
    queryKey: ['transfers', 'list'],
    queryFn: () => api.transfers.listTransfers(DEMO_CUSTOMER_ID),
  });
  const recipientsQuery = useQuery({
    queryKey: ['recipients', 'list'],
    queryFn: () => api.recipients.listRecipients(DEMO_CUSTOMER_ID),
  });

  const overview = overviewQuery.data;
  const recipientsById = new Map((recipientsQuery.data ?? []).map((r) => [r.id, r]));

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-canvas)' }}>
      <Sidebar />

      <main className="min-w-0 flex-1 px-gutter py-6 sm:px-8">
        {overviewQuery.isLoading ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading your dashboard…
          </p>
        ) : overviewQuery.isError || !overview ? (
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            We couldn’t load your dashboard. Check your connection and try again.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {timeOfDayGreeting()}, {overview.displayName}
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {overview.businessName} · {overview.accountId} · {formatLongDate(new Date().toISOString())}
                </p>
              </div>
              <Button type="button">
                <PlusIcon size={14} color="var(--color-text-on-brand)" /> {dashboardCopy.newTransfer.replace('+ ', '')}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {overview.balances.map((balance) => {
                const highlight = overview.balanceHighlights.find((h) => h.currency === balance.currency);
                return (
                  <BalanceCard
                    key={balance.currency}
                    currencyName={CURRENCY_FULL_NAME[balance.currency] ?? balance.currency}
                    currency={balance.currency}
                    balance={balance.balance}
                    secondaryLine={
                      highlight?.secondaryLine ?? (balance.pending ? `Pending: ${formatMoney(balance.pending, { signDisplay: true })}` : undefined)
                    }
                    deltaText={highlight?.deltaText ?? ''}
                    deltaTone={highlight?.deltaTone ?? 'success'}
                  />
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                icon={<ArrowUpRightIcon color="var(--color-text-secondary)" />}
                label={dashboardCopy.stats.volume30d}
                value={formatMoney(overview.stats.volume30d)}
              />
              <StatTile
                icon={<ClockIcon color="var(--color-text-secondary)" />}
                label={dashboardCopy.stats.inProgress}
                value={`${overview.stats.transfersInProgress} transfers`}
              />
              <StatTile
                icon={<CheckCircleIcon color="var(--color-success)" />}
                label={dashboardCopy.stats.payoutSuccess}
                value={`${overview.stats.payoutSuccessRatePercent}%`}
              />
              <StatTile
                icon={<ClockIcon color="var(--color-text-secondary)" />}
                label={dashboardCopy.stats.avgSettlement}
                value={formatSettlementDuration(overview.stats.avgSettlementSeconds)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-md p-4 lg:col-span-2" style={{ background: 'var(--color-surface-1)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {dashboardCopy.recentTransfers}
                    </h2>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {dashboardCopy.last5}
                    </p>
                  </div>
                  <button type="button" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-brand-400)' }}>
                    {dashboardCopy.viewAll} <ArrowUpRightIcon size={12} />
                  </button>
                </div>
                <div className="mt-4">
                  <TransfersTable transfers={transfersQuery.data ?? []} recipientsById={recipientsById} />
                </div>
              </div>

              <div>
                <FxRatesPanel />
                <PendingActionsPanel actions={overview.pendingActions} />
                {overview.workingCapitalOffer ? <WorkingCapitalCard offer={overview.workingCapitalOffer} /> : null}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function formatSettlementDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} min ${seconds}s`;
}
