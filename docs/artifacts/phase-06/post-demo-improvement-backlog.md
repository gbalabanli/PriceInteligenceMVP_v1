# Phase 06 Post-Demo Improvement Backlog

## Prioritized Items

| Priority | Item | Rationale |
| --- | --- | --- |
| P1 | Extract page renderers into modules | `app.js` is intentionally monolithic for speed; modularization improves maintainability |
| P1 | Add automated UI test suite (Playwright spec files) | Current smoke checks are ad-hoc; persistent CI tests reduce regression risk |
| P1 | Add richer chart visualizations for KPI trends | Current MVP uses table/KPI blocks only; trend views improve storytelling |
| P2 | Add CSV export for recommendations and monitoring tables | Snapshot export exists for A/B only |
| P2 | Add "select all visible page" pagination-aware bulk controls | Current bulk select works on rendered set |
| P2 | Add locale-based date formatting helper | Current date display is simple ISO string |
| P3 | Add onboarding tips for first-time demo users | Improve usability during stakeholder demos |
| P3 | Add accessibility pass (focus trap in modal, ARIA enhancements) | Base accessibility exists but can be hardened |

## Deferred By Design
- Backend integrations
- Persistent multi-user audit history
- Real market data ingestion and model serving
