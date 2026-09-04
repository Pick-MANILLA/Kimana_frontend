'use client';

import { forwardRef, useId } from 'react';

export const Checkbox = forwardRef(function Checkbox(
  { label, id, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <label htmlFor={fieldId} className="flex cursor-pointer items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-primary)' }}>
      <input
        id={fieldId}
        ref={ref}
        type="checkbox"
        className="h-5 w-5 shrink-0 rounded-[4px]"
        style={{ accentColor: 'var(--color-brand-600)' }}
        {...rest}
      />
      {label}
    </label>
  );
});
