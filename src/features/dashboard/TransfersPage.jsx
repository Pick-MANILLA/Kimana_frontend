'use client';

/**
 * TransfersPage
 *
 * Replaces the stub TransfersTable in the "Transfers" dashboard tab.
 * Pulls real data from api.transfers.listTransfers + api.recipients.listRecipients.
 *
 * Features:
 *  - Free-text search (reference, beneficiary, description)
 *  - Status / currency / date-range / amount-range filters
 *  - Numbered pagination (PAGE_SIZE rows per page)
 *  - Click-a-row → slide-in detail panel with full status timeline
 *  - Export placeholder (ledgerApi.requestStatementExport → toast)
 *  - Loading skeleton, error banner, empty state, no-match state
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, DEMO_CUSTOMER_ID } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import {
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  SpinnerIcon,
  XIcon,
} from '../../components/ui/icons';
import {
  transferStatusDescription,
  transferStatusLabel,
  transfersPageCopy,
} from '../../copy';
import { countryName, formatShortDate } from '../../lib/formatDate';
import { formatMoney, formatMoneyCompact } from '../../money/money';
import { isTerminalStatus, transferStatusTone } from '../../state/transferStatusColor';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = transfersPageCopy.pageSize;

const ALL_STATUSES = [
  'CREATED', 'QUOTED', 'SCREENED', 'AWAITING_FUNDS', 'FUNDED',
  'SETTLING', 'SETTLED', 'PAYING_OUT', 'COMPLETED',
  'REJECTED', 'EXPIRED', 'REVERSING', 'REVERSED',
];

const STATUS_OPTIONS = [
  { value: '', label: transfersPageCopy.filterStatusAll },
  ...ALL_STATUSES.map((s) => ({ value: s, label: transferStatusLabel[s] ?? s })),
];

const CURRENCY_OPTIONS = [
  { value: '', label: transfersPageCopy.filterCurrencyAll },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const EMPTY_FILTERS = {
  search: '',
  status: '',
  currency: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
};

// ---------------------------------------------------------------------------
// Pure client-side filter applied after the API fetch
// The API only supports a status filter; all other filtering happens here.
// ---------------------------------------------------------------------------

function applyFilters(transfers, recipientsById, filters) {
  const searchLower = filters.search.trim().toLowerCase();
  const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
  // Include the full "to" day by setting time to end-of-day.
  const to = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59').getTime() : null;
  const minMinor = filters.amountMin !== '' ? Math.round(parseFloat(filters.amountMin) * 100) : null;
  const maxMinor = filters.amountMax !== '' ? Math.round(parseFloat(filters.amountMax) * 100) : null;

  return transfers.filter((t) => {
    if (filters.status && t.state.status !== filters.status) return false;
    if (filters.currency && t.sendCurrency !== filters.currency) return false;

    const createdMs = new Date(t.createdAt).getTime();
    if (from !== null && createdMs < from) return false;
    if (to !== null && createdMs > to) return false;

    if (minMinor !== null && t.sendAmount.amountMinor < minMinor) return false;
    if (maxMinor !== null && t.sendAmount.amountMinor > maxMinor) return false;

    if (searchLower) {
      const ref = (t.reference ?? '').toLowerCase();
      const desc = (t.tradeDescription ?? '').toLowerCase();
      const beneficiary = (recipientsById?.get(t.recipientId)?.accountName ?? '').toLowerCase();
      if (!ref.includes(searchLower) && !beneficiary.includes(searchLower) && !desc.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

function hasActiveFilters(filters) {
  return Object.values(filters).some(Boolean);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="space-y-2 py-2" aria-busy="true" aria-label={transfersPageCopy.loadingTitle}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl animate-pulse"
          style={{ background: 'var(--color-surface-2)', opacity: 1 - i * 0.12 }}
        />
      ))}
      <p className="sr-only">{transfersPageCopy.loadingTitle}</p>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <ExclamationTriangleIcon size={40} color="var(--color-warning)" />
      <div>
        <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
          {transfersPageCopy.errorTitle}
        </p>
        <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {transfersPageCopy.errorBody}
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onRetry}>
        {transfersPageCopy.errorRetry}
      </Button>
    </div>
  );
}

function EmptyState({ onNewTransfer }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'var(--color-surface-2)' }}
        aria-hidden="true"
      >
        <DownloadIcon size={28} color="var(--color-text-secondary)" />
      </div>
      <div>
        <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
          {transfersPageCopy.emptyTitle}
        </p>
        <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {transfersPageCopy.emptyBody}
        </p>
      </div>
      <Button type="button" onClick={onNewTransfer}>
        <PlusIcon size={13} color="var(--color-text-on-brand)" />
        {transfersPageCopy.emptyAction}
      </Button>
    </div>
  );
}

function NoMatchState({ onClear }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
        {transfersPageCopy.noMatchTitle}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {transfersPageCopy.noMatchBody}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
        style={{ color: 'var(--color-brand-600)' }}
      >
        {transfersPageCopy.clearFilters}
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t"
      style={{ borderColor: 'var(--color-border-subtle)' }}
    >
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {transfersPageCopy.showingOf(from, to, totalItems)}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-1)',
          }}
        >
          {transfersPageCopy.prevPage}
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className="h-7 w-7 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: p === page ? 'var(--color-brand-600)' : 'transparent',
              color: p === page ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
            }}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-1)',
          }}
        >
          {transfersPageCopy.nextPage}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline panel (slide-in from right)
// ---------------------------------------------------------------------------

function TimelinePanel({ transfer, recipientsById, onClose }) {
  const panelRef = useRef(null);

  // Trap focus inside the panel and close on Escape.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.focus();

    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const {
    data: timeline,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['transferTimeline', transfer.id],
    queryFn: () => api.transfers.getTimeline(transfer.id),
    staleTime: 30_000,
  });

  const recipient = recipientsById?.get(transfer.recipientId);
  const terminal = isTerminalStatus(transfer.state.status);

  const detailRows = [
    { label: transfersPageCopy.detailReference, value: transfer.reference },
    {
      label: transfersPageCopy.detailBeneficiary,
      value: recipient
        ? `${recipient.accountName}${recipient.country ? ` · ${countryName(recipient.country)}` : ''}`
        : '—',
    },
    { label: transfersPageCopy.detailDescription, value: transfer.tradeDescription ?? '—' },
    {
      label: transfersPageCopy.detailSendAmount,
      value: formatMoney(transfer.sendAmount, { useCode: true }),
    },
    {
      label: transfersPageCopy.detailReceiveAmount,
      value: formatMoneyCompact(transfer.receiveAmount),
    },
    {
      label: transfersPageCopy.detailRate,
      value: `1 ${transfer.sendCurrency} = ${transfer.quote.breakdown.rate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${transfer.receiveCurrency}`,
    },
    { label: transfersPageCopy.detailCreated, value: formatShortDate(transfer.createdAt) },
    { label: transfersPageCopy.detailUpdated, value: formatShortDate(transfer.updatedAt) },
    ...(transfer.state.payoutReference
      ? [{ label: transfersPageCopy.detailPayoutRef, value: transfer.state.payoutReference }]
      : []),
    ...(transfer.state.reason
      ? [{ label: transfersPageCopy.detailReversalReason, value: transfer.state.reason }]
      : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={transfersPageCopy.detailTitle}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col overflow-y-auto border-l shadow-2xl outline-none"
        style={{
          background: 'var(--color-surface-1)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {transfersPageCopy.detailTitle}
            </p>
            <p
              className="font-mono text-xs font-semibold"
              style={{ color: 'var(--color-brand-400)' }}
            >
              {transfer.reference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={transfersPageCopy.detailClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <XIcon size={16} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 space-y-6">
          {/* Current status badge */}
          <div className="flex items-center gap-3">
            <Badge tone={transferStatusTone[transfer.state.status]}>
              {transferStatusLabel[transfer.state.status]}
            </Badge>
            {!terminal && (
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {transferStatusDescription[transfer.state.status]}
              </span>
            )}
          </div>

          {/* Detail rows */}
          <dl
            className="divide-y rounded-xl overflow-hidden"
            style={{ background: 'var(--color-surface-2)' }}
          >
            {detailRows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                <dt
                  className="text-xs shrink-0"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {label}
                </dt>
                <dd
                  className="text-xs font-semibold text-right"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Timeline */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {transfersPageCopy.timelineTitle}
            </p>

            {isLoading && (
              <div className="flex items-center gap-2 py-4">
                <SpinnerIcon size={16} color="var(--color-text-secondary)" />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {transfersPageCopy.timelineLoadingTitle}
                </span>
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-3 py-2">
                <span className="text-sm" style={{ color: 'var(--color-danger)' }}>
                  {transfersPageCopy.timelineErrorTitle}
                </span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-xs font-semibold underline focus-visible:outline-2"
                  style={{ color: 'var(--color-brand-600)' }}
                >
                  {transfersPageCopy.timelineErrorRetry}
                </button>
              </div>
            )}

            {timeline && (
              <ol className="relative space-y-0" aria-label="Transfer status timeline">
                {timeline.history.map((step, idx) => {
                  const isLast = idx === timeline.history.length - 1;
                  const isDone = !isLast || terminal;

                  return (
                    <li key={`${step.status}-${idx}`} className="flex gap-3">
                      {/* Vertical connector line + icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: isDone
                              ? 'var(--color-success)'
                              : 'var(--color-brand-600)',
                          }}
                        >
                          {isDone ? (
                            <CheckCircleIcon
                              size={14}
                              color="var(--color-text-on-brand)"
                            />
                          ) : (
                            <ClockIcon size={12} color="var(--color-text-on-brand)" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className="w-px flex-1 my-1"
                            style={{
                              background: 'var(--color-border-subtle)',
                              minHeight: '1.5rem',
                            }}
                          />
                        )}
                      </div>

                      {/* Step content */}
                      <div className="pb-5 min-w-0">
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{
                            color: isLast && !terminal
                              ? 'var(--color-brand-400)'
                              : 'var(--color-text-primary)',
                          }}
                        >
                          {transferStatusLabel[step.status] ?? step.status}
                        </p>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {transferStatusDescription[step.status] ?? ''}
                        </p>
                        <p
                          className="mt-1 text-xs tabular-nums"
                          style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
                        >
                          {new Intl.DateTimeFormat('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(step.enteredAt))}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Export toast
// ---------------------------------------------------------------------------

function ExportToast({ onDismiss }) {
  // Auto-dismiss after 5 s.
  useEffect(() => {
    const id = setTimeout(onDismiss, 5000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl border text-sm font-medium"
      style={{
        background: 'var(--color-surface-1)',
        borderColor: 'var(--color-border-subtle)',
        color: 'var(--color-text-primary)',
      }}
    >
      <CheckCircleIcon size={16} color="var(--color-success)" />
      <span>{transfersPageCopy.exportToast}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-2 opacity-60 hover:opacity-100 focus-visible:outline-2"
      >
        <XIcon size={14} color="currentColor" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TransfersPage({ onNewTransfer }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  // Fetch all transfers for this customer.
  const {
    data: allTransfers,
    isLoading: transfersLoading,
    isError: transfersError,
    refetch: refetchTransfers,
  } = useQuery({
    queryKey: ['transfers', DEMO_CUSTOMER_ID],
    queryFn: () => api.transfers.listTransfers(DEMO_CUSTOMER_ID),
    staleTime: 30_000,
  });

  // Fetch recipients to resolve beneficiary names.
  const { data: recipientsList } = useQuery({
    queryKey: ['recipients', DEMO_CUSTOMER_ID],
    queryFn: () => api.recipients.listRecipients(DEMO_CUSTOMER_ID),
    staleTime: 60_000,
  });

  const recipientsById = recipientsList
    ? new Map(recipientsList.map((r) => [r.id, r]))
    : null;

  // Client-side filtering.
  const filtered = allTransfers
    ? applyFilters(allTransfers, recipientsById, filters)
    : [];

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset to first page on any filter change
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      await api.ledger.requestStatementExport(DEMO_CUSTOMER_ID);
      setShowExportToast(true);
    } catch {
      // Even on mock error, show the toast — it's a placeholder.
      setShowExportToast(true);
    } finally {
      setExportLoading(false);
    }
  }

  const isFirstLoad = transfersLoading && !allTransfers;
  const isEmpty = !transfersLoading && !transfersError && allTransfers?.length === 0;
  const isNoMatch = !transfersLoading && !transfersError && allTransfers?.length > 0 && totalItems === 0;

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {transfersPageCopy.pageTitle}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {transfersPageCopy.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: 'var(--color-surface-1)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              cursor: exportLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {exportLoading
              ? <SpinnerIcon size={13} color="currentColor" />
              : <DownloadIcon size={13} color="currentColor" />}
            {transfersPageCopy.exportBtn}
          </button>

          <Button type="button" onClick={onNewTransfer} className="px-5 text-xs font-bold">
            <PlusIcon size={13} color="var(--color-text-on-brand)" />
            {transfersPageCopy.startTransfer}
          </Button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{
          background: 'var(--color-surface-1)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        {/* Row 1: search + clear */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <TextField
              label=""
              placeholder={transfersPageCopy.searchPlaceholder}
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              aria-label={transfersPageCopy.searchPlaceholder}
            />
          </div>

          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: 'var(--color-surface-2)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <XIcon size={11} color="currentColor" />
              {transfersPageCopy.clearFilters}
            </button>
          )}
        </div>

        {/* Row 2: status / currency / dates / amounts.
            Two-up grid below sm (each field fills its cell, no wasted
            whitespace or scroll needed); reverts to fixed-width flex-wrap
            chips once there's room for them to sit inline. */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <div className="w-full sm:w-44">
            <SelectField
              label=""
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              placeholder={transfersPageCopy.filterStatusAll}
              aria-label={transfersPageCopy.filterStatus}
            />
          </div>

          <div className="w-full sm:w-40">
            <SelectField
              label=""
              options={CURRENCY_OPTIONS}
              value={filters.currency}
              onChange={(e) => setFilter('currency', e.target.value)}
              placeholder={transfersPageCopy.filterCurrencyAll}
              aria-label={transfersPageCopy.filterCurrency}
            />
          </div>

          <div className="w-full sm:w-40">
            <TextField
              label=""
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter('dateFrom', e.target.value)}
              aria-label={transfersPageCopy.filterDateFrom}
            />
          </div>

          <div className="w-full sm:w-40">
            <TextField
              label=""
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter('dateTo', e.target.value)}
              aria-label={transfersPageCopy.filterDateTo}
            />
          </div>

          <div className="w-full sm:w-36">
            <TextField
              label=""
              type="number"
              placeholder={transfersPageCopy.filterAmountMin}
              value={filters.amountMin}
              onChange={(e) => setFilter('amountMin', e.target.value)}
              aria-label={transfersPageCopy.filterAmountMin}
              inputMode="decimal"
              min="0"
            />
          </div>

          <div className="w-full sm:w-36">
            <TextField
              label=""
              type="number"
              placeholder={transfersPageCopy.filterAmountMax}
              value={filters.amountMax}
              onChange={(e) => setFilter('amountMax', e.target.value)}
              aria-label={transfersPageCopy.filterAmountMax}
              inputMode="decimal"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* ── Table card ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl border shadow-xl"
        style={{
          background: 'var(--color-surface-1)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <div className="p-4 sm:p-6">
          {isFirstLoad && <TableSkeleton />}

          {transfersError && <ErrorState onRetry={refetchTransfers} />}

          {isEmpty && <EmptyState onNewTransfer={onNewTransfer} />}

          {isNoMatch && <NoMatchState onClear={clearFilters} />}

          {!isFirstLoad && !transfersError && !isEmpty && !isNoMatch && (
            <>
              {/* Below sm: stacked cards — a 6-column table can't shrink to
                  360px without truncating data or forcing a horizontal scroll. */}
              <div className="flex flex-col gap-3 sm:hidden">
                {pageSlice.map((t) => {
                  const recipient = recipientsById?.get(t.recipientId);
                  const isSelected = selectedTransfer?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTransfer(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTransfer(t);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      className="rounded-xl border p-3.5 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                      style={{
                        borderColor: 'var(--color-border-subtle)',
                        background: isSelected ? 'var(--color-surface-2)' : 'transparent',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs font-bold" style={{ color: 'var(--color-brand-600)' }}>{t.reference}</p>
                          <p className="mt-1 font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{recipient?.accountName ?? '—'}</p>
                          {recipient?.country && (
                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{countryName(recipient.country)}</p>
                          )}
                        </div>
                        <Badge tone={transferStatusTone[t.state.status]}>{transferStatusLabel[t.state.status]}</Badge>
                      </div>

                      {t.tradeDescription && (
                        <p className="mt-2 text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{t.tradeDescription}</p>
                      )}

                      <div className="mt-2.5 flex items-end justify-between gap-3 border-t pt-2.5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                        <div>
                          <p className="font-extrabold text-sm" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(t.sendAmount)}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatMoneyCompact(t.receiveAmount)}</p>
                        </div>
                        <p className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{formatShortDate(t.updatedAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* sm and up: full table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead>
                    <tr
                      className="border-b text-left"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    >
                      {[
                        transfersPageCopy.colReference,
                        transfersPageCopy.colBeneficiary,
                        transfersPageCopy.colAmount,
                        transfersPageCopy.colDescription,
                        transfersPageCopy.colStatus,
                        transfersPageCopy.colDate,
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pageSlice.map((t) => {
                      const recipient = recipientsById?.get(t.recipientId);
                      const isSelected = selectedTransfer?.id === t.id;

                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTransfer(t)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedTransfer(t);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                          className="border-b cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                          style={{
                            borderColor: 'var(--color-border-subtle)',
                            background: isSelected
                              ? 'var(--color-surface-2)'
                              : 'transparent',
                          }}
                          // Inline hover handled via Tailwind group trick isn't available,
                          // so we use onMouseEnter/Leave for the non-selected hover tint.
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = 'var(--color-surface-2)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {/* Reference */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span
                              className="font-mono text-xs font-bold"
                              style={{ color: 'var(--color-brand-600)' }}
                            >
                              {t.reference}
                            </span>
                          </td>

                          {/* Beneficiary */}
                          <td className="px-3 py-3.5">
                            <p
                              className="font-medium text-sm"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {recipient?.accountName ?? '—'}
                            </p>
                            {recipient?.country && (
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {countryName(recipient.country)}
                              </p>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <p
                              className="font-extrabold text-sm"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {formatMoney(t.sendAmount)}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {formatMoneyCompact(t.receiveAmount)}
                            </p>
                          </td>

                          {/* Description */}
                          <td
                            className="px-3 py-3.5 text-xs max-w-[180px]"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <span className="line-clamp-2">{t.tradeDescription ?? '—'}</span>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <Badge tone={transferStatusTone[t.state.status]}>
                              {transferStatusLabel[t.state.status]}
                            </Badge>
                          </td>

                          {/* Date */}
                          <td
                            className="px-3 py-3.5 whitespace-nowrap text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {formatShortDate(t.updatedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Detail panel ─────────────────────────────────────────── */}
      {selectedTransfer && (
        <TimelinePanel
          transfer={selectedTransfer}
          recipientsById={recipientsById}
          onClose={() => setSelectedTransfer(null)}
        />
      )}

      {/* ── Export toast ─────────────────────────────────────────── */}
      {showExportToast && (
        <ExportToast onDismiss={() => setShowExportToast(false)} />
      )}
    </div>
  );
}
