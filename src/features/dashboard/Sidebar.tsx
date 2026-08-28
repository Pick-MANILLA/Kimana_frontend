import { useNavigate } from 'react-router-dom';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { CardIcon, DocumentIcon, GearIcon, GridIcon, LogOutIcon, SendIcon, ShieldIcon } from '../../components/ui/icons';

export type DashboardNavTab = 'overview' | 'transfers' | 'documents' | 'reconciliation';

interface SidebarProps {
  activeTab: DashboardNavTab;
  onTabChange: (tab: DashboardNavTab) => void;
  onLogout?: () => void;
}

const NAV_ITEMS: readonly { id: DashboardNavTab; icon: typeof GridIcon; label: string }[] = [
  { id: 'overview', icon: GridIcon, label: 'Overview' },
  { id: 'transfers', icon: SendIcon, label: 'Transfers' },
  { id: 'documents', icon: DocumentIcon, label: 'Documents' },
  { id: 'reconciliation', icon: CardIcon, label: 'Reconciliation' },
];

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('kimana_session');
      navigate('/login');
    }
  };

  return (
    <aside
      className="hidden w-60 shrink-0 flex-col justify-between py-6 px-4 md:flex border-r transition-colors"
      style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}
      aria-label="Main navigation"
    >
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
                  onClick={() => onTabChange(id)}
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
          className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors hover:text-white"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <GearIcon size={16} color="var(--color-text-secondary)" />
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
    </aside>
  );
}


