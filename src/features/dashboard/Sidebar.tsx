import { LogoMark } from '../../components/ui/Logo';
import { CardIcon, DocumentIcon, GearIcon, GridIcon, LayersIcon, SendIcon, ShieldIcon } from '../../components/ui/icons';

const NAV_ITEMS = [
  { icon: GridIcon, label: 'Dashboard', active: true },
  { icon: SendIcon, label: 'Transfers', active: false },
  { icon: DocumentIcon, label: 'Documents', active: false },
  { icon: CardIcon, label: 'Accounts', active: false },
  { icon: LayersIcon, label: 'Statements', active: false },
] as const;

export function Sidebar() {
  return (
    <nav
      className="hidden w-16 shrink-0 flex-col items-center gap-6 py-5 sm:flex"
      style={{ background: 'var(--color-canvas)', borderRight: '1px solid var(--color-border-subtle)' }}
      aria-label="Main navigation"
    >
      <LogoMark size={32} />

      <ul className="flex flex-col items-center gap-2">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <li key={label}>
            <button
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex h-10 w-10 items-center justify-center rounded-md"
              style={{ background: active ? 'var(--color-surface-2)' : 'transparent' }}
            >
              <Icon color={active ? 'var(--color-brand-400)' : 'var(--color-text-secondary)'} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col items-center gap-3">
        <button type="button" aria-label="Security" className="flex h-9 w-9 items-center justify-center">
          <ShieldIcon color="var(--color-text-secondary)" />
        </button>
        <button type="button" aria-label="Settings" className="flex h-9 w-9 items-center justify-center">
          <GearIcon color="var(--color-text-secondary)" />
        </button>
        <div
          className="h-8 w-8 rounded-full"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-subtle)' }}
          aria-hidden="true"
        />
      </div>
    </nav>
  );
}
