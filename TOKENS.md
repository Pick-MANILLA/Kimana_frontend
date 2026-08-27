# Design tokens — status

**Sourced from real exported frames, not the live Figma file.** No Figma
MCP server was connected, so per the project brief's fallback, the actual
design frames — found already exported to
`~/Downloads/Untitled/{Business Details,Directors &UBO,Documents,
Verification,Approved,Home}.png` — were copied into [./design/](design/)
and used as the source of truth. Colors in
[src/styles/theme.css](src/styles/theme.css) were extracted with exact
pixel sampling (Python/PIL against the PNG files), not eyeballed.

## What's real vs. estimated

- **Real, pixel-sampled**: all neutrals/surfaces, brand-300 through
  brand-900, the success/danger/warning fills and their on-fill text
  colors. Cross-checked across multiple frames.
- **Estimated / interpolated**: brand-50 through brand-200 (no light
  surface exists in the source to sample — these are synthetic tints
  toward white, kept only in case a future light context needs a brand
  tint). `--color-border-subtle` (no isolated hairline border pixel was
  found; approximated between the two surface tones). `--color-info` has
  no distinct sample — the "in progress" chips in the Home frame sample
  identical to brand-600, so info reuses it rather than inventing a hue.
- **Not verified against the source at all**: the type scale (carried
  over unchanged from the pre-design placeholder — sizes weren't
  reverse-engineered from glyph pixel heights) and radii/spacing (read by
  eye against the pixel grid, not measured programmatically).

## Open decisions (need Mark's confirmation before proceeding)

1. The source frames show the product name **"Bridgeflow"**, not
   "Kimana" — this repo's name. Which name does the actual UI ship with?
2. The frames cover onboarding (5-step KYB wizard) and a dashboard home
   screen — do we build straight to matching these now, or hold to the
   original build order (Money type → state machine → mock layer →
   console demo, *then* UI)?

## How to tighten what's left

1. Get Figma access (MCP or a fresh export) to verify/replace the
   type scale and radii/spacing values directly, and to fill in the
   brand-50/100/200 tints if they exist anywhere in the real file.
2. Edit only the values in `src/styles/theme.css` — token *names* are
   the contract; don't rename without grepping every reference first.
3. Delete this file once the remaining estimates are confirmed or
   replaced.
