# Phase 01 Localization Scope Note

## Language Coverage
- Supported locales:
  - `tr` (default)
  - `en`

## UI Control Requirement
- A global language switch appears in the top-right header as `TR` / `EN`.
- Switch applies immediately on the active page without full reload.

## Coverage Scope
- Left menu labels
- Header labels and icon tooltips
- Page headings and section titles
- Buttons and CTAs
- Table headers
- Status badges
- Toasts, modal titles, and confirmation texts

## Fallback Policy
- Missing translation key fallback order:
  1. Active locale
  2. `tr`
  3. Raw key (for debugging only)

## Encoding Requirement
- All localization resources and docs must be UTF-8.
- Turkish characters must render correctly: `ç, ğ, ı, İ, ö, ş, ü`.
