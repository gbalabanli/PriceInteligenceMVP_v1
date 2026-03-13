# Phase 06 Theme Compliance Checklist

## Baseline
- Reference: `C:/Users/Bora/Desktop/gemini-pricing.html`
- Required: `font-sans` style stack, indigo/gray/semantic status palette

## Verification

| Item | Result | Evidence |
| --- | --- | --- |
| Left menu + topbar use approved indigo hierarchy | Pass | `assets/css/styles.css` root color tokens |
| Card and table surfaces use gray/white neutral system | Pass | `.card`, `.table-wrap`, `th/td` styles |
| Semantic status colors (high/low/ok) are consistent | Pass | `.status-badge.high/.low/.ok` |
| Typography stack is consistent with baseline intent | Pass | `body { font-family: ui-sans-serif, system-ui, ... }` |
| Compact mode remains within same theme tokens | Pass | `body.compact-mode` overrides only sizing/padding |

## Notes
- No off-palette brand color was introduced in the current MVP shell.
