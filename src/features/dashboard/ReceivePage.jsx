'use client';

/**
 * ReceivePage — payment requests the customer raises to be paid (issue #79,
 * Kimana_backend#80). A request gets a reference and bank-transfer pay-in
 * instructions; NGN opens a one-off receiving account per request, USD pays
 * into the customer's standing account. The backend credits the ledger
 * itself once the transfer partner confirms the money — this page only
 * creates requests, shows their pay-in details, and reflects their status.
 */

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ReceiveIcon,
  SpinnerIcon,
  XIcon,
} from '../../components/ui/icons';
import { toast } from '../../hooks/useToast';
import { formatShortDate } from '../../lib/formatDate';
import { formatMoney } from '../../money/money';

const CURRENCY_OPTIONS = [
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'USD', label: 'USD — US Dollar' },
];

const STATUS_TONE = { PENDING: 'info', PAID: 'success', EXPIRED: 'neutral', CANCELLED: 'neutral' };
const STATUS_LABEL = { PENDING: 'Awaiting payment', PAID: 'Paid', EXPIRED: 'Expired', CANCELLED: 'Cancelled' };

function parseMinorUnits(str) {
  const cleaned = str.replace(/[^0-9.]/g, '');
  const major = parseFloat(cleaned);
  if (!isFinite(major) || major <= 0) return null;
  return Math.round(major * 100);
}

function generateIdempotencyKey() {
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{value}</dd>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 text-xs font-bold underline focus-visible:outline-2"
        style={{ color: 'var(--color-brand-600)' }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function PayInInstructions({ payIn }) {
  if (!payIn) return null;
  return (
    <dl className="divide-y rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
      <CopyRow label="Bank name" value={payIn.bankName} />
      <CopyRow label="Account name" value={payIn.accountName} />
      <CopyRow label="Account number" value={payIn.accountNumber} />
      <CopyRow label="Routing number" value={payIn.routingNumber} />
      <CopyRow label="Bank address" value={payIn.bankAddress} />
      <CopyRow label="Payment memo / narration" value={payIn.memo} />
      <CopyRow label="Payment link" value={payIn.paymentLink} />
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Create request modal
// ---------------------------------------------------------------------------

function CreateRequestModal({ onClose, onCreated }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [payerName, setPayerName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => generateIdempotencyKey());

  const createMutation = useMutation({
    mutationFn: (input) => api.collections.create(input),
    onSuccess: (collection) => onCreated(collection),
    onError: (err) => setError(err?.message ?? 'Something went wrong. Try again.'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const minor = parseMinorUnits(amount);
    if (!minor) {
      setError('Enter an amount greater than zero.');
      return;
    }
    createMutation.mutate({
      amount: { amountMinor: minor, currency },
      payerName: payerName.trim() || undefined,
      note: note.trim() || undefined,
      idempotencyKey,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-6 bg-black/75 backdrop-blur-sm sm:items-center">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Request a payment</p>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
            <XIcon size={16} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <SelectField
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>

          <TextField
            label="Who's paying? (optional)"
            placeholder="e.g. Amsterdam Commodities BV"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            maxLength={140}
          />

          <TextField
            label="Note (optional)"
            placeholder="e.g. Invoice #114"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
          />

          {error && (
            <p className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{error}</p>
          )}

          <Button type="submit" disabled={createMutation.isPending} className="w-full font-bold">
            {createMutation.isPending ? <SpinnerIcon size={14} color="var(--color-text-on-brand)" /> : null}
            Create payment request
          </Button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function RequestDetailPanel({ collection, onClose }) {
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    panelRef.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cancelMutation = useMutation({
    mutationFn: () => api.collections.cancel(collection.id),
    onSuccess: () => {
      toast.success('Payment request cancelled.');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      onClose();
    },
    onError: (err) => toast.error(err?.message ?? "Couldn't cancel this request."),
  });

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" aria-hidden="true" onClick={onClose} style={{ backdropFilter: 'blur(2px)' }} />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Payment request details"
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col overflow-y-auto border-l shadow-2xl outline-none"
        style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-3">
            <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Payment request</p>
            <p className="font-mono text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>{collection.reference}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
            <XIcon size={16} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 space-y-6">
          <div className="flex items-center gap-3">
            <Badge tone={STATUS_TONE[collection.status]}>{STATUS_LABEL[collection.status] ?? collection.status}</Badge>
            <span className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
              {formatMoney(collection.amount, { useCode: true })}
            </span>
          </div>

          {collection.payerName && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              From <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{collection.payerName}</span>
            </p>
          )}
          {collection.note && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{collection.note}</p>
          )}

          {collection.status === 'PAID' && collection.payment ? (
            <div className="rounded-xl border p-4 space-y-1" style={{ borderColor: 'var(--color-success)', background: 'var(--color-surface-2)' }}>
              <div className="flex items-center gap-2">
                <CheckCircleIcon size={16} color="var(--color-success)" />
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Payment received</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {formatMoney(collection.payment.amount, { useCode: true })} received {formatShortDate(collection.payment.receivedAt)}
                {collection.payment.payerName ? ` from ${collection.payment.payerName}` : ''}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Share these pay-in details
              </p>
              <PayInInstructions payIn={collection.payIn} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <div>
              <p>Created</p>
              <p className="mt-0.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatShortDate(collection.createdAt)}</p>
            </div>
            <div>
              <p>{collection.status === 'PENDING' ? 'Expires' : 'Expired'}</p>
              <p className="mt-0.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatShortDate(collection.expiresAt)}</p>
            </div>
          </div>

          {collection.status === 'PENDING' && (
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="w-full rounded-full border px-4 py-2.5 text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel request'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function ReceivePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: collections, isLoading, isError, refetch } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.collections.list(),
    staleTime: 20_000,
  });

  const { data: receivingAccounts } = useQuery({
    queryKey: ['receivingAccounts'],
    queryFn: () => api.collections.getReceivingAccounts(),
    staleTime: 60_000,
  });

  function handleCreated(collection) {
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['collections'] });
    setSelected(collection);
  }

  const isEmpty = !isLoading && !isError && collections?.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Receive Payment</h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Request a payment and share the bank-transfer details with whoever owes you.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)} className="px-5 text-xs font-bold">
          <PlusIcon size={13} color="var(--color-text-on-brand)" />
          Request Payment
        </Button>
      </div>

      {receivingAccounts?.length > 0 && (
        <div className="rounded-2xl border p-4" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Standing account — always open for {receivingAccounts[0].currency}
          </p>
          <PayInInstructions payIn={receivingAccounts[0].payIn} />
        </div>
      )}

      <div className="rounded-2xl border shadow-xl" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
        <div className="p-4 sm:p-6">
          {isLoading && (
            <div className="space-y-2 py-2" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-2)', opacity: 1 - i * 0.15 }} />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ExclamationTriangleIcon size={40} color="var(--color-warning)" />
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>We couldn't load your payment requests.</p>
              <Button type="button" variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          )}

          {isEmpty && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--color-surface-2)' }} aria-hidden="true">
                <ReceiveIcon size={28} color="var(--color-text-secondary)" />
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>No payment requests yet</p>
                <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Create one to get bank-transfer details you can share with a buyer.
                </p>
              </div>
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                <PlusIcon size={13} color="var(--color-text-on-brand)" />
                Request Payment
              </Button>
            </div>
          )}

          {!isLoading && !isError && collections?.length > 0 && (
            <div className="flex flex-col gap-2">
              {collections.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(c); } }}
                  tabIndex={0}
                  role="button"
                  className="flex items-center justify-between gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold" style={{ color: 'var(--color-brand-600)' }}>{c.reference}</p>
                    <p className="mt-1 text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {c.payerName || 'Unnamed payer'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-extrabold text-sm" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(c.amount)}</p>
                    <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <CreateRequestModal onClose={() => setIsCreateOpen(false)} onCreated={handleCreated} />
      )}

      {selected && (
        <RequestDetailPanel collection={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
