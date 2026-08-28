import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { ArrowUpRightIcon, CardIcon, DocumentIcon, GridIcon, LogOutIcon, PlusIcon, SendIcon } from '../../components/ui/icons';
import { timeOfDayGreeting } from '../../copy';
import { formatLongDate } from '../../lib/formatDate';
import { BalanceCard } from './BalanceCard';
import { DocumentsView } from './DocumentsView';
import { FxRatesPanel } from './FxRatesPanel';
import type { CompletedDemoTransfer } from './NewTransferModal';
import { NewTransferModal } from './NewTransferModal';
import { ReconciliationView } from './ReconciliationView';
import type { DashboardNavTab } from './Sidebar';
import { Sidebar } from './Sidebar';
import { TransfersTable } from './TransfersTable';
import { WorkingCapitalCard } from './WorkingCapitalCard';

export function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardNavTab>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState('10,000');
  const [modalCurrency, setModalCurrency] = useState('USD');
  const [userTransfers, setUserTransfers] = useState<CompletedDemoTransfer[]>([]);

  const handleLogout = () => {
    localStorage.removeItem('kimana_session');
    navigate('/login');
  };

  const handleOpenTransferModal = (amount = '10,000', curr = 'USD') => {
    setModalAmount(amount);
    setModalCurrency(curr);
    setIsModalOpen(true);
  };

  const handleTransferCompleted = (newTransfer: CompletedDemoTransfer) => {
    setUserTransfers((prev) => [newTransfer, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans" style={{ background: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}>
      {/* Mobile Top Header (hidden on md and larger) */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
        <LogoWithWordmark size={26} />
        <div className="flex items-center gap-2">
          <ThemeToggle size={26} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-rose-500/10 hover:text-rose-400"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <LogOutIcon size={14} color="currentColor" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Tabs */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-b gap-2" style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
        {[
          { id: 'overview' as const, label: 'Overview', icon: GridIcon },
          { id: 'transfers' as const, label: 'Transfers', icon: SendIcon },
          { id: 'documents' as const, label: 'Documents', icon: DocumentIcon },
          { id: 'reconciliation' as const, label: 'Reconciliation', icon: CardIcon },
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
          >
            <Icon size={14} color="currentColor" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Left Navigation Sidebar (desktop) */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-10 lg:px-12 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: 'var(--color-text-primary)' }}>
              {timeOfDayGreeting()}, Adunola Exports Ltd
            </h1>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Adunola Exports Ltd · Account KMN-84920 · {formatLongDate(new Date().toISOString())}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" className="px-6 py-2.5 font-bold" onClick={() => handleOpenTransferModal('10,000', 'USD')}>
              <PlusIcon size={14} color="var(--color-text-on-brand)" /> New Transfer
            </Button>
            
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
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
                  <span className="text-[11px] text-neutral-400 font-normal">Demo Business Balances</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <BalanceCard
                    currencyName="Nigerian Naira"
                    currency="NGN"
                    balance={{ amountMinor: 1245000000, currency: 'NGN' }}
                    secondaryLine="NIP Liquidity Ready"
                    deltaText="Available Operating Balance"
                    deltaTone="success"
                  />
                  <BalanceCard
                    currencyName="US Dollar"
                    currency="USD"
                    balance={{ amountMinor: 2500000, currency: 'USD' }}
                    secondaryLine="Correspondent Rail Active"
                    deltaText="Cross-Border Pool"
                    deltaTone="success"
                  />
                  <BalanceCard
                    currencyName="Euro"
                    currency="EUR"
                    balance={{ amountMinor: 1800000, currency: 'EUR' }}
                    secondaryLine="SEPA Settlement Ready"
                    deltaText="Eurozone Corridor"
                    deltaTone="success"
                  />
                </div>
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
                      <TransfersTable customTransfers={userTransfers} />
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>All Cross-Border Transfers</h2>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Full audit log of active and completed transfers</p>
                </div>
                <Button type="button" className="px-5 text-xs font-bold" onClick={() => handleOpenTransferModal('10,000', 'USD')}>
                  <PlusIcon size={14} color="var(--color-text-on-brand)" /> Start Transfer
                </Button>
              </div>

              <div className="rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
                <TransfersTable customTransfers={userTransfers} />
              </div>
            </div>
          )}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'reconciliation' && <ReconciliationView />}
        </div>

        {/* Multi-Step New Transfer Modal */}
        <NewTransferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTransferCompleted={handleTransferCompleted}
          initialAmount={modalAmount}
          initialCurrency={modalCurrency}
        />
      </main>
    </div>
  );
}
