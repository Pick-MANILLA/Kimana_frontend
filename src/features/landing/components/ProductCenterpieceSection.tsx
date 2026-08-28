import { useQuery } from '@tanstack/react-query';
import { api, DEMO_CUSTOMER_ID } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { ArrowUpRightIcon, PlusIcon } from '../../../components/ui/icons';
import { formatMoney } from '../../../money/money';
import { BalanceCard } from '../../dashboard/BalanceCard';
import { FxRatesPanel } from '../../dashboard/FxRatesPanel';
import { PendingActionsPanel } from '../../dashboard/PendingActionsPanel';
import { TransfersTable } from '../../dashboard/TransfersTable';
import { WorkingCapitalCard } from '../../dashboard/WorkingCapitalCard';

const CURRENCY_FULL_NAME: Record<string, string> = { NGN: 'Nigerian Naira', USD: 'US Dollar', EUR: 'Euro' };

export function ProductCenterpieceSection() {
  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'landing'],
    queryFn: () => api.dashboard.getOverview(DEMO_CUSTOMER_ID),
  });
  const transfersQuery = useQuery({
    queryKey: ['transfers', 'list', 'landing'],
    queryFn: () => api.transfers.listTransfers(DEMO_CUSTOMER_ID),
  });
  const recipientsQuery = useQuery({
    queryKey: ['recipients', 'list', 'landing'],
    queryFn: () => api.recipients.listRecipients(DEMO_CUSTOMER_ID),
  });

  const overview = overviewQuery.data;
  const recipientsById = new Map((recipientsQuery.data ?? []).map((r) => [r.id, r]));

  return (
    <section id="product" className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            POWERFUL INFRASTRUCTURE
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl" style={{ color: 'var(--color-text-primary)' }}>
            Built around a real business dashboard.
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Manage balances across multiple currencies, request firm quotes, execute settlements, and track payouts in one unified interface.
          </p>
        </div>

        {/* Product Dashboard Frame */}
        <div
          className="relative rounded-2xl border p-4 sm:p-6 lg:p-8 shadow-2xl transition-all"
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border-subtle)',
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          {/* Top Bar of Dashboard Frame */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {overview?.displayName || 'Adunola Exports Ltd'}
                </h3>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Account: {overview?.accountId || 'KMN-84920'} · Verified Tier 3 Business Account
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" className="text-xs py-2 px-4">
                <PlusIcon size={14} color="var(--color-text-on-brand)" /> New Transfer
              </Button>
            </div>
          </div>

          {/* Balances Row */}
          {overview?.balances && overview.balances.length > 0 ? (
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
                      highlight?.secondaryLine ??
                      (balance.pending ? `Pending: ${formatMoney(balance.pending, { signDisplay: true })}` : undefined)
                    }
                    deltaText={highlight?.deltaText ?? ''}
                    deltaTone={highlight?.deltaTone ?? 'success'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>NGN Balance</div>
                <div className="mt-2 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>₦48,500,000.00</div>
              </div>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>USD Balance</div>
                <div className="mt-2 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>$35,000.00</div>
              </div>
            </div>
          )}

          {/* Main Dashboard Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 7 Cols: Recent Transfers Table */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Recent Cross-Border Transfers
                    </h4>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Live settlement monitoring & status tracking
                    </p>
                  </div>
                  <button type="button" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>
                    View all <ArrowUpRightIcon size={12} />
                  </button>
                </div>

                <div className="mt-4">
                  <TransfersTable transfers={transfersQuery.data ?? []} recipientsById={recipientsById} />
                </div>
              </div>
            </div>

            {/* Right 5 Cols: FX Rates & Panels */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <FxRatesPanel />
              {overview?.pendingActions && overview.pendingActions.length > 0 ? (
                <PendingActionsPanel actions={overview.pendingActions} />
              ) : null}
              {overview?.workingCapitalOffer ? (
                <WorkingCapitalCard offer={overview.workingCapitalOffer} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
