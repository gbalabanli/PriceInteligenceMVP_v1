# Phase 01 Page Inventory And Navigation Matrix

## Route Inventory
| Route | Navigation Entry | Purpose |
| --- | --- | --- |
| `/dashboard` | Left menu: `Genel Bakış` | KPI summary and operational overview |
| `/yz-fiyat-onerileri` | Left menu: `YZ Fiyat Önerileri` | AI-backed recommendation review and actions |
| `/dynamic-pricing` | Left menu: `Dinamik Fiyatlandırma` | Simulation controls and apply/rollback flow |
| `/ab-testing` | Left menu: `A/B Fiyatlandırma Testi` | Test impact tracking and snapshot export |
| `/price-monitoring` | Context route | SKU table, filters, and detail drill-in |
| `/product-detail/:skuId` | Context route | Single SKU review context and decision actions |
| `/scenario-lab` | Header icon | Demo scenario switching and reseed tools |
| `/settings` | Header icon | User preferences (locale and UI options) |

## Global Navigation Rules
- Every core page exposes a `Back to Dashboard` quick action.
- Active route and active left-menu item remain synchronized.
- Scenario and settings routes are excluded from left-menu entries.
- `TR` / `EN` language switch in header affects all active page labels.

## Required Transition Paths
1. `Dashboard -> Price Monitoring -> Product Detail -> Dashboard`
2. `Dashboard -> YZ Fiyat Önerileri -> Product Detail`
3. `Dashboard -> Dinamik Fiyatlandırma -> Product Detail (optional)`
4. `Any page -> Scenario Lab -> Return to previous page`
