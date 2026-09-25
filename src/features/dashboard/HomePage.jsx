'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, DEMO_CUSTOMER_ID } from '../../api';
import { sessionQueryKey } from '../auth/useSession';
import { Button } from '../../components/ui/Button';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { ArrowUpRightIcon, CardIcon, DocumentIcon, GearIcon, GridIcon, LogOutIcon, MenuIcon, PlusIcon, ReceiveIcon, SendIcon, ArrowRightIcon } from '../../components/ui/icons';
import { timeOfDayGreeting } from '../../copy';
import { formatLongDate } from '../../lib/formatDate';
import { BalanceCard } from './BalanceCard';
import { DocumentsView } from './DocumentsView';
import { FxRatesPanel } from './FxRatesPanel';
import { NewTransferModal } from './NewTransferModal';
import { ReceivePage } from './ReceivePage';
import { ReconciliationView } from './ReconciliationView';
import { Sidebar, SidebarDrawer } from './Sidebar';
import { TransfersTable } from './TransfersTable';
import { TransfersPage } from './TransfersPage';
import { WorkingCapitalCard } from './WorkingCapitalCard';
import { SettingsView } from './SettingsView';
import { useDefaultCurrency } from '../../hooks/useDefaultCurrency';

const CURRENCY_FULL_NAME = { NGN: 'Nigerian Naira', USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', GHS: 'Ghanaian Cedi' };

export function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState('10,000');
  const [modalCurrency, setModalCurrency] = useState('USD');
  // Not fed into the real transfers list below — NewTransferModal doesn't
  // yet create a real backend transfer, so there's nothing genuine to merge in.
  const [, setUserTransfers] = useState([]);
  const { preferredCurrency } = useDefaultCurrency();

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.dashboard.getOverview(DEMO_CUSTOMER_ID),
  });
  const overview = overviewQuery.data;

  const transfersQuery = useQuery({
    queryKey: ['transfers', 'list', DEMO_CUSTOMER_ID],
    queryFn: () => api.transfers.listTransfers(DEMO_CUSTOMER_ID),
  });
  const recipientsQuery = useQuery({
    queryKey: ['recipients', 'list', DEMO_CUSTOMER_ID],
    queryFn: () => api.recipients.listRecipients(DEMO_CUSTOMER_ID),
  });
  const recentTransfers = (transfersQuery.data ?? []).slice(0, 5);
  const recipientsById = new Map((recipientsQuery.data ?? []).map((r) => [r.id, r]));

  const balanceCards = (overview?.balances ?? []).map((balance) => {
    const highlight = overview.balanceHighlights?.find((h) => h.currency === balance.currency);
    return {
      currency: balance.currency,
      currencyName: CURRENCY_FULL_NAME[balance.currency] ?? balance.currency,
      balance: balance.balance,
      secondaryLine: highlight?.secondaryLine,
      deltaText: highlight?.deltaText ?? '',
      deltaTone: highlight?.deltaTone ?? 'success',
    };
  });

  // Float the preferred currency to position 0, keep the rest in original order.
  const orderedBalanceCards = [
    ...balanceCards.filter((c) => c.currency === preferredCurrency),
    ...balanceCards.filter((c) => c.currency !== preferredCurrency),
  ];

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Sign the user out locally regardless — a failed logout call shouldn't trap them in the app.
    }
    queryClient.removeQueries({ queryKey: sessionQueryKey });
    router.push('/login');
  };

  const handleOpenTransferModal = (amount = '10,000', curr = 'USD') => {
    setModalAmount(amount);
    setModalCurrency(curr);
    setIsModalOpen(true);
  };

  const handleTransferCompleted = (newTransfer) => {
    setUserTransfers((prev) => [newTransfer, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ background: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}>
      {/* Mobile Top Header (phones only — tablet gets its own toolbar below) */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
        <LogoWithWordmark size={26} />
        <div className="flex items-center gap-2">
          <ThemeToggle size={26} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <LogOutIcon size={14} color="currentColor" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Tabs */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-b gap-2" style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: GridIcon },
          { id: 'transfers', label: 'Transfers', icon: SendIcon },
          { id: 'receive', label: 'Receive', icon: ReceiveIcon },
          { id: 'documents', label: 'Documents', icon: DocumentIcon },
          { id: 'reconciliation', label: 'Reconciliation', icon: CardIcon },
          { id: 'settings', label: 'Settings', icon: GearIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
            style={{
              backgroundColor: activeTab === id ? 'var(--color-surface-2)' : 'transparent',
              color: activeTab === id ? 'var(--color-brand-600)' : 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => { if (activeTab !== id) e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; }}
            onMouseLeave={(e) => { if (activeTab !== id) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Icon size={14} color="currentColor" />
            <span>{label}</span>
          </button>
        ))}
        {/* Exchange navigates to its own route */}
        <button
          type="button"
          onClick={() => router.push('/exchange')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ArrowRightIcon size={14} color="currentColor" />
          <span>Exchange</span>
        </button>
      </div>

      {/* Tablet Toolbar (md–lg): sidebar is hidden at this width, opened via menu button */}
      <div className="hidden md:flex lg:hidden items-center justify-between px-6 py-3 border-b" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
          >
            <MenuIcon size={18} color="currentColor" />
          </button>
          <LogoWithWordmark size={28} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size={28} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <LogOutIcon size={14} color="currentColor" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Left Navigation Sidebar (desktop, lg+) */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* Off-canvas nav for tablet, opened from the toolbar above */}
      <SidebarDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-10 lg:px-12 overflow-y-auto">
       <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: 'var(--color-text-primary)' }}>
              {timeOfDayGreeting()}{overview ? `, ${overview.displayName}` : ''}
            </h1>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {overview ? `${overview.businessName} · Account ${overview.accountId} · ` : ''}
              {formatLongDate(new Date().toISOString())}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" className="px-6 py-2.5 font-bold" onClick={() => handleOpenTransferModal('10,000', 'USD')}>
              <PlusIcon size={14} color="var(--color-text-on-brand)" /> New Transfer
            </Button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = 'var(--color-danger)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-1)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
              }}
              title="Sign out of your session"
            >
              <LogOutIcon size={15} color="currentColor" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>


        {/* View Switcher based on Sidebar activeTab */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Balances Section */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <span>Available Liquidity Balances</span>
                </div>

                {overviewQuery.isLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-32 animate-pulse rounded-md" style={{ background: 'var(--color-surface-1)' }} />
                    ))}
                  </div>
                ) : overviewQuery.isError ? (
                  <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                    {overviewQuery.error?.message || 'We couldn’t load your balances. Check your connection and try again.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {orderedBalanceCards.map((card) => (
                      <BalanceCard
                        key={card.currency}
                        currencyName={card.currencyName}
                        currency={card.currency}
                        balance={card.balance}
                        secondaryLine={card.secondaryLine}
                        deltaText={card.deltaText}
                        deltaTone={card.deltaTone}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Main Overview Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left 7 Cols: Recent Transfers Table */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
                    <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      <div>
                        <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Recent Transfers</h2>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Live payment state monitoring</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('transfers')}
                        className="flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-400"
                      >
                        View all <ArrowUpRightIcon size={12} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <TransfersTable
                        transfers={recentTransfers}
                        recipientsById={recipientsById}
                        isLoading={transfersQuery.isLoading}
                        isError={transfersQuery.isError}
                        onRetry={() => transfersQuery.refetch()}
                      />
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: FX Quote & Working Capital */}
                <div className="lg:col-span-5 space-y-6">
                  <FxRatesPanel onGetFirmQuote={(amt, curr) => handleOpenTransferModal(amt, curr)} />
                  <WorkingCapitalCard />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <TransfersPage onNewTransfer={() => handleOpenTransferModal('10,000', 'USD')} />
          )}

          {activeTab === 'receive' && <ReceivePage />}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'reconciliation' && <ReconciliationView />}

          {activeTab === 'settings' && <SettingsView />}
        </div>

        {/* Multi-Step New Transfer Modal */}
        <NewTransferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTransferCompleted={handleTransferCompleted}
          initialAmount={modalAmount}
          initialCurrency={modalCurrency}
        />
       </div>
      </main>
    </div>
  );
}
