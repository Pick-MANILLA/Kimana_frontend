import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './icons';

export interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function BackButton({ to, onClick, label = 'Back', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label ? `Back (${label})` : 'Go back to previous page'}
      className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 select-none ${className}`}
      style={{
        color: 'var(--color-text-secondary)',
      }}
    >
      <ArrowLeftIcon size={16} color="currentColor" />
      <span>{label}</span>
    </button>
  );
}
