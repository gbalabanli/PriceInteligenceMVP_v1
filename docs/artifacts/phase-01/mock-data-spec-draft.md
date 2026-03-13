# Phase 01 Mock Data Specification Draft

## Entity Overview
- `products`
- `competitors`
- `recommendations`
- `abTests`
- `historyEvents`
- `simulationState`
- `preferences`

## Minimum Fields
| Entity | Required Fields |
| --- | --- |
| `products` | `id`, `sku`, `name`, `category`, `currentPrice`, `riskLevel`, `status` |
| `competitors` | `sku`, `competitorName`, `minPrice`, `maxPrice`, `lastSeenAt` |
| `recommendations` | `id`, `sku`, `aiPrice`, `reason`, `status`, `confidence` |
| `abTests` | `id`, `variantA`, `variantB`, `status`, `impactDelta` |
| `historyEvents` | `id`, `eventType`, `sku`, `timestamp`, `actor` |
| `simulationState` | `mode`, `running`, `cursor`, `appliedStack`, `guardrailHits` |
| `preferences` | `locale`, `themeDensity`, `defaultScenario` |

## Scenario Bundles
- `normal`
- `empty`
- `warning`
- `conflict`

## Determinism Rule
- Scenario reseed must produce repeatable values for the same seed input.
