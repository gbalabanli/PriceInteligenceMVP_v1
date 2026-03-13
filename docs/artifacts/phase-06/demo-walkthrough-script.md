# Phase 06 Demo Walkthrough Script

## Demo Goal
Show an end-to-end competitive pricing decision workflow on static mock data with no backend dependency.

## Pre-Demo Setup
1. Start local host: `python -m http.server 4173`
2. Open: `http://127.0.0.1:4173/index.html#/dashboard`
3. Ensure language starts in Turkish (optional switch to EN during demo)

## Walkthrough
1. **Genel Bakış**
   - Explain KPI cards and critical SKU table.
   - Click `YZ Önerilerine Git`.
2. **YZ Fiyat Önerileri**
   - Show pending suggestions and reason labels.
   - Use `Filtrele` to open risk filter.
   - Select all and run `Seçilenleri Onayla`.
3. **Dinamik Fiyatlandırma**
   - Switch `Manual` / `Auto-Sim`.
   - Run simulation and open `Önizleme`.
   - Apply one candidate, show `Simülasyon` tag on product status.
   - Demonstrate `Geri Al` with confirmation.
4. **A/B Fiyatlandırma Testi**
   - Change range.
   - Run `Yeni Test Başlat`.
   - Export snapshot (`ab-snapshot.json`).
5. **Header Icons**
   - Open `Ayarlar`, switch compact mode and save.
   - Open `Scenario Lab`, load a scenario, and show return to previous route.
6. **Localization**
   - Toggle `TR` -> `EN` and show instant UI text update.

## Demo Disclaimer
- Dynamic pricing behavior is a deterministic mock simulation and not production autopricing.
- All data/state changes are in-browser only.
