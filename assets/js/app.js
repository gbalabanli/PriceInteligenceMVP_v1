(function () {
  const appData = globalThis.PriceSmartMvpData;
  const dynamicPricingData = appData && appData.dynamicPricing
    ? appData.dynamicPricing
    : { strategies: [], assignments: [] };
  const abTestingData = appData && appData.abTesting
    ? appData.abTesting
    : { tests: [] };

  if (!appData || !Array.isArray(appData.trackedProducts) || !Array.isArray(appData.competitorDetails)) {
    throw new Error("PriceSmartMvpData bulunamadı. Önce data.js yüklenmeli.");
  }

  const ROUTES = {
    dashboard: "/dashboard",
    recommendations: "/yz-fiyat-onerileri",
    dynamicPricing: "/dinamik-fiyatlandirma",
    abTesting: "/ab-fiyatlandirma-testi"
  };
  const state = {
    route: ROUTES.dashboard,
    products: clone(appData.trackedProducts),
    competitorDetails: clone(appData.competitorDetails),
    marketPulse: clone(appData.marketPulse),
    dynamicPricing: {
      strategies: clone(dynamicPricingData.strategies),
      assignments: clone(dynamicPricingData.assignments),
      selectedStrategyId: dynamicPricingData.strategies[0] ? dynamicPricingData.strategies[0].id : null,
      targetType: "segment",
      selectedTargetId: "all-products"
    },
    abTesting: {
      tests: clone(abTestingData.tests),
      selectedTestId: abTestingData.tests[0] ? abTestingData.tests[0].id : null,
      selectedRange: "30"
    },
    introModalOpen: true,
    drawer: {
      open: false,
      mode: null,
      productId: null
    }
  };

  const elements = {
    app: document.getElementById("app"),
    drawer: document.getElementById("drawer"),
    drawerBackdrop: document.getElementById("drawer-backdrop"),
    introModalRoot: document.getElementById("intro-modal-root"),
    toast: document.getElementById("toast")
  };

  let toastTimer = null;

  bootstrap();

  function bootstrap() {
    ensureDynamicPricingSelection();
    ensureAbTestingSelection();
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("keydown", handleKeydown);
  }

  function syncRoute() {
    const rawHash = window.location.hash.replace(/^#/, "");
    const normalizedRoute = rawHash.startsWith("/") ? rawHash : `/${rawHash}`;

    if (!Object.values(ROUTES).includes(normalizedRoute)) {
      window.location.hash = `#${ROUTES.dashboard}`;
      state.route = ROUTES.dashboard;
      render();
      return;
    }

    state.route = normalizedRoute;
    render();
  }

  function render() {
    renderSidebarState();
    renderWorkspace();
    renderDrawer();
    renderIntroModal();
  }

  function renderSidebarState() {
    document.querySelectorAll("[data-route]").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.route === state.route);
    });
  }

  function renderWorkspace() {
    if (!elements.app) return;

    if (state.route === ROUTES.recommendations) {
      elements.app.innerHTML = renderRecommendationsPage();
      return;
    }

    if (state.route === ROUTES.dynamicPricing) {
      elements.app.innerHTML = renderDynamicPricingPage();
      return;
    }

    if (state.route === ROUTES.abTesting) {
      elements.app.innerHTML = renderAbTestingPage();
      return;
    }

    const metrics = getMetrics();

    elements.app.innerHTML = `
      <section class="kpi-grid" aria-label="KPI özetleri">
        ${renderKpiCard("Takip Edilen Ürün", String(metrics.trackedCount), `${metrics.actionableProducts} ürün aksiyon bekliyor.`, "is-primary")}
        ${renderKpiCard("Fiyat Nedeniyle Kaçan Gelir", formatMoney(metrics.lostRevenue), "Rakip altına inen ürünlerde görünür kayıp oluşuyor.", "is-danger")}
        ${renderKpiCard("Marj Kaybı Riski", `${metrics.marginRiskCount} ürün`, "Fiyatı gereğinden düşük kalan ürünler marj yakıyor.", "is-warning")}
        ${renderKpiCard("Tahmini Ek Kâr Potansiyeli", formatMoney(metrics.gainPotential), "Doğru fiyat adımları ile toplanabilecek ek potansiyel.", "is-success")}
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Piyasa Nabzı</h2>
            <p class="panel-text">Rakip baskısı, trend yönü ve yapay zeka okuması aynı blokta toplanır. Karar verici ilk bakışta hangi segmentte hareket olduğunu görür.</p>
          </div>
          <span class="panel-chip">Canlı sinyal özeti</span>
        </div>

        <div class="pulse-grid">
          <article class="pulse-cell">
            <p class="pulse-label">Odak konu</p>
            <p class="pulse-value">${escapeHtml(state.marketPulse.trendTopic)}</p>
          </article>
          <article class="pulse-cell">
            <p class="pulse-label">Google Trends yönü</p>
            <p class="pulse-value">${escapeHtml(state.marketPulse.trendDirection)}</p>
          </article>
          <article class="pulse-cell">
            <p class="pulse-label">Rakip baskısı</p>
            <p class="pulse-value">${escapeHtml(state.marketPulse.competitorPressure)}</p>
          </article>
        </div>

        <div class="pulse-summary">
          <span class="pulse-summary__label">YZ içgörüsü</span>
          <p class="pulse-summary__text">${escapeHtml(state.marketPulse.aiSummary)}</p>
        </div>
      </section>

      <section class="table-card">
        <div class="table-card__head">
          <div>
            <h2 class="panel-title">Takip Edilen Ürünler</h2>
            <p class="table-card__hint">Bir ürün satırına tıklayarak rakip URL, fiyat ve trend detayını açın.</p>
          </div>
          <div class="table-card__actions">
            <button class="outline-button" type="button" data-route="${ROUTES.recommendations}">YZ Öneri Sayfası</button>
            <button class="primary-button" type="button" data-open-add-product="1">Ürün Ekle</button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Mevcut Fiyat</th>
                <th>Rakip Durumu</th>
                <th>Trend</th>
                <th>YZ Öneri</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              ${state.products.length ? state.products.map(renderProductRow).join("") : `<tr><td colspan="6" class="empty-state">Henüz takip edilen ürün bulunmuyor.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderRecommendationsPage() {
    const recommendations = getRecommendationRows();
    const highPriorityCount = recommendations.filter((item) => item.priority === "Yüksek").length;

    return `
      <section class="panel">
        <div class="panel-head">
          <div>
            <h1 class="panel-title">YZ Fiyat Önerileri</h1>
            <p class="panel-text">Rakip fiyatı, trend yönü ve mevcut fiyat farkı birlikte okunarak üretilen öneriler burada toplanır.</p>
          </div>
          <span class="panel-chip">${highPriorityCount} yüksek öncelikli öneri</span>
        </div>

        <div class="recommendation-summary">
          <article class="recommendation-summary__card">
            <p class="recommendation-summary__label">Aktif öneri</p>
            <p class="recommendation-summary__value">${recommendations.length}</p>
          </article>
          <article class="recommendation-summary__card">
            <p class="recommendation-summary__label">Bekleyen indirim</p>
            <p class="recommendation-summary__value">${recommendations.filter((item) => item.type === "İndirim").length}</p>
          </article>
          <article class="recommendation-summary__card">
            <p class="recommendation-summary__label">Marj artış fırsatı</p>
            <p class="recommendation-summary__value">${recommendations.filter((item) => item.type === "Artış").length}</p>
          </article>
        </div>
      </section>

      <section class="table-card">
        <div class="table-card__head">
          <div>
            <h2 class="panel-title">Öneri Listesi</h2>
            <p class="table-card__hint">Bu ekran, YZ öneri tabinin ilk iskeletidir. Sonraki adımda onay akışı ve detay paneli eklenebilir.</p>
          </div>
          <button class="secondary-button" type="button" data-route="${ROUTES.dashboard}">Genel Bakışa Dön</button>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Mevcut Fiyat</th>
                <th>Önerilen Fiyat</th>
                <th>Öneri Tipi</th>
                <th>Öncelik</th>
                <th>Gerekçe</th>
              </tr>
            </thead>
            <tbody>
              ${recommendations.map(renderRecommendationRow).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderDynamicPricingPage() {
    const preview = getDynamicPricingPreview();
    const activeAssignments = state.dynamicPricing.assignments;
    const scopeOptions = getDynamicPricingScopes();

    return `
      <section class="panel intent-hero">
        <h1 class="intent-hero__title">Dinamik Fiyatlandırma Paneli</h1>
        <p class="intent-hero__text">Kural yazmayı bırakın. Stratejinizi belirleyin, YZ pazar ritmine göre hareket etsin.</p>
      </section>

      <section class="intent-layout" aria-label="Niyet temelli fiyatlandırma">
        <div class="intent-main">
          <section>
            <div class="intent-step">
              <span class="intent-step__index">1</span>
              <h2 class="intent-step__title">Strateji Seç</h2>
            </div>
            <div class="intent-strategy-grid">
              ${state.dynamicPricing.strategies.map((item) => renderStrategyCard(item, item.id === state.dynamicPricing.selectedStrategyId)).join("")}
            </div>
          </section>

          <section class="panel intent-target-card">
            <div class="intent-step">
              <span class="intent-step__index">2</span>
              <h2 class="intent-step__title">Hedef Kitleyi Belirle</h2>
            </div>
            <select class="intent-select" data-target-scope aria-label="Hedef kitle seçimi">
              ${scopeOptions.map((item) => renderScopeOption(item)).join("")}
            </select>
          </section>
        </div>

        <aside class="intent-side">
          <section class="intent-ai-card">
            <div class="intent-ai-card__head">
              <span class="intent-ai-dot" aria-hidden="true"></span>
              <p class="intent-ai-card__title">YZ Öngörü Özeti</p>
            </div>
            <p class="intent-ai-card__quote">"${escapeHtml(preview.aiQuote)}"</p>
            <div class="intent-ai-metrics">
              <div class="intent-ai-metric">
                <span>İşlenecek Sinyaller</span>
                <strong>${escapeHtml(preview.signals)}</strong>
              </div>
              <div class="intent-ai-metric">
                <span>Beklenen Etki</span>
                <strong>${escapeHtml(preview.expectedImpact)}</strong>
              </div>
              <div class="intent-ai-metric">
                <span>Hedef Kitle</span>
                <strong>${escapeHtml(preview.targetLabel)}</strong>
              </div>
            </div>
          </section>

          <section class="panel intent-guard-card">
            <h3 class="intent-guard-card__title">Güvenlik Duvarı</h3>
            <div class="intent-guard-list">
              <div class="intent-guard-item">
                <span>Min. Kâr Marjı</span>
                <strong>%15</strong>
              </div>
              <div class="intent-guard-item">
                <span>Tavan Fiyat Kilidi</span>
                <strong>Açık</strong>
              </div>
              <button class="primary-button" type="button" data-apply-strategy="1" ${preview.canApply ? "" : "disabled"}>Stratejiyi Başlat</button>
            </div>
          </section>
        </aside>
      </section>

      <section class="table-card intent-table">
        <div class="table-card__head">
          <div>
            <h2 class="panel-title">Aktif Stratejiler</h2>
            <p class="table-card__hint">Canlı çalışan stratejileri tek listede izleyebilir, duraklatıp yeniden başlatabilirsiniz.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Hedef Kitle</th>
                <th>Strateji</th>
                <th>Durum</th>
                <th>Performans</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              ${activeAssignments.length ? activeAssignments.map(renderDynamicAssignmentRow).join("") : `<tr><td colspan="5" class="empty-state">Henüz aktif strateji ataması bulunmuyor.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderAbTestingPage() {
    const test = getSelectedAbTest();

    if (!test) {
      return `
        <section class="panel">
          <h1 class="panel-title">A/B Fiyatlandırma Testi</h1>
          <p class="panel-text">Gösterilecek test bulunamadı.</p>
        </section>
      `;
    }

    const decision = getAbDecision(test);
    const rows = getAbComparisonRows(test);
    const snapshot = getAbLiveSnapshot(test);

    return `
      <section class="panel ab-hero">
        <div>
          <h1 class="ab-hero__title">A/B Fiyatlandırma Testi</h1>
          <p class="ab-hero__text">Test kur, sonucu canlı izle ve tek ekrandan kararı yayına al.</p>
        </div>
        <div class="ab-hero__controls">
          <label class="ab-control">
            <span>Aktif Test</span>
            <select data-ab-test-select>
              ${state.abTesting.tests.map((item) => {
                const selected = item.id === state.abTesting.selectedTestId ? "selected" : "";
                return `<option value="${escapeAttribute(item.id)}" ${selected}>${escapeHtml(item.name)}</option>`;
              }).join("")}
            </select>
          </label>
          <label class="ab-control">
            <span>Tarih Aralığı</span>
            <select data-ab-range>
              <option value="7" ${state.abTesting.selectedRange === "7" ? "selected" : ""}>Son 7 Gün</option>
              <option value="30" ${state.abTesting.selectedRange === "30" ? "selected" : ""}>Son 30 Gün</option>
              <option value="90" ${state.abTesting.selectedRange === "90" ? "selected" : ""}>Son 90 Gün</option>
            </select>
          </label>
        </div>
      </section>

      <section class="ab-layout">
        <div class="ab-main">
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">${escapeHtml(test.name)}</h2>
                <p class="panel-text">Hedef: ${escapeHtml(test.targetLabel)} • KPI: ${escapeHtml(test.targetKpi)} • Trafik dağılımı: ${escapeHtml(test.trafficSplit)}</p>
              </div>
              <div class="ab-state-row">
                <span class="ab-state-chip ${getAbStatusClass(test.status)}">${escapeHtml(test.status)}</span>
                <span class="ab-state-chip is-soft">Güven: %${test.significance}</span>
              </div>
            </div>

            <div class="ab-kpi-grid">
              <article class="ab-kpi-card">
                <p>Dönüşüm Oranı</p>
                <strong>${formatPercent(snapshot.conversionRate)}</strong>
              </article>
              <article class="ab-kpi-card">
                <p>Ziyaretçi Başı Gelir</p>
                <strong>${formatMoney(snapshot.bestRpv)}</strong>
              </article>
              <article class="ab-kpi-card">
                <p>Marj Katkısı</p>
                <strong>${formatMoney(snapshot.marginContribution)}</strong>
              </article>
              <article class="ab-kpi-card">
                <p>Toplam Oturum</p>
                <strong>${new Intl.NumberFormat("tr-TR").format(snapshot.totalSessions)}</strong>
              </article>
            </div>
          </section>

          <section class="panel ab-decision ${decision.tone}">
            <p class="ab-decision__eyebrow">Karar Çubuğu</p>
            <h3 class="ab-decision__title">${escapeHtml(decision.title)}</h3>
            <p class="ab-decision__text">${escapeHtml(decision.reason)}</p>
            <div class="ab-action-row">
              <button class="primary-button" type="button" data-ab-action="toggle-run">${test.status === "Çalışıyor" ? "Testi Durdur" : "Testi Başlat"}</button>
              <button class="outline-button" type="button" data-ab-action="apply-winner" ${decision.canApply ? "" : "disabled"}>Kazananı Yayına Al</button>
              <button class="ghost-button" type="button" data-ab-action="clone-test">Yeni Test Klonla</button>
              <button class="ghost-button" type="button" data-ab-action="reset-range">Aralığı Sıfırla</button>
            </div>
          </section>

          <section class="table-card ab-table">
            <div class="table-card__head">
              <div>
                <h2 class="panel-title">Varyant Karşılaştırması</h2>
                <p class="table-card__hint">Kontrol ve varyantlar için uplift, marj ve güven etkisi tek tabloda.</p>
              </div>
            </div>
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Varyant</th>
                    <th>Fiyat</th>
                    <th>Trafik</th>
                    <th>Dönüşüm</th>
                    <th>ZBG</th>
                    <th>Uplift</th>
                    <th>Marj</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row) => renderAbVariantRow(row, decision.winnerId)).join("")}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside class="ab-side">
          <section class="panel ab-guardrails">
            <h3 class="ab-side__title">Guardrails</h3>
            <div class="ab-side-list">
              <div><span>Min. Marj</span><strong>%${test.guardrails.minMarginRate}</strong></div>
              <div><span>Maks. Fiyat Değişimi</span><strong>%${test.guardrails.maxPriceChange}</strong></div>
              <div><span>Min. Stok</span><strong>${test.guardrails.minStock}</strong></div>
              <div><span>Otomatik Durdurma</span><strong>${test.guardrails.autoStop ? "Açık" : "Kapalı"}</strong></div>
            </div>
          </section>

          <section class="panel ab-alerts">
            <h3 class="ab-side__title">Uyarılar</h3>
            <div class="ab-alert-list">
              ${test.alerts.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
            </div>
          </section>
        </aside>
      </section>

      <section class="table-card">
        <div class="table-card__head">
          <div>
            <h2 class="panel-title">Test Geçmişi</h2>
            <p class="table-card__hint">A/B testlerinin son durumunu tek listede takip edebilirsiniz.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Hedef</th>
                <th>Durum</th>
                <th>Güven</th>
              </tr>
            </thead>
            <tbody>
              ${state.abTesting.tests.map((item) => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td>${escapeHtml(item.targetLabel)}</td>
                  <td><span class="ab-state-chip ${getAbStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
                  <td>%${item.significance}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderKpiCard(label, value, note, modifier) {
    return `
      <article class="kpi-card ${modifier}">
        <p class="kpi-label">${escapeHtml(label)}</p>
        <p class="kpi-value">${escapeHtml(value)}</p>
        <p class="kpi-note">${escapeHtml(note)}</p>
      </article>
    `;
  }

  function renderProductRow(product) {
    return `
      <tr class="product-row" tabindex="0" data-product-row="${escapeHtml(product.id)}" aria-label="${escapeHtml(product.name)} detaylarını aç">
        <td>
          <p class="product-name">${escapeHtml(product.name)}</p>
          <div class="product-meta">
            <span class="muted-chip">${escapeHtml(product.sku)}</span>
            <span class="muted-chip">${escapeHtml(product.category)}</span>
            <span class="muted-chip">${product.competitorCount} rakip</span>
          </div>
        </td>
        <td>${formatMoney(product.currentPrice)}</td>
        <td>${escapeHtml(product.competitorStatus)}</td>
        <td><span class="trend-chip ${getTrendClass(product.trendDirection)}">${escapeHtml(product.trendDirection)}</span></td>
        <td><p class="ai-note"><strong>YZ:</strong> ${escapeHtml(product.aiSuggestionText)}</p></td>
        <td><span class="status-chip ${getStatusClass(product.status)}">${escapeHtml(product.status)}</span></td>
      </tr>
    `;
  }

  function renderRecommendationRow(item) {
    return `
      <tr>
        <td>
          <p class="product-name">${escapeHtml(item.name)}</p>
          <div class="product-meta">
            <span class="muted-chip">${escapeHtml(item.sku)}</span>
            <span class="muted-chip">${escapeHtml(item.category)}</span>
          </div>
        </td>
        <td>${formatMoney(item.currentPrice)}</td>
        <td>${formatMoney(item.suggestedPrice)}</td>
        <td><span class="recommendation-type ${item.type === "İndirim" ? "is-discount" : item.type === "Artış" ? "is-increase" : "is-keep"}">${escapeHtml(item.type)}</span></td>
        <td><span class="recommendation-priority ${item.priority === "Yüksek" ? "is-high" : "is-medium"}">${escapeHtml(item.priority)}</span></td>
        <td><p class="ai-note">${escapeHtml(item.reason)}</p></td>
      </tr>
    `;
  }

  function renderStrategyCard(strategy, isSelected) {
    const strategyIcon = getStrategyIcon(strategy.id);
    const strategyTone = getStrategyTone(strategy.id);

    return `
      <button class="intent-strategy-card ${isSelected ? "is-selected" : ""}" type="button" data-select-strategy="${escapeAttribute(strategy.id)}" aria-pressed="${isSelected ? "true" : "false"}">
        <div class="strategy-card__top">
          <span class="intent-strategy-card__icon intent-strategy-card__icon--${strategyTone}" aria-hidden="true">${strategyIcon}</span>
          <div>
            <p class="intent-strategy-card__title">${escapeHtml(strategy.name)}</p>
            <p class="intent-strategy-card__summary">${escapeHtml(strategy.summary)}</p>
          </div>
          ${strategy.id === "balanced-auto" ? `<span class="intent-tag intent-tag--recommended">Önerilen</span>` : ""}
        </div>
        <div class="intent-strategy-card__meta">
          <span>Risk: <strong class="strategy-risk strategy-risk--${getRiskClass(strategy.riskLevel)}">${escapeHtml(strategy.riskLevel)}</strong></span>
          <span class="intent-strategy-card__goal">${escapeHtml(strategy.businessGoal)}</span>
        </div>
      </button>
    `;
  }

  function renderScopeOption(option) {
    const optionValue = getDynamicScopeValue(option.type, option.id);
    const selectedValue = getDynamicScopeValue(state.dynamicPricing.targetType, state.dynamicPricing.selectedTargetId);
    const selectedAttr = optionValue === selectedValue ? "selected" : "";
    return `<option value="${escapeAttribute(optionValue)}" ${selectedAttr}>${escapeHtml(option.label)}</option>`;
  }

  function renderDynamicAssignmentRow(item) {
    const strategy = getStrategyById(item.strategyId);
    const isActive = item.status === "Aktif";
    const toggleLabel = isActive ? "Durdur" : "Başlat";

    return `
      <tr>
        <td class="intent-cell-target">${escapeHtml(item.targetLabel)}</td>
        <td><span class="intent-pill intent-pill--${getStrategyTone(item.strategyId)}">${escapeHtml(strategy ? strategy.name : "-")}</span></td>
        <td><span class="assignment-state ${isActive ? "is-active" : "is-paused"}">${escapeHtml(item.status)}</span></td>
        <td class="intent-cell-performance">${escapeHtml(item.performance)}</td>
        <td>
          <div class="intent-action-row">
            <button class="ghost-button" type="button" data-toggle-assignment="${escapeAttribute(item.id)}">${toggleLabel}</button>
            <button class="ghost-button is-danger" type="button" data-remove-assignment="${escapeAttribute(item.id)}">Kaldır</button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderAbVariantRow(row, winnerId) {
    const isWinner = winnerId && row.id === winnerId;
    return `
      <tr class="${isWinner ? "ab-row-winner" : ""}">
        <td>
          <span class="ab-variant-label">${escapeHtml(row.label)}</span>
          ${row.id === "control" ? `<span class="muted-chip">Kontrol</span>` : ""}
          ${isWinner ? `<span class="ab-winner-badge">Kazanan</span>` : ""}
        </td>
        <td>${formatMoney(row.price)}</td>
        <td>${formatPercent(row.trafficShare)}</td>
        <td>${formatPercent(row.conversionRate)}</td>
        <td>${formatMoney(row.rpv)}</td>
        <td class="${row.uplift > 0 ? "ab-uplift-up" : row.uplift < 0 ? "ab-uplift-down" : ""}">${row.id === "control" ? "-" : `${row.uplift > 0 ? "+" : ""}${formatPercent(row.uplift)}`}</td>
        <td>${formatPercent(row.marginRate)}</td>
      </tr>
    `;
  }

  function renderDrawer() {
    if (!elements.drawer || !elements.drawerBackdrop) return;

    if (!state.drawer.open) {
      elements.drawer.classList.add("hidden");
      elements.drawerBackdrop.classList.add("hidden");
      elements.drawer.setAttribute("aria-hidden", "true");
      elements.drawer.innerHTML = "";
      syncOverlayState();
      return;
    }

    elements.drawer.classList.remove("hidden");
    elements.drawerBackdrop.classList.remove("hidden");
    elements.drawer.setAttribute("aria-hidden", "false");
    elements.drawer.innerHTML = state.drawer.mode === "add"
      ? renderAddProductDrawer()
      : renderProductDetailDrawer();
    syncOverlayState();
  }

  function renderIntroModal() {
    if (!elements.introModalRoot) return;

    if (!state.introModalOpen) {
      elements.introModalRoot.innerHTML = "";
      syncOverlayState();
      return;
    }

    const metrics = getMetrics();
    elements.introModalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-intro="1">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="intro-modal-title">
          <div class="modal-hero">
            <div class="modal-copy">
              <p class="modal-eyebrow">Değer Katıyoruz</p>
              <h2 id="intro-modal-title" class="modal-title">Doğru ürün, doğru fiyat ile doğru zamanda görünmediğinde potansiyel gelir sessizce kaybolur.</h2>
              <p class="modal-text">
                E-ticaret ekipleri ne zaman hangi fiyatta hangi ürünü satacağını net olarak bilemediğinde ya satış kaçırıyor ya da gereksiz marj kaybı yaşıyor.
                PriceSmart AI, rakip ürün bilgilerini ve Google Trends sinyallerini tek akışta toplayıp hangi ürünün aksiyon istediğini ilk bakışta görünür hale getirir.
              </p>
            </div>

            <aside class="modal-highlight" aria-label="Hızlı özet">
              <p class="modal-highlight__eyebrow">Hızlı Özet</p>
              <p class="modal-highlight__value">${formatMoney(metrics.gainPotential)}</p>
              <p class="modal-highlight__text">Bugün görünür hale gelen tahmini ek kâr potansiyeli.</p>
              <div class="modal-highlight__stack">
                <div class="modal-highlight__row">
                  <span>Aksiyon isteyen ürün</span>
                  <strong>${metrics.actionableProducts}</strong>
                </div>
                <div class="modal-highlight__row">
                  <span>Takip edilen rakip</span>
                  <strong>${metrics.totalCompetitors}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div class="modal-grid" aria-label="Öne çıkan sinyaller">
            <article class="modal-metric">
              <p class="modal-metric__label">Takip edilen ürün</p>
              <p class="modal-metric__value">${metrics.trackedCount} ürün aktif olarak izleniyor.</p>
            </article>
            <article class="modal-metric">
              <p class="modal-metric__label">Fiyat baskısı</p>
              <p class="modal-metric__value">${formatMoney(metrics.lostRevenue)} görünür gelir kaybı işareti var.</p>
            </article>
            <article class="modal-metric">
              <p class="modal-metric__label">Trend + YZ</p>
              <p class="modal-metric__value">${escapeHtml(state.marketPulse.trendDirection)} sinyali ve YZ içgörüsü aynı ekranda.</p>
            </article>
          </div>

          <div class="modal-actions">
            <button class="secondary-button" type="button" data-close-intro="1">Devam Et</button>
            <button class="primary-button" type="button" data-intro-add-product="1">Ürün Ekle ile Başla</button>
          </div>
        </section>
      </div>
    `;
    syncOverlayState();
  }

  function renderAddProductDrawer() {
    return `
      <div class="drawer-panel">
        <div class="drawer-head">
          <div>
            <h2 class="drawer-title">Ürün Ekle</h2>
            <p class="drawer-text">Takip akışına yeni ürün ekleyin. İlk iterasyonda yalnızca ürün adı, SKU ve kategori bilgisi alınır.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Kapat" data-drawer-close="1">×</button>
        </div>

        <form id="add-product-form" class="form-grid">
          <div class="field">
            <label for="product-name">Ürün Adı</label>
            <input id="product-name" name="name" type="text" placeholder="Örn. Bluetooth Hoparlör Mini" autocomplete="off">
          </div>
          <div class="field">
            <label for="product-sku">SKU</label>
            <input id="product-sku" name="sku" type="text" placeholder="Örn. SKU-7788" autocomplete="off">
          </div>
          <div class="field">
            <label for="product-category">Kategori</label>
            <input id="product-category" name="category" type="text" placeholder="Örn. Ses Sistemleri" autocomplete="off">
          </div>

          <p class="helper-text">Kayıt sonrası ürün tabloya eklenir ve varsayılan olarak <strong>Kurulum Bekliyor</strong> durumunda izlemeye alınır.</p>

          <div class="drawer-actions">
            <button class="secondary-button" type="button" data-drawer-close="1">Vazgeç</button>
            <button class="primary-button" type="submit">Kaydet ve Ekle</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderProductDetailDrawer() {
    const product = getProductById(state.drawer.productId);
    if (!product) {
      closeDrawer();
      return "";
    }

    const competitors = getCompetitorsByProductId(product.id);

    return `
      <div class="drawer-panel">
        <div class="drawer-head">
          <div>
            <h2 class="drawer-title">${escapeHtml(product.name)}</h2>
            <p class="drawer-text">Rakip fiyatları, trend özeti ve son güncelleme zamanı bu panelde bir araya gelir.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Kapat" data-drawer-close="1">×</button>
        </div>

        <section class="meta-grid">
          <article class="meta-card">
            <p class="meta-card__label">SKU</p>
            <p class="meta-card__value">${escapeHtml(product.sku)}</p>
          </article>
          <article class="meta-card">
            <p class="meta-card__label">Kategori</p>
            <p class="meta-card__value">${escapeHtml(product.category)}</p>
          </article>
          <article class="meta-card">
            <p class="meta-card__label">Mevcut fiyat</p>
            <p class="meta-card__value">${formatMoney(product.currentPrice)}</p>
          </article>
          <article class="meta-card">
            <p class="meta-card__label">Durum</p>
            <p class="meta-card__value"><span class="status-chip ${getStatusClass(product.status)}">${escapeHtml(product.status)}</span></p>
          </article>
        </section>

        <div class="section-stack">
          <section class="section-card">
            <h3>Trend özeti</h3>
            <p>${escapeHtml(product.trendSummary)}</p>
            <p class="helper-text">Son güncelleme: ${escapeHtml(product.updatedAt)}</p>
          </section>

          <section class="section-card">
            <h3>YZ öneri notu</h3>
            <p>${escapeHtml(product.aiSuggestionText)}</p>
          </section>

          <section class="section-card">
            <h3>Rakip detayları</h3>
            <table class="competitor-table">
              <thead>
                <tr>
                  <th>Ad / Domain</th>
                  <th>URL</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${competitors.map(renderCompetitorRow).join("")}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    `;
  }

  function renderCompetitorRow(item) {
    const isUrl = /^https?:\/\//.test(item.url);
    const urlCell = isUrl
      ? `<a href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>`
      : `<span>${escapeHtml(item.url)}</span>`;

    return `
      <tr>
        <td>${escapeHtml(item.sourceName)}</td>
        <td>${urlCell}</td>
        <td>${Number.isFinite(item.price) ? formatMoney(item.price) : "-"}</td>
      </tr>
    `;
  }

  function handleClick(event) {
    if (event.target === elements.drawerBackdrop) {
      closeDrawer();
      return;
    }

    if (event.target.matches("[data-close-intro]")) {
      closeIntroModal();
      return;
    }

    if (event.target.closest("[data-intro-add-product]")) {
      closeIntroModal();
      openAddDrawer();
      return;
    }

    const addTrigger = event.target.closest("[data-open-add-product]");
    if (addTrigger) {
      openAddDrawer();
      return;
    }

    const closeTrigger = event.target.closest("[data-drawer-close]");
    if (closeTrigger) {
      closeDrawer();
      return;
    }

    const strategyTrigger = event.target.closest("[data-select-strategy]");
    if (strategyTrigger) {
      state.dynamicPricing.selectedStrategyId = strategyTrigger.dataset.selectStrategy;
      renderWorkspace();
      return;
    }

    if (event.target.closest("[data-apply-strategy]")) {
      applyDynamicPricingStrategy();
      return;
    }

    const toggleAssignmentTrigger = event.target.closest("[data-toggle-assignment]");
    if (toggleAssignmentTrigger) {
      toggleDynamicPricingAssignment(toggleAssignmentTrigger.dataset.toggleAssignment);
      return;
    }

    const removeAssignmentTrigger = event.target.closest("[data-remove-assignment]");
    if (removeAssignmentTrigger) {
      removeDynamicPricingAssignment(removeAssignmentTrigger.dataset.removeAssignment);
      return;
    }

    const abActionTrigger = event.target.closest("[data-ab-action]");
    if (abActionTrigger) {
      const action = abActionTrigger.dataset.abAction;
      if (action === "toggle-run") {
        toggleAbTestStatus();
      } else if (action === "apply-winner") {
        applyAbWinner();
      } else if (action === "clone-test") {
        cloneAbTest();
      } else if (action === "reset-range") {
        state.abTesting.selectedRange = "30";
        renderWorkspace();
        showToast("Tarih aralığı varsayılana döndü.");
      }
      return;
    }

    const routeTrigger = event.target.closest("[data-route]");
    if (routeTrigger) {
      window.location.hash = `#${routeTrigger.dataset.route}`;
      return;
    }

    const row = event.target.closest("[data-product-row]");
    if (row && !event.target.closest("a, button, input, label")) {
      openDetailDrawer(row.dataset.productRow);
    }
  }

  function handleSubmit(event) {
    if (event.target.id !== "add-product-form") return;

    event.preventDefault();
    const formData = new FormData(event.target);
    const name = String(formData.get("name") || "").trim();
    const sku = String(formData.get("sku") || "").trim();
    const category = String(formData.get("category") || "").trim();

    if (!name || !sku || !category) {
      showToast("Ürün eklemek için üç alanın da doldurulması gerekiyor.");
      return;
    }

    const newProductId = `p-${Date.now()}`;
    const seedPrice = getSeedPrice(category);
    const placeholderCompetitors = [
      {
        id: `c-${newProductId}-1`,
        productId: newProductId,
        sourceName: "Rakip feed 1 / bekleniyor",
        url: "Bağlantı kurulacak",
        price: null
      },
      {
        id: `c-${newProductId}-2`,
        productId: newProductId,
        sourceName: "Rakip feed 2 / bekleniyor",
        url: "Bağlantı kurulacak",
        price: null
      }
    ];

    state.products.unshift({
      id: newProductId,
      name,
      sku,
      category,
      currentPrice: seedPrice,
      competitorStatus: "Rakip verisi bağlanacak",
      trendDirection: "İlk veri bekleniyor",
      aiSuggestionText: "Kurulum tamamlandığında ilk öneri üretilecek.",
      status: "Kurulum Bekliyor",
      competitorCount: placeholderCompetitors.length,
      estimatedLostRevenue: 0,
      estimatedProfitUplift: 0,
      trendSummary: "Google Trends eşleşmesi ve rakip bağlantıları kurulum sonrasında akacaktır.",
      updatedAt: "Az önce"
    });

    state.competitorDetails = [...placeholderCompetitors, ...state.competitorDetails];
    closeDrawer();
    render();
    showToast("Ürün eklendi. İzleme kurulumu bekleniyor.");
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      if (state.drawer.open) {
        closeDrawer();
        return;
      }
      if (state.introModalOpen) {
        closeIntroModal();
        return;
      }
    }

    const row = event.target.closest ? event.target.closest("[data-product-row]") : null;
    if (row && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openDetailDrawer(row.dataset.productRow);
    }
  }

  function handleChange(event) {
    if (event.target.matches("[data-target-scope]")) {
      const scopeValue = String(event.target.value || "");
      const parsedScope = parseDynamicScopeValue(scopeValue);

      if (!parsedScope) return;

      state.dynamicPricing.targetType = parsedScope.type;
      state.dynamicPricing.selectedTargetId = parsedScope.id;
      renderWorkspace();
      return;
    }

    if (event.target.matches("[data-ab-test-select]")) {
      state.abTesting.selectedTestId = String(event.target.value || "");
      renderWorkspace();
      return;
    }

    if (event.target.matches("[data-ab-range]")) {
      state.abTesting.selectedRange = String(event.target.value || "30");
      renderWorkspace();
    }
  }

  function openAddDrawer() {
    state.drawer.open = true;
    state.drawer.mode = "add";
    state.drawer.productId = null;
    renderDrawer();
  }

  function openDetailDrawer(productId) {
    state.drawer.open = true;
    state.drawer.mode = "detail";
    state.drawer.productId = productId;
    renderDrawer();
  }

  function closeDrawer() {
    state.drawer.open = false;
    state.drawer.mode = null;
    state.drawer.productId = null;
    renderDrawer();
  }

  function closeIntroModal() {
    state.introModalOpen = false;
    renderIntroModal();
  }

  function syncOverlayState() {
    document.body.classList.toggle("drawer-open", state.drawer.open);
    document.body.classList.toggle("overlay-open", state.drawer.open || state.introModalOpen);
  }

  function getMetrics() {
    const lostRevenue = state.products.reduce((sum, item) => sum + item.estimatedLostRevenue, 0);
    const gainPotential = state.products.reduce((sum, item) => sum + item.estimatedProfitUplift, 0);
    const marginRiskCount = state.products.filter((item) => item.status === "Marj Riski").length;
    const actionableProducts = state.products.filter((item) => item.status !== "Dengede").length;
    const totalCompetitors = state.products.reduce((sum, item) => sum + item.competitorCount, 0);

    return {
      trackedCount: state.products.length,
      lostRevenue,
      marginRiskCount,
      gainPotential,
      actionableProducts,
      totalCompetitors
    };
  }

  function getProductById(productId) {
    return state.products.find((item) => item.id === productId) || null;
  }

  function getCompetitorsByProductId(productId) {
    return state.competitorDetails.filter((item) => item.productId === productId);
  }

  function getSeedPrice(category) {
    const normalized = category.toLocaleLowerCase("tr-TR");

    if (normalized.includes("saat")) return 3499;
    if (normalized.includes("kulak") || normalized.includes("ses")) return 1299;
    if (normalized.includes("bilgisayar") || normalized.includes("hub")) return 649;
    if (normalized.includes("oyun") || normalized.includes("aksesuar")) return 899;
    return 999;
  }

  function getRecommendationRows() {
    return state.products
      .filter((product) => product.status !== "Kurulum Bekliyor")
      .map((product) => {
        const isPriceRisk = product.status === "Fiyat Riski";
        const isMarginRisk = product.status === "Marj Riski";
        const suggestedPrice = isPriceRisk
          ? Math.max(1, product.currentPrice - getRecommendedDiscount(product.currentPrice))
          : isMarginRisk
            ? product.currentPrice + 99
            : product.currentPrice;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          currentPrice: product.currentPrice,
          suggestedPrice,
          type: isPriceRisk ? "İndirim" : isMarginRisk ? "Artış" : "Koruma",
          priority: product.status === "Dengede" ? "Orta" : "Yüksek",
          reason: product.aiSuggestionText
        };
      });
  }

  function ensureAbTestingSelection() {
    if (!state.abTesting.tests.length) {
      state.abTesting.selectedTestId = null;
      state.abTesting.selectedRange = "30";
      return;
    }

    if (!state.abTesting.tests.some((item) => item.id === state.abTesting.selectedTestId)) {
      state.abTesting.selectedTestId = state.abTesting.tests[0].id;
    }
  }

  function getSelectedAbTest() {
    return state.abTesting.tests.find((item) => item.id === state.abTesting.selectedTestId) || null;
  }

  function getAbComparisonRows(test) {
    if (!test || !Array.isArray(test.variants) || !test.variants.length) return [];

    const totalSessions = test.variants.reduce((sum, item) => sum + item.sessions, 0);
    const control = test.variants.find((item) => item.id === "control") || test.variants[0];
    const controlRpv = control.sessions > 0 ? control.revenue / control.sessions : 0;

    return test.variants.map((item) => {
      const conversionRate = item.sessions > 0 ? item.orders / item.sessions : 0;
      const rpv = item.sessions > 0 ? item.revenue / item.sessions : 0;
      const uplift = controlRpv > 0 ? (rpv - controlRpv) / controlRpv : 0;
      return {
        id: item.id,
        label: item.label,
        price: item.price,
        trafficShare: totalSessions > 0 ? item.sessions / totalSessions : 0,
        conversionRate,
        rpv,
        uplift,
        marginRate: item.marginRate
      };
    });
  }

  function getAbLiveSnapshot(test) {
    const rows = getAbComparisonRows(test);
    const totalSessions = test.variants.reduce((sum, item) => sum + item.sessions, 0);
    const totalOrders = test.variants.reduce((sum, item) => sum + item.orders, 0);
    const totalMargin = test.variants.reduce((sum, item) => sum + (item.revenue * item.marginRate), 0);
    const bestRpv = rows.reduce((best, item) => Math.max(best, item.rpv), 0);

    return {
      totalSessions,
      conversionRate: totalSessions > 0 ? totalOrders / totalSessions : 0,
      bestRpv,
      marginContribution: totalMargin
    };
  }

  function getAbDecision(test) {
    const rows = getAbComparisonRows(test);
    const control = rows.find((item) => item.id === "control") || null;
    const candidates = rows
      .filter((item) => item.id !== "control")
      .filter((item) => item.marginRate * 100 >= test.guardrails.minMarginRate)
      .sort((a, b) => b.uplift - a.uplift);

    const winner = candidates[0] || null;

    if (test.status === "Durduruldu") {
      return {
        tone: "is-neutral",
        title: "Test durduruldu, karar bekliyor",
        reason: "Test tekrar başlatılmadan otomatik öneri verilmez. Mevcut sonuçları değerlendirebilirsiniz.",
        winnerId: null,
        canApply: false
      };
    }

    if (test.status === "Tamamlandı" && test.appliedWinnerId) {
      const applied = rows.find((item) => item.id === test.appliedWinnerId);
      return {
        tone: "is-positive",
        title: `${applied ? applied.label : "Kazanan varyant"} yayına alındı`,
        reason: `Test sonucu uygulandı. Güven seviyesi %${test.significance} olarak kaydedildi.`,
        winnerId: test.appliedWinnerId,
        canApply: false
      };
    }

    if (test.significance < 90) {
      return {
        tone: "is-warning",
        title: "Testi sürdür",
        reason: `Güven seviyesi %${test.significance}. Karar için önerilen eşik %90.`,
        winnerId: null,
        canApply: false
      };
    }

    if (!winner || !control || winner.uplift <= 0) {
      return {
        tone: "is-neutral",
        title: "Kontrol varyantını koru",
        reason: "Varyantlar kontrol fiyatını anlamlı şekilde geçemedi. Testi yeni senaryoyla tekrar kurabilirsiniz.",
        winnerId: control ? control.id : null,
        canApply: false
      };
    }

    return {
      tone: "is-positive",
      title: `${winner.label} varyantını yayına al`,
      reason: `${winner.label}, kontrol varyantına göre ${formatPercent(winner.uplift)} daha yüksek ziyaretçi başı gelir üretti. Güven: %${test.significance}.`,
      winnerId: winner.id,
      canApply: true
    };
  }

  function toggleAbTestStatus() {
    const test = getSelectedAbTest();
    if (!test) return;

    if (test.status === "Çalışıyor") {
      test.status = "Durduruldu";
      test.alerts = ["Test manuel olarak durduruldu. Karar öncesi son metrikleri doğrulayın.", ...test.alerts].slice(0, 3);
      showToast("A/B testi durduruldu.");
    } else {
      test.status = "Çalışıyor";
      if (test.significance < 90) {
        test.significance = Math.min(99, test.significance + 3);
      }
      test.alerts = ["Test yeniden başlatıldı. Yeni örneklem akışı izleniyor.", ...test.alerts].slice(0, 3);
      showToast("A/B testi başlatıldı.");
    }

    renderWorkspace();
  }

  function applyAbWinner() {
    const test = getSelectedAbTest();
    if (!test) return;

    const decision = getAbDecision(test);
    if (!decision.canApply || !decision.winnerId) {
      showToast("Yayına alınabilir bir kazanan yok.");
      return;
    }

    test.status = "Tamamlandı";
    test.appliedWinnerId = decision.winnerId;
    test.alerts = ["Kazanan varyant üretime alındı. Performans izleme moduna geçildi.", ...test.alerts].slice(0, 3);
    showToast("Kazanan varyant yayına alındı.");
    renderWorkspace();
  }

  function cloneAbTest() {
    const test = getSelectedAbTest();
    if (!test) return;

    const cloned = clone(test);
    cloned.id = `ab-${Date.now()}`;
    cloned.name = `${test.name} (Klon)`;
    cloned.status = "Durduruldu";
    cloned.significance = 0;
    cloned.appliedWinnerId = null;
    cloned.alerts = ["Klon test hazır. Parametreleri kontrol edip başlatın."];
    cloned.variants = cloned.variants.map((item) => ({
      ...item,
      sessions: 0,
      orders: 0,
      revenue: 0
    }));

    state.abTesting.tests.unshift(cloned);
    state.abTesting.selectedTestId = cloned.id;
    renderWorkspace();
    showToast("Yeni A/B test klonu oluşturuldu.");
  }

  function ensureDynamicPricingSelection() {
    if (!state.dynamicPricing.strategies.length) {
      state.dynamicPricing.selectedStrategyId = null;
      state.dynamicPricing.targetType = "segment";
      state.dynamicPricing.selectedTargetId = null;
      return;
    }

    if (!getStrategyById(state.dynamicPricing.selectedStrategyId)) {
      state.dynamicPricing.selectedStrategyId = state.dynamicPricing.strategies[0].id;
    }

    const scopes = getDynamicPricingScopes();
    const hasValidScope = scopes.some((item) => {
      return item.type === state.dynamicPricing.targetType && item.id === state.dynamicPricing.selectedTargetId;
    });

    if (!hasValidScope) {
      state.dynamicPricing.targetType = scopes[0] ? scopes[0].type : "segment";
      state.dynamicPricing.selectedTargetId = scopes[0] ? scopes[0].id : null;
    }
  }

  function getDynamicPricingScopes() {
    return [
      { type: "segment", id: "all-products", label: "Tüm Ürünler" },
      { type: "segment", id: "electronics", label: "Elektronik Kategorisi" },
      { type: "segment", id: "apple", label: "Apple Markalı Ürünler" },
      { type: "segment", id: "slow-sellers", label: "Filtrelenmiş Koleksiyon: \"Yavaş Satanlar\"" }
    ];
  }

  function getDynamicScopeValue(type, id) {
    return `${type}:${id}`;
  }

  function parseDynamicScopeValue(rawValue) {
    const separatorIndex = rawValue.indexOf(":");
    if (separatorIndex <= 0) return null;

    const type = rawValue.slice(0, separatorIndex);
    const id = rawValue.slice(separatorIndex + 1);
    if (!type || !id) return null;

    return { type, id };
  }

  function getProductsForTarget(targetType, targetId) {
    if (!targetId) return [];

    if (targetType === "product") {
      return state.products.filter((item) => item.id === targetId);
    }

    if (targetType === "category") {
      return state.products.filter((item) => item.category === targetId);
    }

    if (targetType === "segment") {
      if (targetId === "all-products") {
        return state.products;
      }
      if (targetId === "electronics") {
        const allowedCategories = new Set(["Ses Sistemleri", "Giyilebilir Teknoloji", "Oyuncu Aksesuarı", "Bilgisayar Aksesuarı"]);
        return state.products.filter((item) => allowedCategories.has(item.category));
      }
      if (targetId === "apple") {
        const appleProducts = state.products.filter((item) => /apple|iphone|ipad|mac|watch/i.test(item.name));
        if (appleProducts.length) return appleProducts;
        const premiumFallback = state.products.find((item) => item.id === "p-102");
        return premiumFallback ? [premiumFallback] : [];
      }
      if (targetId === "slow-sellers") {
        return state.products.filter((item) => item.trendDirection === "Düşüşte" || item.status === "Fiyat Riski");
      }
      if (targetId === "price-risk") {
        return state.products.filter((item) => item.status === "Fiyat Riski");
      }
      if (targetId === "margin-risk") {
        return state.products.filter((item) => item.status === "Marj Riski");
      }
      if (targetId === "trend-up") {
        return state.products.filter((item) => item.trendDirection === "Yükselişte");
      }
    }

    return [];
  }

  function getDynamicPricingPreview() {
    const strategy = getStrategyById(state.dynamicPricing.selectedStrategyId);
    const target = getDynamicPricingScopes().find((item) => {
      return item.type === state.dynamicPricing.targetType && item.id === state.dynamicPricing.selectedTargetId;
    });
    const products = getProductsForTarget(state.dynamicPricing.targetType, state.dynamicPricing.selectedTargetId);

    if (!strategy || !target) {
      return {
        targetLabel: "Hedef seçilmedi",
        affectedProducts: 0,
        movement: "-",
        businessGoal: "-",
        aiQuote: "Önce bir strateji ve hedef seçin, sonra YZ öneriyi netleştirsin.",
        signals: "Rakip Fiyatı, Talep Trendi, Satış Hızı",
        expectedImpact: "--",
        canApply: false
      };
    }

    const expectedImpact = getExpectedImpactLabel(strategy.id);

    return {
      targetLabel: target.label,
      affectedProducts: products.length,
      movement: strategy.movement,
      businessGoal: strategy.businessGoal,
      aiQuote: strategy.aiSummary,
      signals: "Rakip Fiyatı, Talep Trendi, Satış Hızı",
      expectedImpact,
      canApply: products.length > 0
    };
  }

  function applyDynamicPricingStrategy() {
    const strategy = getStrategyById(state.dynamicPricing.selectedStrategyId);
    const target = getDynamicPricingScopes().find((item) => {
      return item.type === state.dynamicPricing.targetType && item.id === state.dynamicPricing.selectedTargetId;
    });
    const products = getProductsForTarget(state.dynamicPricing.targetType, state.dynamicPricing.selectedTargetId);
    const preview = getDynamicPricingPreview();

    if (!strategy || !target || !products.length) {
      showToast("Uygulamak için geçerli bir strateji ve hedef seçilmelidir.");
      return;
    }

    const existingAssignment = state.dynamicPricing.assignments.find((item) => {
      return item.targetType === state.dynamicPricing.targetType && item.targetId === target.id;
    });

    const assignmentPayload = {
      id: existingAssignment ? existingAssignment.id : `dp-${Date.now()}`,
      strategyId: strategy.id,
      targetType: state.dynamicPricing.targetType,
      targetId: target.id,
      targetLabel: target.label,
      affectedProducts: products.length,
      status: "Aktif",
      lastUpdate: "Az önce",
      performance: preview.expectedImpact
    };

    if (existingAssignment) {
      Object.assign(existingAssignment, assignmentPayload);
      showToast("Strateji ataması güncellendi.");
    } else {
      state.dynamicPricing.assignments.unshift(assignmentPayload);
      showToast("Strateji başlatıldı.");
    }

    renderWorkspace();
  }

  function toggleDynamicPricingAssignment(assignmentId) {
    const assignment = state.dynamicPricing.assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;

    assignment.status = assignment.status === "Aktif" ? "Duraklatıldı" : "Aktif";
    assignment.lastUpdate = "Az önce";
    assignment.performance = assignment.status === "Aktif" ? "Yeniden devrede" : "--";
    renderWorkspace();
    showToast(assignment.status === "Aktif" ? "Strateji yeniden başlatıldı." : "Strateji durduruldu.");
  }

  function removeDynamicPricingAssignment(assignmentId) {
    const previousLength = state.dynamicPricing.assignments.length;
    state.dynamicPricing.assignments = state.dynamicPricing.assignments.filter((item) => item.id !== assignmentId);

    if (state.dynamicPricing.assignments.length !== previousLength) {
      renderWorkspace();
      showToast("Strateji ataması kaldırıldı.");
    }
  }

  function getStrategyById(strategyId) {
    return state.dynamicPricing.strategies.find((item) => item.id === strategyId) || null;
  }

  function getExpectedImpactLabel(strategyId) {
    if (strategyId === "stay-competitive") return "Dönüşüm Oranı +%12";
    if (strategyId === "maximize-margin") return "Kâr Marjı +%2,4";
    if (strategyId === "clear-stock") return "Stok Bekleme Süresi -%24";
    return "Ciro +%4,2";
  }

  function getStrategyTone(strategyId) {
    if (strategyId === "stay-competitive") return "amber";
    if (strategyId === "maximize-margin") return "green";
    if (strategyId === "clear-stock") return "red";
    return "indigo";
  }

  function getStrategyIcon(strategyId) {
    if (strategyId === "stay-competitive") return "R";
    if (strategyId === "maximize-margin") return "M";
    if (strategyId === "clear-stock") return "S";
    return "D";
  }

  function getAbStatusClass(status) {
    if (status === "Çalışıyor") return "is-running";
    if (status === "Tamamlandı") return "is-completed";
    return "is-paused";
  }

  function getRiskClass(riskLevel) {
    if (riskLevel === "Yüksek") return "high";
    if (riskLevel === "Orta") return "medium";
    return "low";
  }

  function getRecommendedDiscount(currentPrice) {
    if (currentPrice >= 2000) return 79;
    if (currentPrice >= 1000) return 49;
    return 29;
  }

  function getTrendClass(direction) {
    if (direction === "Yükselişte") return "is-up";
    if (direction === "Düşüşte") return "is-down";
    if (direction === "Dengede") return "is-flat";
    return "is-pending";
  }

  function getStatusClass(status) {
    if (status === "Fiyat Riski") return "is-risk";
    if (status === "Marj Riski") return "is-margin";
    if (status === "Dengede") return "is-balanced";
    return "is-pending";
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatPercent(value) {
    return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value * 100)}%`;
  }

  function showToast(message) {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      elements.toast.classList.remove("is-visible");
    }, 1800);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#96;");
  }
})();
