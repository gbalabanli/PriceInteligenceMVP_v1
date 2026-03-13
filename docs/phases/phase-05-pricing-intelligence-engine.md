# Phase 05: Interaction Wiring And Workflow Logic

## Phase Metadata
- Status: Planned
- Last Updated: 2026-03-13
- Duration Target (Optional): 2 weeks
- Related Master Plan: [../master_plan.md](../master_plan.md)

## Objective
- Wire all core interactions so buttons, links, filters, action flows, and dynamic pricing simulation behave like a working product using mock data.

## Entry Criteria
- Phase 04 mock data layer is stable.
- Action-state matrix and workflow transitions are finalized.

## In Scope
- Wire primary button actions (approve, reject, reset, apply filter, clear filter).
- Wire unified `YZ Fiyat Onerileri` page actions (`Filter`, `Tumunu Onayla`, row-level `Uygula`, integrated recommendation approvals).
- Wire top-right `TR` / `EN` language switch interactions and locale state persistence.
- Implement table row navigation and detail drawer/modal behavior.
- Implement tab/section switching and URL-based page navigation.
- Implement workflow state transitions (pending -> approved/rejected and visual updates).
- Implement dynamic pricing simulation controls:
  - Mode toggle (`Manual` / `Auto-Sim`)
  - `Run Simulation`, `Pause`, `Reset`
  - Auto-suggested price preview -> `Apply` or `Rollback`
- Show simulation explainability labels (reason tags, guardrail hit tags).
- Add lightweight client-side validation and user feedback messages.
- Ensure all user feedback messages (toast/modal labels) are localized by active language.

## Out Of Scope
- Real pricing engine, predictive models, or API-driven recommendations.
- Backend workflow orchestration and audit storage.
- Multi-user concurrency handling.

## Dependencies
- Phase 04 mock data schema and adapters.
- Phase 02 interaction contracts.

## Deliverables
- Fully clickable dashboard workflow implementation.
- Interaction handlers module(s) and state transition map.
- UI feedback patterns (toast, inline alerts, confirmation modals).
- Dynamic pricing simulation interaction module and state diagram.
- Language switch interaction handlers and locale-aware render pipeline notes.
- Page-level action contract matrix (`docs/action_matrix.md`).
- Interaction test checklist with pass/fail evidence.

## Acceptance Criteria
- All primary CTA buttons perform their intended action.
- All planned internal links/routes are functional.
- State transitions are visible in UI components without full page breakage.
- End-to-end demo flow works in sequence without manual code edits.
- Auto-sim mode can generate mock price changes and render them with explicit "simulation" labeling.
- User can apply or rollback simulated price updates and see immediate UI status change.
- User can switch language from top-right header and observe immediate TR/EN UI text update.

## Risks And Blockers
- Missing event wiring can leave critical controls non-functional.
- Conflicting state updates can create inconsistent UI behavior.
- Late UX changes can cause rework in JS handlers.
- Simulation logic may look unrealistic if scenario tuning is weak.

## Exit Criteria
- All required interactions are stable and demo-ready.
- Phase 06 can focus on polish, QA, and handoff only.

## Master Plan Sync Notes
- If interaction scope or flow sequencing changes materially, update success criteria and global risk notes in master plan.
