# PriceInteligence MVP

PriceInteligence is an AI pricing intelligence product for e-commerce teams. This repository contains the current demo-ready MVP: a static frontend prototype that shows the core pricing workflow end to end.

The product is designed for teams that manage large catalogs, track competitor prices, and need to make SKU-level pricing decisions faster and with more confidence. The current MVP focuses on the decision workflow rather than production infrastructure.

## What The MVP Does

The current version demonstrates four core product areas:

- `Overview`: highlights which products need pricing attention
- `AI Recommendations`: shows SKU-level pricing suggestions and rationale
- `Dynamic Pricing`: lets users configure and simulate pricing strategies
- `A/B Pricing Tests`: supports price testing workflows and decision review

The goal of this MVP is to make the pricing decision process visible and demoable:

`monitor -> inspect -> recommend -> apply strategy -> test`

## Current Stage

This is a pre-pilot MVP. It is functional as a product demo and workflow prototype, but it is not yet a production deployment.

What is included today:

- Static frontend built with `HTML`, `CSS`, and vanilla `JavaScript`
- Hash-based routes for the main product flows
- Mock pricing, competitor, and market data
- Interactive drawers, tables, strategy cards, and test controls
- End-to-end demo flow for pricing review and action

What is not included yet:

- Backend services
- Real API integrations
- Live data ingestion
- Automated repricing in production
- Persistent database storage

## Local Run

No server is required.

1. Open [`index.html`](index.html) in a browser.
2. The app runs directly from static files.
3. The default route loads the dashboard flow.

Full local path:

`C:\Users\Bora\Desktop\Workspace\agents\PriceInteligenceMVP_v1\index.html`

## Demo Checklist

1. Open the app and confirm the top header and left navigation render correctly.
2. Navigate between `Overview`, `AI Recommendations`, `Dynamic Pricing`, and `A/B Pricing Tests`.
3. Click the add-product action and confirm the right-side drawer opens.
4. Add a product and verify it appears in the tracked products table.
5. Click a product row and confirm the competitor details drawer opens.
6. On `Dynamic Pricing`, select a strategy and verify the summary panel updates.
7. Start a strategy and confirm the active assignment list updates.
8. Pause or remove an active assignment and verify the state changes.
9. On `A/B Pricing Tests`, change the selected test and confirm the comparison and guardrail views update.
10. Use close actions such as `Esc`, close button, or backdrop where applicable.

## Repository Structure

- [`index.html`](index.html): app shell
- [`assets/css/styles.css`](assets/css/styles.css): layout and theme
- [`assets/js/data.js`](assets/js/data.js): mock product, competitor, and market data
- [`assets/js/app.js`](assets/js/app.js): rendering and interaction logic

## Documentation

Implementation planning documents remain in `docs/`:

- [`docs/master_plan.md`](docs/master_plan.md)
- `docs/phases/`

Additional product documentation, UX artifacts, QA notes, and exported mockups live in the companion repository:

- [PriceInteligenceDocs](https://github.com/gbalabanli/PriceInteligenceDocs)

## Product Direction

The production version of PriceInteligence is planned to include:

- Real marketplace and commerce platform integrations
- Pricing signal ingestion pipelines
- Guardrailed recommendation and automation logic
- Closed-loop experimentation and performance feedback
- A stronger decision engine for continuous SKU-level pricing

The long-term goal is not just to show competitor prices, but to become the decision layer e-commerce teams use to make faster and better pricing decisions.
