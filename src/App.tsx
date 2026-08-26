// Temporary token preview — proves the Tailwind config renders correctly.
// Will be replaced by the router once primitives/screens exist (step 2+).

const colorGroups: { label: string; shades: string[] }[] = [
  { label: 'brand', shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { label: 'accent', shades: ['50', '100', '200', '300', '400', '500', '600'] },
  { label: 'success', shades: ['50', '500', '600'] },
  { label: 'warning', shades: ['50', '500', '600'] },
  { label: 'danger', shades: ['50', '500', '600'] },
  { label: 'info', shades: ['50', '500', '600'] },
  { label: 'neutral', shades: ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
]

const typeScale = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const radii = ['sm', 'md', 'lg', 'xl'] as const
const shadows = ['card', 'raised', 'sheet'] as const

function App() {
  return (
    <main className="mx-auto max-w-xl px-gutter py-section">
      <h1 className="text-xl font-semibold text-neutral-900">Design tokens (placeholder)</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Provisional values pending Figma. Names are the contract — swap values in
        src/styles/theme.css only.
      </p>

      {/* Swatches read the CSS custom properties directly (not Tailwind utility
          classes) because Tailwind's scanner can't see runtime-built class
          names — this is a preview page, not app code. */}
      <section className="mt-8">
        <h2 className="text-md font-semibold text-neutral-800">Color</h2>
        <div className="mt-3 space-y-3">
          {colorGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs text-neutral-500">{group.label}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {group.shades.map((shade) => (
                  <div
                    key={shade}
                    className="h-10 w-10 rounded-sm border border-neutral-200"
                    style={{ background: `var(--color-${group.label}-${shade})` }}
                    title={`${group.label}-${shade}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold text-neutral-800">Type scale</h2>
        <div className="mt-3 space-y-2">
          {typeScale.map((size) => (
            <p
              key={size}
              className="text-neutral-900"
              style={{
                fontSize: `var(--text-${size})`,
                lineHeight: `var(--text-${size}--line-height)`,
              }}
            >
              {size} — Send money across Africa
            </p>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold text-neutral-800">Radii</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {radii.map((r) => (
            <div
              key={r}
              className="h-16 w-16 bg-brand-600"
              style={{ borderRadius: `var(--radius-${r})` }}
              title={r}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold text-neutral-800">Shadows</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {shadows.map((s) => (
            <div
              key={s}
              className="h-16 w-24 rounded-md bg-neutral-0"
              style={{ boxShadow: `var(--shadow-${s})` }}
              title={s}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
