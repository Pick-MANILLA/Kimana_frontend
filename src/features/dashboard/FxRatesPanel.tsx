import { useQueries } from '@tanstack/react-query';
import type { CurrencyCode } from '../../api/types/common';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { dashboardCopy } from '../../copy';

const PAIRS: readonly [CurrencyCode, CurrencyCode][] = [
  ['USD', 'NGN'],
  ['EUR', 'NGN'],
  ['GBP', 'NGN'],
  ['GHS', 'NGN'],
];

const FX_REFRESH_MS = 120_000;

export function FxRatesPanel() {
  const results = useQueries({
    queries: PAIRS.map(([send, receive]) => ({
      queryKey: ['fx', send, receive],
      queryFn: () => api.quote.getIndicativeRate(send, receive),
      refetchInterval: FX_REFRESH_MS,
    })),
  });

  return (
    <div className="rounded-md p-4" style={{ background: 'var(--color-surface-1)' }}>
      <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {dashboardCopy.liveFxRates}
      </h2>
      <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {dashboardCopy.fxRefreshHint}
      </p>

      <ul className="mt-4 space-y-3">
        {PAIRS.map(([send, receive], index) => {
          const result = results[index];
          const rate = result?.data;
          const isPositive = (rate?.changePercent24h ?? 0) >= 0;
          return (
            <li key={`${send}/${receive}`} className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-primary)' }}>
                {send} / {receive}
              </span>
              {rate ? (
                <span className="text-right">
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {rate.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>{' '}
                  <span style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isPositive ? '+' : ''}
                    {rate.changePercent24h.toFixed(2)}%
                  </span>
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4">
        <Button type="button" variant="outline" className="w-full">
          {dashboardCopy.getFirmQuote}
        </Button>
      </div>
    </div>
  );
}
