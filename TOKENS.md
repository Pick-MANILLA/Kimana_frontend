# Design tokens — status

**Placeholder, not final.** The Figma file at
https://www.figma.com/design/nl4CX8ZlG1Rw13Rfe3Vv5n/Untitled?node-id=0-1 could
not be read at scaffold time: no Figma MCP server was connected, and no
exported frames existed at `./design/`. Rather than block the whole build, the
values in [src/styles/theme.css](src/styles/theme.css) were set to reasonable
defaults for a mobile-first fintech product, by explicit decision of the
project owner.

## What's real vs. placeholder

- **Placeholder**: every hex value, every px/rem size, shadow values, radii.
- **Real / structural**: the token *names* (`--color-brand-600`,
  `--text-lg`, `--radius-md`, `--shadow-card`, etc.) and the fact that
  components reference names, never raw values.

## How to replace with real tokens

1. Get Figma access working — either connect a Figma MCP server, or export
   frames/tokens to `./design/`.
2. Re-derive the token set (colors, type scale, spacing, radii, shadows,
   component variants) from the source file at node `0-1`.
3. Edit only the values in `src/styles/theme.css`. Do not rename tokens
   without also updating every component that references the old name —
   grep for the token name first.
4. Delete this file once the swap is done.
