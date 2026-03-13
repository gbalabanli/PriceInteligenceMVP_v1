# Phase 01: Discovery And Scope Freeze

## Phase Metadata
- Status: Completed
- Last Updated: 2026-03-13
- Duration Target (Optional): 1 week
- Related Master Plan: [../master_plan.md](../master_plan.md)

## Objective
- Freeze static mockup scope, required dashboard workflows, and no-server technical constraints before implementation starts.

## Entry Criteria
- Project sponsor and product owner are identified.
- Initial product concept exists for AI-powered competitive pricing.
- Core stakeholder group is available for scope decisions.

## In Scope
- Define target users and dashboard usage scenarios.
- Define mandatory page list and navigation map.
- Define required interactive controls (buttons, filters, modal actions, table actions).
- Lock visual baseline reference (`C:/Users/Bora/Desktop/gemini-pricing.html`) for palette and typography decisions.
- Define bilingual scope for Turkish and English UI copy.
- Define top-right header language switch behavior (`TR` / `EN`) and global persistence rule.
- Define dynamic pricing simulation flow (`Manual` vs `Auto-Sim`) and guardrail presentation rules.
- Define mock data needs (entities, states, edge-case scenarios).
- Document hard technical constraint: no backend/API/database.
- Produce a prioritized frontend-only MVP backlog and dependency map.

## Out Of Scope
- Backend service design and API contracts.
- Real competitor data ingestion or scraping operations.
- Model training, prediction APIs, and production operations.

## Dependencies
- None.

## Deliverables
- Static mockup scope brief and prioritized feature list.
- Page inventory and navigation matrix.
- Interaction contract document (action -> UI state change).
- Visual baseline note (approved palette tokens + font stack source).
- Localization scope note (TR/EN coverage, fallback policy, key naming baseline).
- Dynamic pricing simulation action contract (mode switch, simulate, preview apply, rollback).
- Mock data specification draft for later implementation.

## Completion Evidence
- Scope brief and priorities: [../artifacts/phase-01/scope-brief-and-prioritized-features.md](../artifacts/phase-01/scope-brief-and-prioritized-features.md)
- Page inventory and navigation matrix: [../artifacts/phase-01/page-inventory-and-navigation-matrix.md](../artifacts/phase-01/page-inventory-and-navigation-matrix.md)
- Visual baseline note: [../artifacts/phase-01/visual-baseline-note.md](../artifacts/phase-01/visual-baseline-note.md)
- Localization scope note: [../artifacts/phase-01/localization-scope-note.md](../artifacts/phase-01/localization-scope-note.md)
- Dynamic simulation contract: [../artifacts/phase-01/dynamic-pricing-simulation-action-contract.md](../artifacts/phase-01/dynamic-pricing-simulation-action-contract.md)
- Mock data spec draft: [../artifacts/phase-01/mock-data-spec-draft.md](../artifacts/phase-01/mock-data-spec-draft.md)
- Interaction contract: [../action_matrix.md](../action_matrix.md)

## Acceptance Criteria
- Scope document is reviewed and approved by product and engineering leads.
- Must-have vs deferred interactions are clearly separated.
- No-server constraint is explicitly documented and accepted.
- Theme baseline source file and token families are explicitly approved.
- TR/EN language scope, fallback behavior, and header-switch interaction are explicitly approved.
- Dynamic pricing simulation is explicitly positioned as mock behavior (not production auto-pricing).
- Phase 02 input package is complete.

## Risks And Blockers
- Unclear workflow priorities can create UX conflicts.
- Late stakeholder alignment may delay phase transitions.
- Over-scoping risk if backend-dependent ideas are mixed into MVP.

## Exit Criteria
- Scope freeze decision is signed off.
- Visual MVP brief and static technical constraints are ready for Phase 02 and Phase 03.

## Master Plan Sync Notes
- If scope, workflow priorities, or static constraints shift, update master-plan success criteria and phase index summaries.
