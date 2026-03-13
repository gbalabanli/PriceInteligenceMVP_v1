# Phase 05 Interaction State Transition Map

## Overview
This map captures the key state transitions implemented in `assets/js/app.js`.

## Recommendation Workflow

| Trigger | From | To | Side Effect |
| --- | --- | --- | --- |
| `approve-single-reco` / `approve-selected-reco` / `approve-all-visible` | `pending` | `approved` | Recommendation status updated, toast shown |
| `reject-single-reco` / `reject-selected-reco` | `pending` | `rejected` | Confirmation modal required, status updated |
| `apply-reco` | `pending` | `approved` | Product price set to suggested, status recalculated |
| `send-monitoring-to-reco` | N/A | `pending` set creation/update | Monitoring selections become recommendation candidates |

## Dynamic Pricing Workflow

| Trigger | From | To | Side Effect |
| --- | --- | --- | --- |
| `set-dynamic-mode` | `manual`/`auto` | `manual`/`auto` | Candidate list scope changes |
| `run-simulation` | `running=false` | `running=true` | Auto candidates are recalculated |
| `pause-simulation` | `running=true` | `running=false` | Simulation loop is halted |
| `apply-simulation` | Candidate previewed | Product updated | Product gets `simulationApplied=true`, stack push |
| `rollback-simulation` | Applied stack not empty | Previous product value | Confirmation modal required, stack pop |
| `reset-simulation` | Any modified simulation state | Baseline simulation state | Confirmation modal required |

## Settings And Localization

| Trigger | From | To | Side Effect |
| --- | --- | --- | --- |
| Header `TR/EN` switch | Locale `tr/en` | Locale `en/tr` | Global rerender + `localStorage` locale update |
| `save-settings` | Any settings | Persisted settings | `preferences` saved (`locale/currency/compactMode`) |
| `restore-defaults` | Any settings | `tr/TRY/compact=false` | Confirmation modal + localStorage reset |

## Scenario Management

| Trigger | From | To | Side Effect |
| --- | --- | --- | --- |
| `load-scenario` | Active dataset | Selected scenario dataset | Data bundles replaced; app returns to last regular route |
| `reseed-scenario` | Current dataset | Reseeded dataset | Deterministic randomized value update |
