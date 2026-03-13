# Phase 01 Dynamic Pricing Simulation Action Contract

## Simulation Modes
- `Manual`: user reviews candidate updates one-by-one.
- `Auto-Sim`: deterministic cycle generates candidate updates.

## Core Controls
| Control | Precondition | Result |
| --- | --- | --- |
| `Manual` | Always available | Sets mode to manual review |
| `Auto-Sim` | Always available | Sets mode to auto simulation |
| `Run Simulation` | Mode is `Auto-Sim` and not running | Starts deterministic simulation cycle |
| `Pause` | Simulation is running | Pauses at current step |
| `Reset` | Any simulation state changed | Returns simulation state to baseline |
| `Preview` | Candidate exists | Opens diff drawer with reason tags |
| `Apply` | Preview is open | Applies simulated price to selected SKU |
| `Rollback` | At least one applied simulated change exists | Reverts most recent applied change |
| `Show Guardrail Hits` | Always available | Filters candidates with guardrail impact |

## Guardrail Rules
- Guardrail flags are visual-only in MVP.
- Every simulation-applied value is marked as `Simulation`.
- Destructive actions (`Reset`, `Rollback`) require confirmation.
