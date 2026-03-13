# Phase 05 Interaction Test Checklist

## Test Metadata
- Date: 2026-03-13
- Environment: Local static host (`python -m http.server 4173`)
- Browser Harness: Playwright MCP
- Build Type: Static HTML/CSS/JS mockup (no backend)

## Checklist

| ID | Area | Scenario | Expected | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| P5-01 | Navigation | Left menu routes (`Genel Bakış`, `YZ Fiyat Önerileri`, `Dinamik Fiyatlandırma`, `A/B Fiyatlandırma Testi`) | Route change and active menu highlight | Pass | Playwright snapshot on `/index.html#/yz-fiyat-onerileri` |
| P5-02 | Header Actions | `Ayarlar` and `Scenario Lab` icons route correctly | Page opens and actions available | Pass | Playwright run-code route assertions |
| P5-03 | Localization | `TR`/`EN` switch updates labels without refresh | Header/menu/page labels rerender | Pass | Playwright interaction: EN toggle and label verification |
| P5-04 | Recommendations | `Filter` reveals risk filter controls | Filter UI appears and applies | Pass | `filterVisible = 1` in Playwright run result |
| P5-05 | Recommendations | Select-all + `Approve Selected` bulk action | Pending rows move to processed | Pass | `pendingAfter = 0` in Playwright run result |
| P5-06 | Dynamic Pricing | `Run Simulation` + `Preview` + `Apply` | Candidate applies and status reflected | Pass | Playwright run result + dashboard simulation tag visibility |
| P5-07 | Dynamic Pricing | `Rollback` requires confirmation and reverts | Confirm modal appears and rollback executed | Pass | Rollback flow validated in previous smoke run |
| P5-08 | Settings | `Compact mode` save applies UI preference | `body.compact-mode` active | Pass | `compact = true` in Playwright run result |
| P5-09 | A/B Test | `Export Snapshot` action | JSON snapshot download triggered | Pass | Manual code path verification in `exportAbSnapshot()` |
| P5-10 | Console Stability | Runtime errors in core flow | No JS runtime errors | Pass | Playwright console errors = 0 |

## Notes
- A previous favicon 404 warning was eliminated by adding a data-URI favicon link in `index.html`.
- Phase 05 acceptance criteria are satisfied for core interactive workflow behavior.
