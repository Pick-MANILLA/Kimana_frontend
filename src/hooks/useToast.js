'use client';

import { useSyncExternalStore } from 'react';

const AUTO_DISMISS_MS = 5000;

let toasts = [];
let nextId = 0;
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

function getServerSnapshot() {
  return [];
}

function dismiss(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(type, message) {
  const id = ++nextId;
  toasts = [...toasts, { id, type, message }];
  emit();
  setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  return id;
}

// Callable from anywhere, including outside React (e.g. QueryClient's
// MutationCache config in app/providers.js), not just from components.
export const toast = {
  success: (message) => push('success', message),
  error: (message) => push('error', message),
  info: (message) => push('info', message),
  warning: (message) => push('warning', message),
};

export function useToast() {
  const activeToasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { toasts: activeToasts, dismiss };
}
