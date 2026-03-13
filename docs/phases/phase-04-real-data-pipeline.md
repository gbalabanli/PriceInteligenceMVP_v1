# Phase 04: Client-Side Mock Data Layer

## Phase Metadata
- Status: Completed
- Last Updated: 2026-03-13
- Duration Target (Optional): 1 week
- Related Master Plan: [../master_plan.md](../master_plan.md)

## Objective
- Implement a client-side mock data system that feeds dashboard widgets, tables, and detail views consistently without any server.

## Entry Criteria
- Phase 03 static page foundation is stable.
- Required data entities and UI states are defined.

## In Scope
- Define frontend mock data schema for products, competitors, recommendations, and status timeline.
- Create mock JSON files and scenario variants (normal, empty, warning, conflict).
- Define localization resource schema for `tr` and `en` text dictionaries.
- Provide localization resources consumed by the top-right header language switch (`TR` / `EN`).
- Add dynamic pricing simulation datasets (mode, trigger events, candidate prices, guardrail hits).
- Build data adapter utilities to map mock data into UI components.
- Ensure adapters can resolve localized labels (menu, CTA, status, tooltip texts) from active locale.
- Implement client-side state store (in-memory and optional `localStorage`).
- Add deterministic data reset/reseed for repeatable demos.

## Out Of Scope
- External data connectors, scraping, or API polling.
- Database persistence.
- Real-time synchronization across users/sessions.

## Dependencies
- Phase 03 page structure and component contracts.
- Phase 01 data scenario priorities.

## Deliverables
- Mock dataset pack covering the agreed dashboard scenarios.
- Client-side data adapter module(s).
- State management utility for dashboard interactions.
- Localization resource pack (`tr.json` / `en.json` or equivalent JS modules).
- Simulation scenario pack for dynamic pricing (`steady market`, `price war`, `stock pressure`).
- Data scenario documentation for QA/demo use.

## Completion Evidence
- Mock dataset source: [../../assets/js/data.js](../../assets/js/data.js)
- Client-side state/adapters: [../../assets/js/app.js](../../assets/js/app.js)
- Localization resources (`tr`/`en`): [../../assets/js/i18n.js](../../assets/js/i18n.js)

## Acceptance Criteria
- Dashboard components consume mock data without hardcoded per-page values.
- At least one scenario per major UI state can be triggered reliably.
- Data reset returns the UI to a known baseline state.
- No network dependency is required for core data rendering.
- Dynamic pricing simulation reads from mock scenarios and updates UI states deterministically.
- Locale switching resolves labels from translation resources without missing-key crashes.
- Top-right `TR` / `EN` switch can read/write locale state and hydrate labels from the same source of truth.

## Risks And Blockers
- Mock schema drift across pages can break consistency.
- Insufficient scenario coverage can hide interaction defects.
- `localStorage` misuse can create stale or confusing demo states.

## Exit Criteria
- Mock data layer is stable and reusable for interaction wiring.
- Phase 05 can focus only on UI behavior, not data plumbing.

## Master Plan Sync Notes
- If schema, scenario coverage, or state strategy changes, update master plan success criteria and milestones.
