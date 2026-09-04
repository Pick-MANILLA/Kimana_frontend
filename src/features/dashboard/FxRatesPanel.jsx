'use client';

import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClockIcon } from '../../components/ui/icons';

export function FxRatesPanel({ onGetFirmQuote }) {
  const [sendAmount, setSendAmount] = useState('10,000');
  const [currency, setCurrency] = useState('USD');
  const [countdownSeconds, setCountdownSeconds] = useState(102);

  const rate = 1645;
  const fee = 25;
  const numericAmount = parseFloat(sendAmount.replace(/,/g, '')) || 0;
  const recipientNgn = numericAmount * rate;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      className="rounded-xl border p-5 transition-all shadow-md"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Live FX Transfer Engine</h3>
          <p className="mt-0.5 text-xs text-neutral-400">Guaranteed rate lock with zero margin markup</p>
        </div>
        <Badge tone="info">Demo Quote</Badge>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {/* You send */}
        <div className="flex items-center justify-between rounded-xl border p-3" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase">You Send</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-sm font-bold text-neutral-300">$</span>
              <input
                type="text"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="w-24 bg-transparent text-sm font-extrabold focus:outline-none"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
            style={{ color: 'var(--color-brand-400)' }}
          >
            <option value="USD" style={{ backgroundColor: 'var(--color-surface-1)', color: 'var(--color-text-primary)' }}>USD</option>
            <option value="EUR" style={{ backgroundColor: 'var(--color-surface-1)', color: 'var(--color-text-primary)' }}>EUR</option>
            <option value="GBP" style={{ backgroundColor: 'var(--color-surface-1)', color: 'var(--color-text-primary)' }}>GBP</option>
          </select>
        </div>

        {/* Rate & Fee Details */}
        <div className="space-y-1 px-1 text-xs text-neutral-400">
          <div className="flex justify-between">
            <span>Guaranteed Rate:</span>
            <span className="font-mono font-bold" style={{ color: 'var(--color-brand-400)' }}>1 {currency} = ₦{rate.toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between">
            <span>Fixed Fee:</span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>${fee}.00</span>
          </div>
        </div>

        {/* Recipient Receives */}
        <div className="flex items-center justify-between rounded-xl border p-3" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
          <div>
            <span className="block text-[11px] font-semibold text-neutral-400 uppercase">Recipient Receives</span>
            <span className="text-sm font-extrabold text-emerald-400">
              ₦{recipientNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Badge tone="success">NGN</Badge>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
          <span className="flex items-center gap-1">
            <ClockIcon size={14} color="var(--color-warning)" /> Quote expires in:
          </span>
          <span className="font-mono font-bold text-amber-400">{formatTimer(countdownSeconds)}</span>
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          className="w-full py-2.5 font-bold"
          onClick={() => onGetFirmQuote?.(sendAmount, currency)}
        >
          Get firm quote
        </Button>
      </div>
    </div>
  );
}
