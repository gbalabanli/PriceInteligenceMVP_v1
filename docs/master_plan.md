# AI-Powered Competitive Ecommerce Pricing HTML Mockup Master Plan

## Planning Metadata
- Last Updated: 2026-03-13
- Planning Horizon: 4-6 weeks
- Overall Status: Planned

## Project Goal
Build a fully clickable and demo-ready competitive pricing dashboard mockup that runs only with static `HTML/CSS/JavaScript`, has no backend/server dependency, uses in-browser mock data, and demonstrates the end-to-end pricing workflow.

## Success Criteria
- The product runs from static files (`index.html`) without backend/API/database.
- All primary buttons trigger visible actions (filtering, modal open/close, approve/reject, tab switches).
- All internal navigation links work across pages and return to dashboard correctly.
- Dashboard widgets render from mock JSON data and reflect state changes.
- The full workflow is demoable: monitor -> inspect competitor view -> review recommendation -> approve/reject -> see updated status.
- A dynamic pricing simulation mode is demoable with clear state transitions (`Manual` vs `Auto-Sim`) and guardrail behavior.
- Left menu is limited to: `Genel Bakış`, `YZ Fiyat Önerileri`, `Dinamik Fiyatlandırma`, `A/B Fiyatlandırma Testi`.
- `Ayarlar` and `Scenario Lab` are exposed as header icons, not left-menu items.
- Visual theme uses the approved reference baseline from `C:/Users/Bora/Desktop/gemini-pricing.html` (Tailwind `font-sans`, indigo primary accents, gray neutral surfaces, semantic red/yellow/green status colors).
- UI supports both Turkish and English labels/content, with a top-right header language switcher (`TR` / `EN`).
- Turkish characters render correctly across UI/docs (`ç, ğ, ı, İ, ö, ş, ü`) without mojibake.

## Scope Summary
### In Scope
- Phase plan for a static dashboard mockup MVP.
- Visual design and page structure for key pricing workflows.
- Theme lock based on `gemini-pricing.html` color palette and typography baseline.
- Bilingual copy architecture (TR + EN) with key-based localization resources.
- Frontend-only implementation with modular JS and mock data files.
- Working interactive components (buttons, links, filters, drawers, modals, tables, charts).
- Unified `YZ Fiyat Onerileri` menu page (KPI cards + recommendation table + approval actions in the same page).
- Dynamic pricing simulation UX (mode toggle, simulation run, auto-update preview, rollback).
- `A/B Fiyatlandırma Testi` page replacing `Gecmis ve Etki` naming and framing.
- `Scenario Lab` page accessible from header icon as part of presentation flow.
- Demo package and usage guide for local/static hosting.

### Out of Scope
- Backend services, REST/GraphQL APIs, and server-side business logic.
- Real-time data ingestion, scraping pipelines, and persistent database storage.
- Authentication, authorization, and multi-tenant architecture.
- Production deployment hardening and enterprise operations.

## Assumptions And Open Questions
- Assumption: MVP is intentionally frontend-only and should remain serverless.
- Assumption: Mock dataset size is sufficient to represent dashboard states and edge cases.
- Assumption: Browser-local state (in-memory or `localStorage`) is acceptable for the demo.
- Open question: Should charts use vanilla SVG/Canvas or a lightweight client-side chart library?
- Open question: Is single-language UI enough for the first demo, or is EN/TR toggle needed?
- Open question: What is the minimum page set required (single-page dashboard vs multi-page flow)?

## Delivery Strategy
The plan keeps six phases but aligns all work to a static mockup architecture. Early phases define scope and UX. Middle phases implement page structure, mock data adapters, and interactive behavior. Final phases focus on dashboard polish, usability fixes, and demo packaging so stakeholders can use the product as if it were a working application, without any server. Scenario management is accessed via header icon and included in the presentation flow.

## Visual Theme Baseline
- Reference File: `C:/Users/Bora/Desktop/gemini-pricing.html`
- Typography: Tailwind `font-sans` stack (`ui-sans-serif`, `system-ui`, `Segoe UI`, `Roboto`, `Helvetica`, `Arial`, sans-serif).
- Primary Palette: `indigo-700` (top nav), `indigo-600` (primary CTA), `indigo-50`/`indigo-100` (secondary CTA), `indigo-200` (nav active/hover), `indigo-400` (meta helper text).
- Neutral Palette: `gray-50` page background, `white` cards, `gray-100`/`gray-200` borders, `gray-400` to `gray-800` content text hierarchy.
- Semantic Status Colors: `red-500/600/700` (high-risk), `yellow-500/600/700` (low margin warning), `green-500/600/700` (competitive/opportunity), `blue-500` (info KPI accent).
- Theme Rule: New screens/components must reuse these tokens; no off-palette brand colors unless explicitly approved.

## Phase Index

| Phase | Status | Goal | Depends On | Document |
| --- | --- | --- | --- | --- |
| Phase 01 | Planned | Freeze static mockup scope, user flows, and interaction rules | None | [phase-01-discovery-and-scope.md](phases/phase-01-discovery-and-scope.md) |
| Phase 02 | Planned | Finalize visual dashboard language and navigation map | Phase 01 | [phase-02-visual-mvp-and-prototype.md](phases/phase-02-visual-mvp-and-prototype.md) |
| Phase 03 | Planned | Implement static HTML/CSS page foundation and layout system | Phase 01, Phase 02 | [phase-03-mock-backed-mvp-foundation.md](phases/phase-03-mock-backed-mvp-foundation.md) |
| Phase 04 | Planned | Implement client-side mock data layer and dashboard bindings | Phase 03 | [phase-04-real-data-pipeline.md](phases/phase-04-real-data-pipeline.md) |
| Phase 05 | Planned | Wire all interactions including dynamic pricing simulation flows | Phase 04 | [phase-05-pricing-intelligence-engine.md](phases/phase-05-pricing-intelligence-engine.md) |
| Phase 06 | Planned | QA, polish, and demo handoff for static mockup release | Phase 05 | [phase-06-pilot-hardening-and-launch.md](phases/phase-06-pilot-hardening-and-launch.md) |

## Phase Gates
- Gate 1 (Scope Freeze): Static-only constraints and required workflows approved.
- Gate 2 (UX Freeze): Dashboard screens and navigation paths finalized.
- Gate 3 (Structure Ready): Static page architecture and layout system complete.
- Gate 4 (Behavior Ready): Mock data binding and UI actions stable.
- Gate 5 (Demo Ready): End-to-end demo walkthrough passes without blockers.

## Quality Targets
- Initial render time under 2 seconds on a standard laptop browser.
- Zero dead links in the defined navigation map.
- Zero non-functional primary CTA buttons in core pages.
- Dashboard state updates visible within 200 ms after user actions.
- Layout remains usable at desktop and tablet breakpoints.
- Dynamic pricing simulation completes within 1 second for mock scenario runs and always shows explainable reason labels.
- Presentation flow includes header-icon routes (`Settings`, `Scenario Lab`) without dead links.
- Theme consistency check passes: all core pages use approved font stack and palette tokens from the reference baseline.
- Language switch (`TR` / `EN`) updates all header/menu/page labels without reload breakage.
- UTF-8 text quality check passes for all user-visible copy; no broken Turkish characters in UI or exported docs.

## Cross-Phase Dependencies
- Interaction contracts frozen in Phase 02 must remain stable for JS behavior work in Phase 05.
- Theme tokens frozen in Phase 02 must be implemented in Phase 03 and regression-tested in Phase 06.
- Localization keys and language switch behavior frozen in Phase 02 must be implemented in Phase 03/05 and regression-tested in Phase 06.
- Data schema defined in Phase 04 must be reused consistently by dashboard widgets and tables.
- Phase 06 QA uses acceptance criteria from Phase 03 to Phase 05 without redefining scope.
- Any new page added after Phase 03 must include navigation links and action-state mapping.

## Major Milestones
- Milestone A: Static MVP scope and workflow sign-off (end of Phase 01).
- Milestone B: Approved dashboard prototype with page map (end of Phase 02).
- Milestone C: Implemented static UI shell across all target pages (end of Phase 03).
- Milestone D: Working mock data dashboard with interactive actions (end of Phase 05).
- Milestone E: Demo-ready package and handoff documentation completed (end of Phase 06).

## End-State Deliverables
- Static HTML/CSS/JS dashboard mockup with multi-page navigation.
- Shared theme token baseline (palette + typography) aligned with `gemini-pricing.html`.
- Localization bundle for Turkish and English (`tr`, `en`) and top-right language switcher in header.
- Mock data files and client-side data binding modules.
- Fully wired interaction flows (buttons, filters, status changes, modals).
- `YZ Fiyat Onerileri` page matching the requested reference layout and including recommendation approval flows.
- Dynamic pricing simulation page/section with `Manual` and `Auto-Sim` modes, preview, apply, and rollback actions.
- `A/B Fiyatlandırma Testi` page with experiment/impact framing (renamed from history-impact terminology).
- `Scenario Lab` page reachable by header icon and included in demo walkthrough.
- Demo script and setup note for running from static files or simple local static host.

## Supporting Specs
- Action contract matrix: [action_matrix.md](action_matrix.md)

## Global Risks And Decisions
- Risk: Scope creep may push the mockup toward unintended backend requirements.
- Risk: Too little mock data variety can hide important dashboard edge cases.
- Risk: Interaction complexity may create inconsistent UI state handling.
- Risk: Simulation may be mistaken for production automation unless explicitly labeled.
- Risk: Header-icon routes may be overlooked if icon affordance is weak.
- Decision: Keep server and API out of scope for this MVP cycle.
- Decision: Prioritize believable interaction quality over technical infrastructure.
- Decision: Adopt `C:/Users/Bora/Desktop/gemini-pricing.html` as visual baseline for palette and font choices.
- Decision: Dynamic pricing is represented as deterministic mock simulation, not real autonomous repricing.
- Decision: Scenario Lab is part of stakeholder presentation and accessed from header icon.
- Decision: Settings and Scenario Lab entry points live in header icons instead of left menu.
- Decision: Language default is Turkish, with English available via top-right header switch (`TR`/`EN`).

## Change Log
- 2026-03-13: Phase plan updated for bilingual support (TR/EN), top-right language switcher requirement, and UTF-8 Turkish character quality checks.
- 2026-03-13: Theme baseline updated to match `gemini-pricing.html` (indigo/gray/semantic palette + Tailwind `font-sans` typography).
- 2026-03-13: Plan re-scoped to static HTML mockup product (no backend/server), with mock data and fully working navigation/actions.
- 2026-03-13: Dynamic pricing simulation scope added (menu/page-level demo flow with manual vs auto-sim behavior).
- 2026-03-13: Scenario Lab moved to header-icon navigation (outside left menu).
- 2026-03-13: Added new menu page `AI Fiyat Onerileri` based on provided reference page structure.
- 2026-03-13: Left menu restructured to 4 items (`Genel Bakış`, `YZ Fiyat Önerileri`, `Dinamik Fiyatlandırma`, `A/B Fiyatlandırma Testi`); settings and scenario moved to header icons.
- 2026-03-13: Scenario Lab re-included in presentation flow (still accessed from header icon, not left menu).
