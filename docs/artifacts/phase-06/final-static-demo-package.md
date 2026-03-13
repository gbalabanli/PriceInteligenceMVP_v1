# Final Static Demo Package

## Package Scope
This package is a fully static mockup and contains no backend dependencies.

## Runtime
1. Start local server from repo root:
   - `python -m http.server 4173`
2. Open:
   - `http://127.0.0.1:4173/index.html#/dashboard`

## Core Assets
- Entry page: `index.html`
- Styles: `assets/css/styles.css`
- App logic and routing: `assets/js/app.js`
- Localization dictionaries: `assets/js/i18n.js`
- Mock data: `assets/js/data.js`

## Included Demo Capabilities
- Four-item left navigation and header icons (`Ayarlar`, `Scenario Lab`).
- TR/EN language switching with persistent locale state.
- Monitoring -> Recommendation -> Product detail flow.
- Dynamic pricing simulation flow with apply/rollback and confirmation.
- A/B pricing test table and snapshot export.
- Scenario loading/reseeding from header icon flow.
- Settings persistence (`locale`, `currency`, `compact mode`).

## Validation Snapshot
- Interaction smoke suite: `14/14` pass
- JavaScript syntax checks: pass (`app.js`, `i18n.js`, `data.js`)
- Localization key scan: no missing key for `tr` and `en`
