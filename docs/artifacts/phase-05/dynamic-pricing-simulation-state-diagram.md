# Phase 05 Dynamic Pricing Simulation State Diagram

```mermaid
stateDiagram-v2
  [*] --> ManualIdle
  ManualIdle --> AutoIdle: set-dynamic-mode(auto)
  AutoIdle --> ManualIdle: set-dynamic-mode(manual)

  AutoIdle --> AutoRunning: run-simulation
  AutoRunning --> AutoIdle: pause-simulation
  AutoRunning --> AutoIdle: reset-simulation(confirm)
  AutoIdle --> AutoIdle: reset-simulation(confirm)

  ManualIdle --> PreviewOpen: preview-simulation
  AutoIdle --> PreviewOpen: preview-simulation
  AutoRunning --> PreviewOpen: preview-simulation

  PreviewOpen --> Applied: apply-simulation
  Applied --> RolledBack: rollback-simulation(confirm)
  RolledBack --> PreviewOpen: preview-simulation
```

## Notes
- `apply-simulation` marks the related product with a visible `Simulation` tag.
- Rollback is protected by confirmation and uses a local in-memory stack.
- State persistence is in-browser only and intentionally non-production.
