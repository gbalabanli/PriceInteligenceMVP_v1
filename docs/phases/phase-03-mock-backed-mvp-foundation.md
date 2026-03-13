# Phase 03: Mock-Backed MVP Foundation

## Phase Metadata
- Status: Planned
- Last Updated: 2026-03-13
- Duration Target (Optional): 2 weeks
- Related Master Plan: [../master_plan.md](../master_plan.md)

## Objective
- Build the static HTML/CSS/JS foundation of the product with all target pages and dashboard layout architecture.

## Entry Criteria
- Phase 01 and Phase 02 are completed and accepted.
- Screen-level UX contract and interaction states are frozen.

## In Scope
- Establish frontend project structure for static assets.
- Implement page templates and responsive dashboard layout.
- Implement shared theme layer aligned with `gemini-pricing.html` palette and `font-sans` typography baseline.
- Implement localization infrastructure (`i18n` key map for `tr` and `en`) for static UI content.
- Implement top-right language switch component in header and shared layout.
- Build reusable UI components (cards, table, status badges, filters, modal, tabs).
- Implement shared navigation and route/link consistency across pages.
- Keep `Scenario Lab` as a separate route/page, not part of left-menu navigation.
- Implement left menu with only 4 entries (`Genel Bakış`, `YZ Fiyat Önerileri`, `Dinamik Fiyatlandırma`, `A/B Fiyatlandırma Testi`).
- Implement `Settings` and `Scenario Lab` as header icon entry points.
- Create base JavaScript modules for view rendering and UI state handling.

## Out Of Scope
- Backend API, server-side rendering, and database.
- Real-time data fetching.
- Production performance optimization beyond demo needs.

## Dependencies
- Phase 01 scope definitions.
- Phase 02 visual and interaction handoff.

## Deliverables
- Static multi-page frontend shell (`HTML/CSS/JS`) aligned with the design.
- Shared component and style conventions.
- Reusable theme tokens (color/typography utilities) applied across all core pages.
- Shared localization resource files and helper utility for runtime label rendering.
- Navigation/route matrix implementation report.
- Local run instructions (`open index.html` or simple static host).

## Acceptance Criteria
- All target pages render correctly with real layout structure.
- Navigation links work without dead ends in planned flows.
- Core dashboard sections and placeholders are visible and consistent.
- Core pages follow the approved palette/typography baseline without off-theme colors.
- Language switcher is available in the top-right header on all core pages.
- Switching `TR` / `EN` updates menu, buttons, table headers, and status labels without layout breakage.
- No backend dependency exists in the implementation.
- `Scenario Lab` route exists, is not shown in left menu, and is reachable via header icon.
- Header icon routes for settings/scenario are functional and separate from left-menu flow.

## Risks And Blockers
- Inconsistent component implementation across pages.
- Responsive issues can break dashboard readability.
- Scope pressure may introduce backend assumptions accidentally.

## Exit Criteria
- Static UI foundation is complete and ready for mock data binding.
- Navigation architecture is stable for Phase 04 and Phase 05.

## Master Plan Sync Notes
- If page architecture or navigation structure changes significantly, update cross-phase dependency notes and quality targets in master plan.
