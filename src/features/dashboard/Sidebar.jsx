'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { ArrowRightIcon, CardIcon, DocumentIcon, GearIcon, GridIcon, LogOutIcon, SendIcon, ShieldIcon, XIcon } from '../../components/ui/icons';

const NAV_ITEMS = [
  { id: 'overview', icon: GridIcon, label: 'Overview' },
  { id: 'transfers', icon: SendIcon, label: 'Transfers' },
  { id: 'documents', icon: DocumentIcon, label: 'Documents' },
  { id: 'reconciliation', icon: CardIcon, label: 'Reconciliation' },
];

// Items that navigate to a dedicated route rather than switching a tab.
const NAV_LINKS = [
  { id: 'exchange', icon: ArrowRightIcon, label: 'Exchange', href: '/exchange' },
];

// Shared nav markup used by both the persistent desktop sidebar and the
// tablet off-canvas drawer, so the two never drift out of sync.
function SidebarContent({ activeTab, onTabChange, onLogout, onNavigate }) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('kimana_session');
      router.push('/login');
    }
  };

  const handleTabChange = (id) => {
    onTabChange(id);
    onNavigate?.();
  };

  const handleLinkNavigate = (href) => {
    router.push(href);
    onNavigate?.();
  };

  return (
    <>
      <div>
        <div className="px-3 mb-8 flex items-center justify-between">
          <LogoWithWordmark size={32} />
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => handleTabChange(id)}
                  className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent',
                    color: isActive ? 'var(--color-brand-600)' : 'var(--color-text-secondary)',
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--color-brand-600)' : 'var(--color-text-secondary)'} />
                  <span>{label}</span>
                </button>
              </li>
            );
          })}

          {/* Divider before route-navigation items */}
          <li role="separator" className="my-1.5 mx-3.5 border-t" style={{ borderColor: 'var(--color-border-subtle)' }} aria-hidden="true" />

          {NAV_LINKS.map(({ id, icon: Icon, label, href }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => handleLinkNavigate(href)}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Icon size={18} color="var(--color-text-secondary)" />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4 flex flex-col gap-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center justify-between px-3 py-1 mb-1">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Appearance</span>
          <ThemeToggle size={30} />
        </div>
        <button
          type="button"
          className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors hover:text-white"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ShieldIcon size={16} color="var(--color-text-secondary)" />
          <span>Security & Audit</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('settings')}
          className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors"
          style={{
            backgroundColor: activeTab === 'settings' ? 'var(--color-surface-2)' : 'transparent',
            color: activeTab === 'settings' ? 'var(--color-brand-600)' : 'var(--color-text-secondary)',
          }}
        >
          <GearIcon size={16} color={activeTab === 'settings' ? 'var(--color-brand-600)' : 'var(--color-text-secondary)'} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-3.5 py-2 mt-2 rounded-xl text-xs font-semibold transition-all hover:bg-rose-500/10 hover:text-rose-400 group"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Sign out of your session"
        >
          <LogOutIcon size={16} color="currentColor" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}

// Persistent sidebar — desktop only (lg+). Tablet and phone use the top
// toolbar + drawer/tab-bar instead, since a fixed 240px rail eats too much
// of the viewport below that width.
export function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside
      className="hidden w-60 shrink-0 flex-col justify-between py-6 px-4 lg:flex border-r transition-colors"
      style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}
      aria-label="Main navigation"
    >
      <SidebarContent activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />
    </aside>
  );
}

// Off-canvas nav for tablet widths — opened from a menu button in the
// tablet toolbar (see HomePage). Auto-hides at lg+ so a resize while open
// can't leave it stacked on top of the persistent sidebar.
export function SidebarDrawer({ isOpen, onClose, activeTab, onTabChange, onLogout }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();

    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col justify-between overflow-y-auto py-6 px-4 border-r shadow-2xl outline-none relative"
        style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <XIcon size={18} color="currentColor" />
        </button>

        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
          onNavigate={onClose}
        />
      </aside>
    </div>
  );
}
