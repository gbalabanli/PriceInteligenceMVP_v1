# Phase 06: QA, Polish, And Demo Handoff

## Phase Metadata
- Status: Planned
- Last Updated: 2026-03-13
- Duration Target (Optional): 1 week
- Related Master Plan: [../master_plan.md](../master_plan.md)

## Objective
- Validate the static mockup end-to-end, remove UX defects, and hand off a clean demo package for stakeholder presentation.

## Entry Criteria
- Phase 05 interaction wiring passes baseline acceptance criteria.
- Demo walkthrough scenarios are defined.

## In Scope
- Execute QA pass for links, buttons, filters, and scenario states.
- Fix visual and interaction defects found in walkthrough tests.
- Run visual regression checks for palette/typography consistency against `gemini-pricing.html` baseline.
- Run localization QA for Turkish and English content rendering.
- Add demo conveniences (reset state, clear onboarding hints) and keep scenario switcher in header icon flow.
- Validate dynamic pricing simulation flow end-to-end (manual mode, auto-sim mode, apply, rollback).
- Validate presentation flow including `Scenario Lab` access via header icon.
- Optimize static asset loading and browser compatibility for demo stability.
- Produce demo script, known limitations list, and handoff notes.

## Out Of Scope
- Production launch and live operations.
- Backend security/compliance hardening.
- Feature expansion outside agreed mockup scope.

## Dependencies
- Phase 05 interaction-complete frontend.
- Inputs from all previous phases.

## Deliverables
- QA checklist with issue log and resolution status.
- Theme compliance checklist (font stack + color token usage per page).
- Localization QA checklist (language switch, key coverage, UTF-8 Turkish character rendering).
- Final static demo package (`HTML/CSS/JS + mock data`).
- Dynamic pricing simulation demo script and disclaimer text (mock behavior only).
- Demo walkthrough script for stakeholders.
- Post-demo improvement backlog.

## Acceptance Criteria
- No dead link remains in defined navigation paths.
- No broken primary button remains in core workflow pages.
- Demo walkthrough can be completed end-to-end without technical intervention.
- Handoff package is approved by product and design/engineering leads.
- Dynamic pricing simulation controls are stable and clearly labeled as non-production automation.
- `Scenario Lab` is included in presentation script via header icon and remains outside main menu navigation.
- Left-menu contains exactly 4 entries and `Settings` / `Scenario Lab` are accessible via header icons.
- Final demo pages pass theme consistency checks for approved fonts and palette tokens.
- Language switch in top-right header works on all core pages and passes TR/EN regression checks.
- Turkish characters are rendered correctly in all core UI surfaces and demo docs.

## Risks And Blockers
- Last-minute scope additions can destabilize working interactions.
- Insufficient QA time can leave visible demo defects.
- Browser-specific issues can degrade demo confidence.

## Exit Criteria
- Static dashboard mockup is demo-ready and stakeholder-usable.
- Documented handoff and next-iteration backlog exist.

## Master Plan Sync Notes
- Reflect QA outcomes, remaining UI risks, and post-demo scope in master plan changelog and milestones.
- Keep simulation disclaimer wording consistent across pages and demo script.
