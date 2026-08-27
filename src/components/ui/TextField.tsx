import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </label>
      <input
        id={fieldId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-sm px-3.5 py-2.5 text-base outline-none ${className}`}
        style={{
          background: 'var(--color-surface-2)',
          color: 'var(--color-text-primary)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'transparent'}`,
        }}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
