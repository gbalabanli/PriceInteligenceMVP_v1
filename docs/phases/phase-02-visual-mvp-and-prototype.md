# Phase 02: Visual MVP And Prototype

## Phase Metadata
- Status: Completed
- Last Updated: 2026-03-13
- Duration Target (Optional): 2 weeks
- Related Master Plan: [../master_plan.md](../master_plan.md)

## Objective
- Deliver a validated visual dashboard prototype with finalized page-to-page navigation and interaction behavior before coding.

## Entry Criteria
- Phase 01 scope and workflow definitions are signed off.
- Required pages and actions are defined.

## In Scope
- Build information architecture for core screens.
- Extract and formalize color/font tokens from `C:/Users/Bora/Desktop/gemini-pricing.html`.
- Define bilingual content map (`tr` and `en`) for all visible labels, CTA texts, and status badges.
- Design top-right header language switch control (`TR` / `EN`) with active-state affordance.
- Design high-fidelity views for:
  - Price monitoring dashboard
  - YZ Fiyat Onerileri page (including recommendations in the same page)
  - A/B Fiyatlandırma Testi page (renamed from history-impact framing)
  - Competitor comparison table
  - Recommendation detail panel
  - Approval/rejection workflow
  - Impact tracking summary
- Design dynamic pricing simulation screen/section:
  - Mode toggle (`Manual` / `Auto-Sim`)
  - Simulation control panel (`Run`, `Pause`, `Reset`)
  - Auto-update preview list with guardrail badges
- Design `Scenario Lab` page (accessible via header icon, not visible in left menu).
- Define header icon actions for `Settings` and `Scenario Lab`.
- Produce a clickable prototype covering all intended internal links.
- Define component states (default, loading, empty, success, warning, error).
- Define localized state text variants and fallback behavior when a translation key is missing.
- Run quick validation sessions with representative users.

## Out Of Scope
- Production deployment setup.
- Backend integration, API wiring, or persistent storage.
- Real algorithm/model behavior beyond UI simulation.

## Dependencies
- Phase 01 scope freeze and workflow definitions.

## Deliverables
- Visual design system baseline (typography, spacing, states, components).
- Theme token sheet (indigo/gray/semantic palette + Tailwind `font-sans` mapping).
- Localization-ready copy sheet (`tr`/`en`) and UI text key inventory.
- Clickable dashboard prototype with navigation map.
- Dynamic pricing simulation prototype flow and state map.
- UX validation notes with prioritized revisions.
- Handoff package for static HTML/CSS/JS implementation.

## Completion Evidence
- Design system baseline: [../artifacts/phase-02/visual-design-system-baseline.md](../artifacts/phase-02/visual-design-system-baseline.md)
- Theme token sheet: [../artifacts/phase-02/theme-token-sheet.md](../artifacts/phase-02/theme-token-sheet.md)
- Localization copy sheet: [../artifacts/phase-02/localization-copy-sheet.md](../artifacts/phase-02/localization-copy-sheet.md)
- Prototype and route map: [../artifacts/phase-02/clickable-prototype-and-navigation-map.md](../artifacts/phase-02/clickable-prototype-and-navigation-map.md)
- Dynamic pricing flow: [../artifacts/phase-02/dynamic-pricing-prototype-flow.md](../artifacts/phase-02/dynamic-pricing-prototype-flow.md)
- UX validation notes: [../artifacts/phase-02/ux-validation-notes.md](../artifacts/phase-02/ux-validation-notes.md)
- Static handoff pack: [../artifacts/phase-02/static-handoff-package.md](../artifacts/phase-02/static-handoff-package.md)
- Supporting mockup pages: [../price_intelligence_mockup_pages.pdf](../price_intelligence_mockup_pages.pdf)

## Acceptance Criteria
- Prototype supports monitor -> compare -> review -> approve/reject -> status update flow.
- Every planned route and primary link is represented in prototype.
- Dynamic pricing simulation route and controls are fully clickable in prototype.
- `Scenario Lab` is reachable via header icon route and included in presentation route map.
- Left-menu structure is limited to 4 entries and header icons are correctly mapped.
- Approved mockup screens consistently use the reference theme token families and typography baseline.
- Header language switch is visible in top-right area and prototype-level toggle flow is validated.
- All primary screens have both Turkish and English text variants in handoff assets.
- Target users complete core tasks without critical usability blockers.
- Product and engineering approve final interaction contract.
- Screen-level handoff details are sufficient for Phase 03 development.

## Risks And Blockers
- Unvalidated assumptions about decision workflows can cause rework later.
- Missing edge-case handling (empty table, no recommendation, conflicting status).
- Design drift if engineering starts before interaction freeze.

## Exit Criteria
- Interaction and screen contract is frozen for MVP scope.
- Static implementation handoff artifacts are complete and approved.

## Master Plan Sync Notes
- If key workflow or navigation changes are introduced, update cross-phase dependency notes and quality targets in master plan.
