'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kimana-theme';
const DEFAULT_THEME = 'dark';

function readStoredTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // localStorage might be unavailable/blocked
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return DEFAULT_THEME;
}

export function useTheme() {
  // Always start at the fixed default so the client's first render matches
  // the server-rendered HTML exactly (avoids a hydration mismatch). The
  // blocking script in app/layout.js already set the real theme on <html>
  // before hydration to prevent a visible flash — this just brings React's
  // own state in sync with that, one tick after mount.
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggleTheme };
}
