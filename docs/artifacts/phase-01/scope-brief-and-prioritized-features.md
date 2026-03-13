# Phase 01 Scope Brief And Prioritized Features

## Goal
Deliver a static, browser-only pricing intelligence mockup that is demo-ready, fully navigable, and interaction-complete without backend services.

## Constraints
- No backend, API, database, or server-side logic.
- All interactions run in `HTML/CSS/JavaScript` on the client.
- Data comes from mock datasets and deterministic simulation states.
- Left menu has exactly 4 entries:
  - `Genel Bakış`
  - `YZ Fiyat Önerileri`
  - `Dinamik Fiyatlandırma`
  - `A/B Fiyatlandırma Testi`
- `Ayarlar` and `Scenario Lab` are header icon routes.
- UI must support Turkish and English via top-right `TR` / `EN` switch.

## Must-Have Features (P1)
1. Multi-page dashboard shell with working internal navigation.
2. Action-complete controls for core pages (approve/reject/apply/filter/reset).
3. Dynamic pricing simulation (`Manual` / `Auto-Sim`, preview/apply/rollback).
4. Bilingual UI labels and status messages (TR/EN).
5. Deterministic mock data scenarios and scenario switching.

## Should-Have Features (P2)
1. Local preference persistence (`locale`, display options).
2. Export snapshot on A/B page.
3. Scenario reseed utility for varied demo runs.

## Deferred (P3+)
1. Real repricing engine integration.
2. Live competitor ingestion.
3. Multi-user collaboration or role permissions.

## Completion Note
Scope and priorities were aligned with stakeholder decisions recorded in `master_plan.md`.
