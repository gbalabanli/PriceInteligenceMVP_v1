# HTML Mockup Action Matrix

## Purpose
This document defines exactly what each primary control does on each page for the serverless mockup MVP.

## Global Interaction Rules
- All actions are client-side only (`HTML/CSS/JS`).
- Any data mutation updates in-memory state and optional `localStorage`.
- All simulation-driven updates must display a visible `Simulation` label.
- Every destructive action (`Reset`, `Rollback`, `Reject`) requires a confirmation modal.
- `Scenario Lab` is accessed by header icon and must not appear in the left menu.
- Language switcher (`TR` / `EN`) is available in the top-right header and applies globally across all pages.
- All localized copy is rendered from UTF-8-safe text resources to prevent Turkish character corruption.

## Page And Control Matrix

| Page | Section | Control | Type | Trigger Condition | Action | UI State Change | Data Effect (Mock) | Navigation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard | KPI Cards | `View Critical SKUs` | Button | Always enabled | Open filtered SKU list with critical flag | Loading skeleton -> filtered table view | Reads `products[].riskLevel` | Go to `Price Monitoring` |
| Dashboard | KPI Cards | `Open YZ Onerileri` | Button | Count > 0 | Open YZ recommendations page with pending focus | Active menu + pending filter highlighted | Reads `recommendations[].status` | Go to `YZ Fiyat Onerileri` |
| Dashboard | Recent Activity | `Open Details` | Button | Selected row exists | Open selected SKU detail | Selected row state + detail header render | Reads SKU by `id` | Go to `Product Detail` |
| Dashboard | Header | `Reset Demo State` | Button | Always enabled | Reset filters, approvals, simulation mode | Toast success + default widgets | Restores baseline seed data | Stay on page |
| Dashboard | Header Icon | `Settings` | Icon button | Always enabled | Open settings drawer/page | Settings panel visible | Reads/writes `preferences` | Stay on page |
| Dashboard | Header Right | `TR` / `EN` Language Switch | Segmented toggle | Always enabled | Change active locale and rerender current view labels | Active language chip highlight + text refresh | Writes `preferences.locale`, reads localization dictionary | Stay on page |
| Dashboard | Header Icon | `Scenario Lab` | Icon button | Always enabled | Open scenario lab route | Scenario panel badge visible | Scenario dataset swap controls enabled | Go to `Scenario Lab` |
| Price Monitoring | Filters | `Apply Filters` | Button | At least one filter set | Apply table filters | Table row count + chip badges update | Filters `products[]` in memory | Stay on page |
| Price Monitoring | Filters | `Clear Filters` | Button | Any filter active | Remove all filters | Filter chips removed + full table shown | Clears filter state object | Stay on page |
| Price Monitoring | Table | `Sort` (column header) | Click | Rows > 1 | Toggle asc/desc sorting | Sort icon state toggles | Reorders rendered array only | Stay on page |
| Price Monitoring | Table Row | `Row Click` | Row action | Row exists | Open SKU detail panel/page | Row highlighted before transition | Stores `selectedSkuId` | Go to `Product Detail` |
| Price Monitoring | Bulk Bar | `Send To YZ Onerileri` | Button | One or more rows selected | Mark selected SKUs as `pending_review` | Selection cleared + toast | Updates `recommendations[]` list | Go to `YZ Fiyat Onerileri` |
| YZ Fiyat Onerileri | Header Controls | `Filtrele` | Button | Always enabled | Open/show filter drawer for recommendation list | Filter drawer visible + filter chips update | Filters recommendation candidates in memory | Stay on page |
| YZ Fiyat Onerileri | Header Controls | `Tumunu Onayla` | Primary button | At least one pending recommendation exists | Apply all visible AI recommendations | Bulk apply toast + status badges update | Batch update `currentPrice` and recommendation statuses | Stay on page |
| YZ Fiyat Onerileri | Tabs | `Pending` / `Processed` | Tab button | Always enabled | Switch recommendation view | Active tab underline + table refresh | Filters `recommendations[]` by status | Stay on page |
| YZ Fiyat Onerileri | Recommendation Table Row | `Uygula` | Button | Row in actionable state | Apply selected row's AI suggested price | Row action button disabled + status badge `Applied` | Update SKU `currentPrice` and add history event | Stay on page |
| YZ Fiyat Onerileri | Recommendation Table Row | `Approve` | Button | Row status `pending` | Approve selected recommendation | Row status `Approved` + toast | Update recommendation object | Stay on page |
| YZ Fiyat Onerileri | Recommendation Table Row | `Reject` | Button | Row status `pending` | Reject selected recommendation | Row status `Rejected` + reason indicator | Update recommendation object | Stay on page |
| YZ Fiyat Onerileri | Recommendation Table Row | `Urun Satiri` | Row action | Row exists | Open selected product detail context | Row highlight + detail load transition | Store selected SKU ID | Go to `Product Detail` |
| Product Detail | Recommendation Card | `Approve` | Primary button | Recommendation status = `pending` | Approve recommendation | Status badge `Approved`, timeline item added | Update recommendation + SKU status | Stay on page |
| Product Detail | Recommendation Card | `Reject` | Secondary button | Recommendation status = `pending` | Reject recommendation after reason pick | Status badge `Rejected`, reason tag shown | Update recommendation + SKU status | Stay on page |
| Product Detail | Recommendation Card | `Add Note` | Button | Always enabled | Open note modal and save text | Note chip visible | Append note to local audit trail | Stay on page |
| Product Detail | Pager | `Previous SKU` | Button | Current SKU not first | Load previous SKU detail | Detail section refresh animation | Reads previous SKU in ordered list | Stay on page (new SKU context) |
| Product Detail | Pager | `Next SKU` | Button | Current SKU not last | Load next SKU detail | Detail section refresh animation | Reads next SKU in ordered list | Stay on page (new SKU context) |
| A/B Fiyatlandırma Testi | Filters | `Apply Date Range` | Button | Valid start/end set | Filter experiment timeline and metrics | Timeline + KPI cards rerender | Filters `historyEvents[]` | Stay on page |
| A/B Fiyatlandırma Testi | Filters | `Reset Range` | Button | Custom range active | Revert to default range | Default period chip active | Clears date filter | Stay on page |
| A/B Fiyatlandırma Testi | Controls | `Run New Test` | Primary button | Required SKU group selected | Start mock A/B test session | Test state badge `Running` | Creates mock experiment record | Stay on page |
| A/B Fiyatlandırma Testi | Export | `Export Snapshot` | Button | Always enabled | Download current view as JSON | Toast success | Serialize current filtered state | Stay on page |
| Dinamik Fiyatlandırma | Mode | `Manual` / `Auto-Sim` | Segmented toggle | Always enabled | Switch operating mode | Mode badge + help text update | Sets `simulation.mode` | Stay on page |
| Dinamik Fiyatlandırma | Controls | `Run Simulation` | Primary button | Mode = `Auto-Sim` and not running | Start deterministic simulation cycle | Running indicator + lock incompatible controls | Iterates mock price candidates | Stay on page |
| Dinamik Fiyatlandırma | Controls | `Pause` | Button | Simulation running | Pause cycle at current step | Running indicator off | Freeze simulation cursor | Stay on page |
| Dinamik Fiyatlandırma | Controls | `Reset` | Button | Any simulation state changed | Reset simulation to baseline step | Progress returns to zero, badges reset | Restore `simulation` state seed | Stay on page |
| Dinamik Fiyatlandırma | Suggestion List | `Preview` | Button | Candidate row available | Open candidate preview drawer | Drawer opens with diff view | Reads candidate object | Stay on page |
| Dinamik Fiyatlandırma | Suggestion Drawer | `Apply` | Primary button | Preview open | Apply suggested price to SKU | SKU status `Applied (Simulation)` + toast | Write new mock `currentPrice` + audit event | Optional go to `Product Detail` |
| Dinamik Fiyatlandırma | Suggestion Drawer | `Rollback` | Danger button | At least one applied simulation update exists | Revert selected applied change | SKU status reverts + rollback badge | Restore previous price from local history stack | Stay on page |
| Dinamik Fiyatlandırma | Guardrails | `Show Guardrail Hits` | Toggle | Always enabled | Filter candidates with guardrail impacts | Guardrail-only list view | Filters candidates by `guardrailHits > 0` | Stay on page |
| Scenario Lab (Header Icon) | Scenario List | `Load Scenario` | Button | Any scenario selected | Replace active dataset and reset transient state | Full app soft-refresh | Swap dataset bundle | Return to last visited page |
| Scenario Lab (Header Icon) | Utility | `Re-seed Randomized Values` | Button | Scenario loaded | Recompute deterministic random fields | KPI and table micro-changes animate | Rebuild derived values with seed | Stay on page |
| Settings (Header Icon) | Preferences | `Save Preferences` | Button | Form valid | Persist local preferences | Toast success + updated preview | Write `preferences` to `localStorage` | Stay on page |
| Settings (Header Icon) | Preferences | `Restore Defaults` | Button | Always enabled | Restore default preferences | Form reset + layout redraw | Clear custom preference object | Stay on page |

## Navigation Consistency Checks
- Every left-menu item must map to one route and one active-state highlight.
- Every page must include a `Back to Dashboard` quick action.
- Left-menu items are exactly: `Genel Bakış`, `YZ Fiyat Önerileri`, `Dinamik Fiyatlandırma`, `A/B Fiyatlandırma Testi`.
- `YZ Fiyat Önerileri` page includes recommendation actions; no separate `Öneriler` left-menu entry exists.
- `Settings` and `Scenario Lab` are header icon entry points, not left-menu entries.
- Language switch control (`TR` / `EN`) is present in top-right header and persists selection for next page visit.
- `Scenario Lab` route must be hidden from left menu and included in presentation script via header icon.

## Explicit Non-Goals
- No real automated repricing in production systems.
- No server-side workflow orchestration.
- No persistent audit storage beyond browser-local mock state.

