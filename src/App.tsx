// Temporary token preview — proves the Tailwind config renders correctly.
// Will be replaced by the router once primitives/screens exist.

const brandShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const statusSwatches = [
  { label: 'success', varName: '--color-success', onVar: '--color-on-success' },
  { label: 'danger', varName: '--color-danger', onVar: '--color-on-danger' },
  { label: 'warning', varName: '--color-warning', onVar: '--color-on-warning' },
  { label: 'info', varName: '--color-info', onVar: '--color-on-info' },
]
const surfaceSwatches = ['canvas', 'surface-1', 'surface-2', 'border-subtle']
const textSwatches = ['text-primary', 'text-secondary', 'text-placeholder', 'text-on-brand']

const typeScale = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const radii = ['sm', 'md', 'lg', 'full'] as const
const shadows = ['card', 'raised', 'sheet'] as const

function App() {
  return (
    <main
      className="mx-auto max-w-xl px-gutter py-section"
      style={{ background: 'var(--color-canvas)', minHeight: '100vh' }}
    >
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Design tokens
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Sourced from the exported frames in ./design/ (pixel-sampled). Radii, spacing, and
        the type scale are still estimates pending confirmation — see TOKENS.md.
      </p>

      {/* Swatches read CSS custom properties directly (not Tailwind utility
          classes) because Tailwind's scanner can't see runtime-built class
          names — this is a preview page, not app code. */}
      <section className="mt-8">
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Brand
        </h2>
        <div className="mt-3 flex flex-wrap gap-1">
          {brandShades.map((shade) => (
            <div
              key={shade}
              className="h-10 w-10 rounded-sm"
              style={{ background: `var(--color-brand-${shade})` }}
              title={`brand-${shade}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Status chips
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {statusSwatches.map((s) => (
            <div
              key={s.label}
              className="rounded-full px-3 py-1 text-sm font-semibold"
              style={{ background: `var(${s.varName})`, color: `var(${s.onVar})` }}
            >
              {s.label}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Surfaces
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {surfaceSwatches.map((name) => (
            <div
              key={name}
              className="h-16 w-16 rounded-md border"
              style={{ background: `var(--color-${name})`, borderColor: 'var(--color-border-subtle)' }}
              title={name}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Text
        </h2>
        <div className="mt-3 space-y-2">
          {textSwatches.map((name) => (
            <p key={name} style={{ color: `var(--color-${name})` }}>
              {name} — Send money across Africa
            </p>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Type scale
        </h2>
        <div className="mt-3 space-y-2">
          {typeScale.map((size) => (
            <p
              key={size}
              style={{
                color: 'var(--color-text-primary)',
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
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Radii
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {radii.map((r) => (
            <div
              key={r}
              className="h-16 w-16"
              style={{ background: 'var(--color-brand-600)', borderRadius: `var(--radius-${r})` }}
              title={r}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-md font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Shadows
        </h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {shadows.map((s) => (
            <div
              key={s}
              className="h-16 w-24 rounded-md"
              style={{ background: 'var(--color-surface-1)', boxShadow: `var(--shadow-${s})` }}
              title={s}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
