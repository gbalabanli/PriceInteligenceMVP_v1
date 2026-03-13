# Phase 02 Dynamic Pricing Prototype Flow

## Flow Steps
1. User opens `Dinamik Fiyatlandırma` from left menu.
2. User picks mode (`Manual` or `Auto-Sim`).
3. In `Auto-Sim`, user starts simulation with `Run Simulation`.
4. Candidate rows appear with reason and guardrail tags.
5. User previews a candidate in side drawer.
6. User chooses `Apply` or `Rollback`.
7. UI updates status badge and audit timeline marker.

## Visual States
- `Idle`: no running simulation
- `Running`: auto cycle active
- `Paused`: cycle stopped at current step
- `Applied`: candidate accepted (simulation tag shown)
- `RolledBack`: latest simulated change reverted

## Labels
- Every simulation-origin update includes explicit `Simulation` marker.
