# Phase 02 Clickable Prototype And Navigation Map

## Prototype Artifact
- Screen set and route drafts are documented in:
  - `docs/price_intelligence_mockup_pages.pdf`
  - `docs/action_matrix.md`

## Target Route Map
| Route | Screen |
| --- | --- |
| `/dashboard` | General overview and KPI summary |
| `/yz-fiyat-onerileri` | Recommendation list and approval actions |
| `/dynamic-pricing` | Simulation controls and candidate list |
| `/ab-testing` | A/B test metrics and history summary |
| `/price-monitoring` | SKU table and filter flow |
| `/product-detail/:skuId` | Single SKU context and decision card |
| `/settings` | Preferences and locale |
| `/scenario-lab` | Scenario load/reseed panel |

## Required Links
1. Left-menu routes (`4` items only) must be directly accessible from every core page.
2. Header icons must navigate to `settings` and `scenario-lab`.
3. `Back to Dashboard` action must exist across context pages.
