'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kimana-default-currency';
const DEFAULT_CURRENCY = 'NGN';
const VALID_CURRENCIES = new Set(['NGN', 'USD', 'EUR']);

function readStoredCurrency() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_CURRENCIES.has(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable — fall through to default
  }
  return DEFAULT_CURRENCY;
}

export function useDefaultCurrency() {
  // Start with the fixed default so the first render matches SSR exactly,
  // then sync to localStorage in an effect — same pattern as useTheme.
  const [preferredCurrency, setPreferredCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    setPreferredCurrency(readStoredCurrency());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preferredCurrency);
    } catch {
      // Ignore storage errors
    }
  }, [preferredCurrency]);

  return { preferredCurrency, setPreferredCurrency };
}
