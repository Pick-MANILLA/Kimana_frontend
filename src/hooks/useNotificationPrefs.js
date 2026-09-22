'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kimana-notification-prefs';

// Default: all channels on for all events
const DEFAULT_PREFS = {
  transferCompleted: { email: true, sms: true, push: true },
  complianceHold:    { email: true, sms: true, push: true },
  documentRequested: { email: true, sms: false, push: false },
};

function readStoredPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Basic shape guard — ensure all expected keys exist so a partial
      // write from an older version doesn't leave gaps in the matrix.
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.transferCompleted &&
        parsed.complianceHold &&
        parsed.documentRequested
      ) {
        return parsed;
      }
    }
  } catch {
    // localStorage unavailable or JSON malformed — fall through to defaults
  }
  return DEFAULT_PREFS;
}

export function useNotificationPrefs() {
  // Start with the fixed default so the first render matches SSR exactly,
  // then sync to localStorage in an effect — same pattern as useTheme.
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- localStorage isn't available during SSR; state must start at DEFAULT_PREFS and sync here post-mount to avoid a hydration mismatch.
    setPrefs(readStoredPrefs());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage errors
    }
  }, [prefs]);

  /**
   * Toggle a single cell in the matrix.
   * @param {string} event  - 'transferCompleted' | 'complianceHold' | 'documentRequested'
   * @param {string} channel - 'email' | 'sms' | 'push'
   */
  const toggle = (event, channel) => {
    setPrefs((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [channel]: !prev[event][channel],
      },
    }));
  };

  return { prefs, toggle };
}
