# Phase 06 Localization QA Checklist

## Scope
- Languages: Turkish (`tr`) and English (`en`)
- Runtime model: key-based dictionary in `assets/js/i18n.js`

## Checklist

| ID | Check | Result | Evidence |
| --- | --- | --- | --- |
| L10N-01 | Top-right `TR/EN` switch updates UI immediately | Pass | Playwright smoke test |
| L10N-02 | Menu labels are localized | Pass | `menu.*` keys verified in UI |
| L10N-03 | Button texts and page headers are localized | Pass | `page.*`, `common.*` usage in `app.js` |
| L10N-04 | Toast and confirmation modal texts are localized | Pass | `toast.*`, `confirm.*` keys |
| L10N-05 | Turkish characters render correctly (`ç,ğ,ı,İ,ö,ş,ü`) | Pass | UI and source file checks |
| L10N-06 | Missing translation keys in runtime | Pass | Key scan: `missing-tr none`, `missing-en none` |

## Notes
- Scenario labels are locale-aware via `page.scenario.*` keys.
