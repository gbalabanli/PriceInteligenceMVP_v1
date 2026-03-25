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
    abTesting: "/ab-fiyatlandirma-testi",
    abTestingDetail: "/ab-fiyatlandirma-testi/detay"
  };
  const ROUTE_TITLES = {
    [ROUTES.dashboard]: "YZ Akıllı Fiyatlandırma | Genel Bakış",
    [ROUTES.recommendations]: "YZ Akıllı Fiyatlandırma | YZ Fiyat Önerileri",
    [ROUTES.dynamicPricing]: "YZ Akıllı Fiyatlandırma | Dinamik Fiyatlandırma",
    [ROUTES.abTesting]: "YZ Akıllı Fiyatlandırma | A/B Fiyatlandırma Testi",
    [ROUTES.abTestingDetail]: "YZ Akıllı Fiyatlandırma | A/B Test Detayı"
  };
  const INTRO_SEEN_STORAGE_KEY = "pricesmart-intro-seen";
  const AB_CREATE_STRATEGIES = [
    {
      id: "psych-threshold",
      name: "Psikolojik Eşik Testi",
      summary: "Farklı fiyat eşiklerini test ederek dönüşüm kırılma noktalarını yakalar."
    },
    {
      id: "margin-vs-volume",
      name: "Marj Koruma vs Hacim",
      summary: "Satış adedi ile birim kâr dengesini aynı anda ölçer."
    },
    {
      id: "competitive-response",
      name: "Rekabet Tepkisi",
      summary: "Rakip fiyat hamlelerine göre esnek fiyat bandı uygular."
    }
  ];
  const AB_CREATE_TEST_TYPES = [
    {
      id: "sequential-time-series",
      name: "Zaman Serisi (Sequential) Testi",
      summary: "Fiyat etkisini zamana yayılmış örneklemde adım adım ölçer."
    },
    {
      id: "geo-based",
      name: "Coğrafi (Geo-Based) Test",
      summary: "Bölgelere göre farklı fiyat tepkilerini karşılaştırır."
    },
    {
      id: "channel-based",
      name: "Kanal Bazlı Test",
      summary: "Pazaryeri ve satış kanalı performansını ayrı ayrı izler."
    }
  ];
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
      searchQuery: "",
      statusFilter: "all"
    },
    recommendations: {
      searchQuery: "",
      typeFilter: "all",
      priorityFilter: "all"
    },
    introModalOpen: false,
    abCreateModal: {
      open: false,
      selectedProductId: null,
      selectedStrategyAId: AB_CREATE_STRATEGIES[0] ? AB_CREATE_STRATEGIES[0].id : null,
      selectedStrategyBId: AB_CREATE_STRATEGIES[1] ? AB_CREATE_STRATEGIES[1].id : (AB_CREATE_STRATEGIES[0] ? AB_CREATE_STRATEGIES[0].id : null),
      selectedTestTypeId: AB_CREATE_TEST_TYPES[0] ? AB_CREATE_TEST_TYPES[0].id : null
    },
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
    abCreateModalRoot: document.getElementById("ab-create-modal-root"),
    toast: document.getElementById("toast")
  };

  let toastTimer = null;
  let introEligibilityResolved = false;

  bootstrap();

  function bootstrap() {
    ensureDynamicPricingSelection();
    ensureAbTestingSelection();
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("input", handleInput);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("keydown", handleKeydown);
  }

  function syncRoute() {
    const rawHash = window.location.hash.replace(/^#/, "");
    const normalizedRoute = rawHash.startsWith("/") ? rawHash : `/${rawHash}`;

    if (!Object.values(ROUTES).includes(normalizedRoute)) {
      window.location.hash = `#${ROUTES.dashboard}`;
      state.route = ROUTES.dashboard;
      syncPageTitle();
      syncIntroModalAvailability();
      render();
      return;
    }

    if (!introEligibilityResolved) {
      if (normalizedRoute !== ROUTES.dashboard) {
        setIntroSeen();
      }
      introEligibilityResolved = true;
    }

    state.route = normalizedRoute;
    syncPageTitle();
    syncIntroModalAvailability();
    render();
  }

  function render() {
    renderSidebarState();
    renderWorkspace();
    renderDrawer();
    renderIntroModal();
    renderAbCreateModal();
  }

  function renderSidebarState() {
    document.querySelectorAll("[data-route]").forEach((item) => {
      const isAbRoute = item.dataset.route === ROUTES.abTesting
        && (state.route === ROUTES.abTesting || state.route === ROUTES.abTestingDetail);
      item.classList.toggle("is-active", item.dataset.route === state.route || isAbRoute);
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

    if (state.route === ROUTES.abTestingDetail) {
      elements.app.innerHTML = renderAbTestingDetailPage();
      return;
    }

    const metrics = getMetrics();
    const actionHighlights = getDashboardActionHighlights();

    elements.app.innerHTML = `
      <section class="panel dashboard-hero">
        <div class="dashboard-hero__head">
          <div class="dashboard-hero__copy">
            <p class="dashboard-hero__eyebrow">Genel Bakış</p>
            <h1 class="dashboard-hero__title">Fiyat baskısı, YZ içgörüsü ve öncelikli kararlar aynı akışta.</h1>
            <p class="dashboard-hero__text">Ekipler bugün hangi üründe fiyat korumalı, nerede agresifleşmeli ve hangi fırsatı hemen değerlendirmeli; bu ekran tüm kritik sinyalleri tek bakışta toplar.</p>
          </div>
          <aside class="dashboard-hero__spotlight">
            <div class="dashboard-hero__spotlight-icon">
              ${renderUiIcon("spark")}
            </div>
            <div>
              <p class="dashboard-hero__spotlight-label">Bugünün odağı</p>
              <strong class="dashboard-hero__spotlight-value">${formatMoney(metrics.gainPotential)} potansiyel</strong>
              <p class="dashboard-hero__spotlight-text">${metrics.actionableProducts} ürün şu anda fiyat kararı bekliyor.</p>
              <div class="dashboard-hero__confidence">
                <span class="dashboard-hero__confidence-meter" style="--confidence:${Number(state.marketPulse.aiConfidenceScore) || 0};" aria-label="YZ Güven Skoru yüzde ${Number(state.marketPulse.aiConfidenceScore) || 0}">
                  <strong>%${Number(state.marketPulse.aiConfidenceScore) || 0}</strong>
                </span>
                <span class="dashboard-hero__confidence-copy">
                  <span class="dashboard-hero__confidence-label">YZ Güven Skoru</span>
                  <strong class="dashboard-hero__confidence-value">Karar güveni yüksek</strong>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="kpi-grid" aria-label="KPI özetleri">
        ${renderKpiCard("Takip Edilen Ürün", String(metrics.trackedCount), `${metrics.actionableProducts} ürün aksiyon bekliyor.`, "is-primary", "grid")}
        ${renderKpiCard("Fiyat Nedeniyle Kaçan Gelir", formatMoney(metrics.lostRevenue), "Rakip altına inen ürünlerde görünür kayıp oluşuyor.", "is-danger", "discount")}
        ${renderKpiCard("Marj Kaybı Riski", `${metrics.marginRiskCount} ürün`, "Fiyatı gereğinden düşük kalan ürünler marj yakıyor.", "is-warning", "priority")}
        ${renderKpiCard("Tahmini Ek Kâr Potansiyeli", formatMoney(metrics.gainPotential), "Doğru fiyat adımları ile toplanabilecek ek potansiyel.", "is-success", "growth")}
      </section>

      <section class="panel dashboard-insight">
        <div class="panel-head">
          <div>
            <h2 class="panel-title panel-title--insight">YZ İçgörüsü</h2>
            <p class="panel-text">Rakip baskısı, trend yönü ve yapay zeka okuması aynı blokta toplanır. Karar verici ilk bakışta hangi segmentte hareket olduğunu görür.</p>
          </div>
          <span class="panel-chip">Canlı sinyal özeti</span>
        </div>

        <div class="pulse-grid">
          <article class="pulse-cell pulse-cell--topic">
            <span class="pulse-cell__icon">${renderUiIcon("spark")}</span>
            <p class="pulse-label">Odak konu</p>
            <p class="pulse-value">${escapeHtml(state.marketPulse.trendTopic)}</p>
          </article>
          <article class="pulse-cell pulse-cell--trend">
            <span class="pulse-cell__icon">${renderUiIcon("growth")}</span>
            <p class="pulse-label">Google Trends yönü</p>
            <p class="pulse-value">${escapeHtml(state.marketPulse.trendDirection)}</p>
          </article>
          <article class="pulse-cell pulse-cell--pressure">
            <span class="pulse-cell__icon">${renderUiIcon("priority")}</span>
            <p class="pulse-label">Rakip baskısı</p>
            <p class="pulse-value">${escapeHtml(state.marketPulse.competitorPressure)}</p>
          </article>
        </div>

        <div class="pulse-summary">
          <div class="pulse-summary__head">
            <span class="pulse-summary__label pulse-summary__label--recommend">YZ Önerisi</span>
            <p class="pulse-summary__confidence">YZ Güven Skoru: <strong>%${Number(state.marketPulse.aiConfidenceScore) || 0}</strong></p>
          </div>
          <p class="pulse-summary__text">${escapeHtml(state.marketPulse.aiSummary)}</p>
          <div class="pulse-summary__actions">
            <button class="pulse-summary__action pulse-summary__action--discard" type="button" data-discard-insight="1">Vazgeç</button>
            <button class="pulse-summary__action pulse-summary__action--apply" type="button" data-apply-insight="1">Uygula</button>
          </div>
        </div>
      </section>

      <section class="panel action-board">
        <div class="panel-head action-board__head">
          <div>
            <h2 class="panel-title">Bugün Öncelikli Aksiyonlar</h2>
            <p class="panel-text">Bugün karar bekleyen fiyat hareketlerini burada önceliklendiriyoruz. Her kart ürünün riski, rekabet sinyali ve YZ yönünü tek bakışta verir.</p>
          </div>
          <span class="panel-chip">${actionHighlights.length} kritik ürün</span>
        </div>
        <div class="action-board__grid">
          ${actionHighlights.map(renderActionHighlightCard).join("")}
        </div>
      </section>

      <section class="table-card dashboard-table-card">
        <div class="table-card__head">
          <div class="dashboard-table-card__titleblock">
            <span class="dashboard-table-card__icon">${renderUiIcon("grid")}</span>
            <div>
              <h2 class="panel-title dashboard-table-card__title">Takip Edilen Ürünler</h2>
            <p class="table-card__hint">Bir ürün satırına tıklayarak rakip URL, fiyat ve trend detayını açın.</p>
            </div>
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
    const recommendations = getFilteredRecommendationRows();
    const allRecommendations = getRecommendationRows();
    const highPriorityCount = recommendations.filter((item) => item.priority === "Yüksek").length;

    return `
      <section class="panel recommendation-hero">
        <div class="recommendation-hero__head">
          <div class="recommendation-hero__copy">
            <p class="recommendation-hero__eyebrow">YZ karar akışı</p>
            <h1 class="recommendation-hero__title">YZ Fiyat Önerileri</h1>
            <p class="recommendation-hero__text">Rakip fiyatı, trend yönü ve mevcut fiyat farkı birlikte okunur. Ortaya çıkan öneriler, ekiplerin hızla karar alabileceği net bir operasyon görünümüne çevrilir.</p>
          </div>
          <aside class="recommendation-hero__spotlight">
            <div class="recommendation-hero__spotlight-icon">
              ${renderUiIcon("spark")}
            </div>
            <div>
              <p class="recommendation-hero__spotlight-label">Karar baskısı</p>
              <strong class="recommendation-hero__spotlight-value">${highPriorityCount} yüksek öncelikli öneri</strong>
              <p class="recommendation-hero__spotlight-text">Bugün aksiyon isteyen fiyat hareketleri tek listede toplanır.</p>
            </div>
          </aside>
        </div>

        <div class="recommendation-summary recommendation-summary--showcase">
          ${renderRecommendationMetricCard("Aktif öneri", allRecommendations.length, "list")}
          ${renderRecommendationMetricCard("Bekleyen indirim", allRecommendations.filter((item) => item.type === "İndirim").length, "discount")}
          ${renderRecommendationMetricCard("Marj artış fırsatı", allRecommendations.filter((item) => item.type === "Artış").length, "growth")}
        </div>
      </section>

      <section class="panel recommendation-filters">
        <div class="recommendation-filter-row">
          <label class="recommendation-search-field">
            <span>Ara</span>
            <span class="recommendation-field">
              <span class="recommendation-field__icon">${renderUiIcon("search")}</span>
              <input type="text" placeholder="Ürün, SKU veya kategori ara..." value="${escapeAttribute(state.recommendations.searchQuery)}" data-recommendation-search>
            </span>
          </label>
          <label class="recommendation-select-field">
            <span>Öneri Tipi</span>
            <span class="recommendation-field recommendation-field--select">
              <span class="recommendation-field__icon">${renderUiIcon("switch")}</span>
              <select data-recommendation-type-filter>
                <option value="all" ${state.recommendations.typeFilter === "all" ? "selected" : ""}>Tümü</option>
                <option value="İndirim" ${state.recommendations.typeFilter === "İndirim" ? "selected" : ""}>İndirim</option>
                <option value="Artış" ${state.recommendations.typeFilter === "Artış" ? "selected" : ""}>Artış</option>
                <option value="Koruma" ${state.recommendations.typeFilter === "Koruma" ? "selected" : ""}>Koruma</option>
              </select>
            </span>
          </label>
          <label class="recommendation-select-field">
            <span>Öncelik</span>
            <span class="recommendation-field recommendation-field--select">
              <span class="recommendation-field__icon">${renderUiIcon("priority")}</span>
              <select data-recommendation-priority-filter>
                <option value="all" ${state.recommendations.priorityFilter === "all" ? "selected" : ""}>Tümü</option>
                <option value="Yüksek" ${state.recommendations.priorityFilter === "Yüksek" ? "selected" : ""}>Yüksek</option>
                <option value="Orta" ${state.recommendations.priorityFilter === "Orta" ? "selected" : ""}>Orta</option>
              </select>
            </span>
          </label>
        </div>
      </section>

      <section class="table-card recommendation-table-card">
        <div class="table-card__head">
          <div class="recommendation-table-card__titleblock">
            <span class="recommendation-table-card__icon">${renderUiIcon("grid")}</span>
            <div>
              <h2 class="panel-title recommendation-table-card__title">YZ Öneri Listesi</h2>
            <p class="table-card__hint">Satır bazında onaylayabileceğiniz fiyat önerileri, gerekçesi ve önceliğiyle birlikte burada toplanır.</p>
            </div>
          </div>
          <button class="secondary-button" type="button" data-route="${ROUTES.dashboard}">Genel Bakışa Dön</button>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Mevcut Fiyat</th>
                <th>YZ Önerilen Fiyat</th>
                <th>TL Etkisi</th>
                <th>Öneri Tipi</th>
                <th>Öncelik</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              ${recommendations.length ? recommendations.map(renderRecommendationRow).join("") : `<tr><td colspan="7" class="empty-state">Bu filtre ile eşleşen öneri bulunamadı.</td></tr>`}
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
    const selectedStrategy = getStrategyById(state.dynamicPricing.selectedStrategyId);

    return `
      <section class="panel intent-hero">
        <div class="intent-hero__head">
          <div class="intent-hero__copy">
            <p class="intent-hero__eyebrow">Otomatik fiyat akışı</p>
            <h1 class="intent-hero__title">Dinamik Fiyatlandırma Paneli</h1>
            <p class="intent-hero__text">Kural yazmayı bırakın. Stratejiyi seçin, hedef alanı belirleyin ve YZ’nin pazar ritmine göre nasıl karar aldığını tek ekranda görün.</p>
          </div>
          <aside class="intent-hero__spotlight">
            <div class="intent-hero__spotlight-icon">
              ${renderUiIcon("spark")}
            </div>
            <div>
              <p class="intent-hero__spotlight-label">Canlı yönlendirme</p>
              <strong class="intent-hero__spotlight-value">${escapeHtml(preview.expectedImpact)}</strong>
              <p class="intent-hero__spotlight-text">${escapeHtml(preview.targetLabel)} için önerilen akış şu anda hazır.</p>
            </div>
          </aside>
        </div>

        <div class="intent-summary">
          ${renderIntentMetricCard("Seçili strateji", selectedStrategy ? selectedStrategy.name : "-", "Şu an uygulanacak ana fiyat mantığı", "switch")}
          ${renderIntentMetricCard("Hedef kitle", preview.targetLabel, "Stratejinin uygulanacağı ürün grubu", "grid")}
          ${renderIntentMetricCard("Aktif akış", `${activeAssignments.length}`, "Canlı çalışan strateji ataması", "growth")}
        </div>
      </section>

      <section class="intent-layout" aria-label="Niyet temelli fiyatlandırma">
        <div class="intent-main">
          <section class="panel intent-section">
            <div class="intent-step intent-step--spacious">
              <span class="intent-step__index">1</span>
              <div>
                <h2 class="intent-step__title">Strateji Seç</h2>
                <p class="intent-step__text">İş hedefinize en yakın fiyat davranışını seçin. Her kart farklı risk seviyesi ve ticari öncelik taşır.</p>
              </div>
            </div>
            <div class="intent-strategy-grid">
              ${state.dynamicPricing.strategies.map((item) => renderStrategyCard(item, item.id === state.dynamicPricing.selectedStrategyId)).join("")}
            </div>
          </section>

          <section class="panel intent-target-card">
            <div class="intent-step intent-step--spacious">
              <span class="intent-step__index">2</span>
              <div>
                <h2 class="intent-step__title">Hedef Kitleyi Belirle</h2>
                <p class="intent-step__text">YZ’nin bu stratejiyi hangi ürün, kategori veya koleksiyon üzerinde çalıştıracağını seçin.</p>
              </div>
            </div>
            <label class="intent-select-field">
              <span class="intent-select-field__icon">${renderUiIcon("grid")}</span>
              <select class="intent-select" data-target-scope aria-label="Hedef kitle seçimi">
                ${scopeOptions.map((item) => renderScopeOption(item)).join("")}
              </select>
            </label>
          </section>
        </div>

        <aside class="intent-side">
          <section class="intent-ai-card">
            <div class="intent-ai-card__head">
              <span class="intent-ai-card__icon" aria-hidden="true">${renderUiIcon("spark")}</span>
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
            <div class="intent-guard-card__head">
              <span class="intent-guard-card__icon">${renderUiIcon("shield")}</span>
              <div>
                <p class="intent-guard-card__eyebrow">Koruma katmanı</p>
                <h3 class="intent-guard-card__title">Güvenlik Duvarı</h3>
              </div>
            </div>
            <p class="intent-guard-card__text">Bu sınırlar aşıldığında sistem fiyat hareketini yavaşlatır veya tamamen durdurur.</p>
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
          <div class="intent-table-card__titleblock">
            <span class="intent-table-card__icon">${renderUiIcon("list")}</span>
            <div>
            <h2 class="panel-title">Aktif Stratejiler</h2>
            <p class="table-card__hint">Canlı çalışan stratejileri tek listede izleyebilir, duraklatıp yeniden başlatabilirsiniz.</p>
            </div>
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

  function renderIntentMetricCard(label, value, note, iconName) {
    return `
      <article class="intent-summary__card">
        <div class="intent-summary__icon">
          ${renderUiIcon(iconName)}
        </div>
        <div>
          <p class="intent-summary__label">${escapeHtml(label)}</p>
          <p class="intent-summary__value">${escapeHtml(String(value))}</p>
          <p class="intent-summary__note">${escapeHtml(note)}</p>
        </div>
      </article>
    `;
  }

  function renderAbTestingPage() {
    const selectedTest = getSelectedAbTest();
    const tests = getFilteredAbTests();
    const activeCount = state.abTesting.tests.filter((item) => item.status === "Çalışıyor").length;
    const totalContribution = state.abTesting.tests.reduce((sum, item) => sum + (Number(item.monthlyContribution) || 0), 0);
    const winnerCount = state.abTesting.tests.filter((item) => getAbCardTone(item) === "winner").length;
    const criticalCount = state.abTesting.tests.filter((item) => getAbCardTone(item) === "critical").length;

    if (!state.abTesting.tests.length) {
      return `
        <section class="panel">
          <h1 class="panel-title">A/B Fiyatlandırma Testi</h1>
          <p class="panel-text">Gösterilecek test bulunamadı.</p>
        </section>
      `;
    }

    return `
      <section class="panel ab-library-hero">
        <div class="ab-library-head">
          <div class="ab-library-head__copy">
            <p class="ab-library-eyebrow">Deney Orkestrasyonu</p>
            <h1 class="ab-library-title">A/B Fiyatlandırma Deney Kütüphanesi</h1>
            <p class="ab-library-text">
              Canlı deneyleri, güven eşiğini ve hangi varyantın üretime daha yakın olduğunu tek akışta okuyun. Ürün, strateji ve test türü aynı kartta sade biçimde görünür.
            </p>
          </div>
          <div class="ab-library-meta">
            <article class="ab-library-spotlight">
              <span class="ab-library-spotlight__icon">${renderUiIcon("spark")}</span>
              <div>
                <p class="ab-library-spotlight__label">Deney Etkisi</p>
                <strong class="ab-library-spotlight__value">${formatSignedMoney(totalContribution)} <span>/ ay</span></strong>
                <p class="ab-library-spotlight__text">${activeCount} canlı test, ${winnerCount} karar aşamasında deney.</p>
              </div>
            </article>
            <button class="primary-button" type="button" data-open-ab-create="1" ${state.products.length ? "" : "disabled"}>
              <span class="ab-library-button__icon" aria-hidden="true">${renderUiIcon("experiment")}</span>
              <span>Yeni Deney Başlat</span>
            </button>
          </div>
        </div>

        <div class="ab-library-summary">
          ${renderAbLibraryMetricCard("Canlı test", String(activeCount), "Şu anda veri toplayan deney", "list")}
          ${renderAbLibraryMetricCard("Karar hazır", String(winnerCount), "Kazananı uygulamaya yakın test", "growth")}
          ${renderAbLibraryMetricCard("Kritik uyarı", String(criticalCount), "Denetim gerektiren akış", "priority")}
        </div>
      </section>

      <section class="panel ab-library-filters">
        <div class="ab-filter-row">
          <label class="ab-search-field">
            <span>Ara</span>
            <span class="ab-library-field">
              <span class="ab-library-field__icon">${renderUiIcon("search")}</span>
              <input type="text" placeholder="Ürün, marka veya strateji ara..." data-ab-search value="${escapeAttribute(state.abTesting.searchQuery)}">
            </span>
          </label>
          <label class="ab-status-field">
            <span>Durum</span>
            <span class="ab-library-field ab-library-field--select">
              <span class="ab-library-field__icon">${renderUiIcon("switch")}</span>
              <select data-ab-status-filter>
                <option value="all" ${state.abTesting.statusFilter === "all" ? "selected" : ""}>Tüm Durumlar</option>
                <option value="winner" ${state.abTesting.statusFilter === "winner" ? "selected" : ""}>Anlamlı Sonuç (Kazanan Var)</option>
                <option value="running" ${state.abTesting.statusFilter === "running" ? "selected" : ""}>Veri Toplanıyor</option>
                <option value="critical" ${state.abTesting.statusFilter === "critical" ? "selected" : ""}>Kritik Uyarı</option>
              </select>
            </span>
          </label>
        </div>
      </section>

      <section class="ab-library-list">
        ${tests.length
          ? tests.map((test) => renderAbExperimentCard(test)).join("")
          : `
            <section class="panel ab-library-empty">
              <h3>Bu filtrede gösterilecek deney yok</h3>
              <p>Arama metnini veya durum filtresini temizleyerek tüm deneyleri tekrar listeleyebilirsiniz.</p>
            </section>
          `
        }
      </section>

      <section class="panel ab-library-archive">
        <h3>Geçmiş Deney Arşivi</h3>
        <p>Daha önce tamamlanan deneyleri arşiv sekmesinden inceleyebilir, kazanan kurguları yeni testlere klonlayabilirsiniz.</p>
      </section>
    `;
  }

  function renderAbTestingDetailPage() {
    const test = getSelectedAbTest();

    if (!test) {
      return `
        <section class="panel">
          <h1 class="panel-title">A/B Fiyatlandırma Testi</h1>
          <p class="panel-text">Gösterilecek test bulunamadı.</p>
        </section>
      `;
    }

    const detailText = test.name
      ? `${test.name}. ${test.targetKpi ? `Bu test ${test.targetKpi.toLocaleLowerCase("tr-TR")} hedefiyle çalışır.` : "Bu test canlı performans verisiyle izlenir."}`
      : "Ürün bazlı fiyat deneyinin canlı metrikleri ve karar önerisi bu ekranda gösterilir.";

    const decision = getAbDecision(test);
    const rows = getAbComparisonRows(test);
    const snapshot = getAbLiveSnapshot(test);
    const detailMeta = getAbDetailMeta(test);

    return `
      <section class="panel ab-hero">
        <div class="ab-detail-heading">
          <h1 class="ab-detail-heading__title">${escapeHtml(test.productName || test.name)}</h1>
          <p class="ab-detail-heading__text">${escapeHtml(detailText)}</p>
        </div>
        <div class="ab-hero__controls">
          <button class="primary-button ab-back-button" type="button" data-ab-back="1" title="Listeye geri dön" aria-label="Listeye geri dön">Listeye Geri Dön</button>
        </div>
      </section>

      <section class="ab-layout">
        <div class="ab-main">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="ab-context-label">Canlı Test Özeti</p>
                <p class="panel-text ab-context-text">${escapeHtml(test.name)} • Hedef: ${escapeHtml(test.targetLabel)} • KPI: ${escapeHtml(test.targetKpi)} • Trafik dağılımı: ${escapeHtml(test.trafficSplit)}</p>
              </div>
              <div class="ab-state-row">
                <span class="ab-state-chip ${getAbStatusClass(test.status)}">${escapeHtml(test.status)}</span>
                <span class="ab-state-chip is-soft">YZ Güven Skoru: <strong>%${test.significance}</strong></span>
              </div>
            </div>

            <div class="ab-detail-meta-strip" aria-label="Test meta bilgileri">
              <span class="ab-detail-meta-pill">
                <small>Mevcut Strateji</small>
                <strong>${escapeHtml(detailMeta.currentStrategy)}</strong>
              </span>
              <span class="ab-detail-meta-pill">
                <small>Varyant A</small>
                <strong>${escapeHtml(detailMeta.variantAStrategy)}</strong>
              </span>
              <span class="ab-detail-meta-pill">
                <small>Varyant B</small>
                <strong>${escapeHtml(detailMeta.variantBStrategy)}</strong>
              </span>
              <span class="ab-detail-meta-pill">
                <small>Test Türü</small>
                <strong>${escapeHtml(detailMeta.testType)}</strong>
              </span>
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
              <button class="primary-button" type="button" data-ab-action="toggle-run" data-ab-test="${escapeAttribute(test.id)}">${test.status === "Çalışıyor" ? "Testi Durdur" : "Testi Başlat"}</button>
              <button class="outline-button" type="button" data-ab-action="apply-winner" data-ab-test="${escapeAttribute(test.id)}" ${decision.canApply ? "" : "disabled"}>Kazananı Yayına Al</button>
              <button class="ghost-button" type="button" data-ab-action="clone-test" data-ab-test="${escapeAttribute(test.id)}">Yeni Test Klonla</button>
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
            <p class="ab-guardrails__eyebrow">Canlı Koruma Katmanı</p>
            <h3 class="ab-side__title">Denetim Mekanizması</h3>
            <p class="ab-guardrails__text">Aşağıdaki sınırlar ihlal edilirse test akışı otomatik olarak yavaşlatılır veya durdurulur.</p>
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
    `;
  }

  function renderKpiCard(label, value, note, modifier, iconName) {
    return `
      <article class="kpi-card ${modifier}">
        <div class="kpi-card__head">
          <span class="kpi-card__icon">${renderUiIcon(iconName || "spark")}</span>
          <p class="kpi-label">${escapeHtml(label)}</p>
        </div>
        <p class="kpi-value">${escapeHtml(value)}</p>
        <p class="kpi-note">${escapeHtml(note)}</p>
      </article>
    `;
  }

  function renderProductRow(product) {
    return `
      <tr class="product-row" tabindex="0" data-product-row="${escapeHtml(product.id)}" aria-label="${escapeHtml(product.name)} detaylarını aç">
        <td>
          <div class="product-cell">
            <div>
              <p class="product-name">${escapeHtml(product.name)}</p>
              <div class="product-meta">
                <span class="muted-chip">${escapeHtml(product.sku)}</span>
                <span class="muted-chip">${escapeHtml(product.category)}</span>
                <span class="muted-chip">${product.competitorCount} rakip</span>
              </div>
            </div>
            <span class="product-open-hint">Detay</span>
          </div>
        </td>
        <td>${formatMoney(product.currentPrice)}</td>
        <td>${renderCompetitorStatusCell(product.competitorStatus)}</td>
        <td><span class="trend-chip ${getTrendClass(product.trendDirection)}">${escapeHtml(product.trendDirection)}</span></td>
        <td><p class="ai-note"><strong>YZ:</strong> ${renderAiSuggestionText(product.aiSuggestionText)}</p></td>
        <td><span class="status-chip ${getStatusClass(product.status)}">${escapeHtml(product.status)}</span></td>
      </tr>
    `;
  }

  function renderCompetitorStatusCell(statusText) {
    return `
      <div class="competitor-status">
        <p class="competitor-status__text">${renderInlineCompetitorStatusText(statusText)}</p>
      </div>
    `;
  }

  function renderInlineCompetitorStatusText(statusText) {
    const safeText = escapeHtml(statusText || "");
    return safeText.replace(/% ?\d+\s*(altında|üstünde|üzerinde)|aynı bantta|fiyat kırdı/gi, (match) => {
      const normalized = match.toLocaleLowerCase("tr-TR");
      let tone = "is-default";
      if (normalized.includes("altında")) tone = "is-below";
      else if (normalized.includes("üstünde") || normalized.includes("üzerinde")) tone = "is-above";
      else if (normalized.includes("aynı bantta")) tone = "is-neutral";
      else if (normalized.includes("fiyat kırdı")) tone = "is-alert";
      return `<span class="competitor-status-tag ${tone}">${match}</span>`;
    });
  }

  function renderAiSuggestionText(text) {
    let formatted = escapeHtml(text || "");
    const tokens = [
      { text: "dönüşüm kaybı", className: "is-loss" },
      { text: "fiyat artışı", className: "is-increase" },
      { text: "fiyat korunabilir", className: "is-keep" },
      { text: "fiyatı korumak", className: "is-hold" }
    ];

    tokens.forEach((token) => {
      const escapedToken = escapeHtml(token.text);
      const escapedPattern = escapedToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedPattern, "gi");
      formatted = formatted.replace(regex, (match) => `<span class="ai-highlight ${token.className}">${match}</span>`);
    });

    return formatted;
  }

  function renderRecommendationRow(item) {
    return `
      <tr>
        <td>
          <div class="recommendation-product">
            <span class="recommendation-product__icon recommendation-product__icon--${escapeAttribute(getRecommendationVisualTone(item))}">
              ${renderUiIcon(getRecommendationIconName(item))}
            </span>
            <div>
              <p class="product-name">${escapeHtml(item.name)}</p>
              <div class="product-meta">
                <span class="muted-chip">${escapeHtml(item.sku)}</span>
                <span class="muted-chip">${escapeHtml(item.category)}</span>
              </div>
            </div>
          </div>
        </td>
        <td>${formatMoney(item.currentPrice)}</td>
        <td>
          <div class="recommendation-price-stack">
            <strong class="recommendation-price">${formatMoney(item.suggestedPrice)}</strong>
            <p class="recommendation-reason-inline">${escapeHtml(item.reason)}</p>
          </div>
        </td>
        <td><span class="recommendation-impact ${item.impactKind === "risk" ? "is-risk" : "is-opportunity"}">${escapeHtml(item.impactLabel)}</span></td>
        <td><span class="recommendation-type ${item.type === "İndirim" ? "is-discount" : item.type === "Artış" ? "is-increase" : "is-keep"}">${escapeHtml(item.type)}</span></td>
        <td><span class="recommendation-priority ${item.priority === "Yüksek" ? "is-high" : "is-medium"}">${escapeHtml(item.priority)}</span></td>
        <td>
          <div class="recommendation-actions">
            <button class="recommendation-action recommendation-action--discard" type="button" data-discard-recommendation="${escapeAttribute(item.id)}">Atla</button>
            <button class="recommendation-action recommendation-action--apply" type="button" data-apply-recommendation="${escapeAttribute(item.id)}">Uygula</button>
          </div>
        </td>
      </tr>
    `;
  }

  function renderRecommendationMetricCard(label, value, iconName) {
    return `
      <article class="recommendation-summary__card recommendation-summary__card--showcase">
        <div class="recommendation-summary__icon">
          ${renderUiIcon(iconName)}
        </div>
        <div>
          <p class="recommendation-summary__label">${escapeHtml(label)}</p>
          <p class="recommendation-summary__value">${escapeHtml(String(value))}</p>
        </div>
      </article>
    `;
  }

  function renderAbLibraryMetricCard(label, value, note, iconName) {
    return `
      <article class="ab-library-summary__card">
        <div class="ab-library-summary__icon">
          ${renderUiIcon(iconName)}
        </div>
        <div>
          <p class="ab-library-summary__label">${escapeHtml(label)}</p>
          <p class="ab-library-summary__value">${escapeHtml(value)}</p>
          <p class="ab-library-summary__note">${escapeHtml(note)}</p>
        </div>
      </article>
    `;
  }

  function renderActionHighlightCard(item) {
    return `
      <article class="action-highlight-card">
        <div class="action-highlight-card__head">
          <div>
            <p class="action-highlight-card__eyebrow">${escapeHtml(item.status)}</p>
            <h3 class="action-highlight-card__title">${escapeHtml(item.name)}</h3>
          </div>
          <span class="action-highlight-card__category">${escapeHtml(item.category)}</span>
        </div>
        <p class="action-highlight-card__text">${renderInlineCompetitorStatusText(item.competitorStatus)}</p>
        <p class="action-highlight-card__recommendation">${renderAiSuggestionText(item.aiSuggestionText)}</p>
        <div class="action-highlight-card__meta">
          <div class="action-highlight-card__meta-main">
            <span class="action-highlight-card__impact">${escapeHtml(item.impactLabel)}</span>
            <div class="action-highlight-card__actions">
              <button class="outline-button" type="button" data-discard-highlight="${escapeAttribute(item.id)}">Atla</button>
              <button class="primary-button" type="button" data-apply-highlight="${escapeAttribute(item.id)}">Uygula</button>
            </div>
          </div>
          <strong>${formatMoney(item.currentPrice)}</strong>
        </div>
      </article>
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
            ${strategy.id === "balanced-auto" ? `<span class="intent-tag intent-tag--recommended">Önerilen</span>` : ""}
            <p class="intent-strategy-card__summary">${escapeHtml(strategy.summary)}</p>
          </div>
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

  function renderAbExperimentCard(test) {
    const tone = getAbCardTone(test);
    const decision = getAbDecision(test);
    const rows = getAbComparisonRows(test);
    const hasExplicitControl = rows.some((item) => item.id === "control");
    const control = rows.find((item) => item.id === "control") || rows[0] || null;
    const variantA = rows.find((item) => item.id === "variant-a") || rows[0] || null;
    const variantB = rows.find((item) => item.id === "variant-b") || rows[1] || variantA;
    const winner = decision.winnerId
      ? rows.find((item) => item.id === decision.winnerId) || null
      : rows
        .filter((item) => item.id !== "control")
        .sort((a, b) => b.uplift - a.uplift)[0] || null;
    const comparisonA = hasExplicitControl
      ? (control ? control.rpv : 1)
      : (variantA ? variantA.rpv : 1);
    const comparisonB = hasExplicitControl
      ? (winner ? winner.rpv : comparisonA)
      : (variantB ? variantB.rpv : comparisonA);
    const comparisonTotal = Math.max(1, comparisonA + comparisonB);
    const aWidth = Math.max(18, Math.round((comparisonA / comparisonTotal) * 100));
    const bWidth = Math.max(18, 100 - aWidth);
    const sampleCollected = Number(test.sampleCollected) || 0;
    const sampleTarget = Number(test.sampleTarget) || 0;
    const sampleProgress = sampleTarget > 0 ? Math.min(100, Math.round((sampleCollected / sampleTarget) * 100)) : 0;
    const uplift = winner && winner.id !== "control" ? winner.uplift : 0;
    const winnerId = decision.winnerId || "";
    const isRunning = test.status === "Çalışıyor";
    const cardLabel = tone === "winner"
      ? "Kazanan Belirlendi"
      : tone === "critical"
        ? "Kritik Uyarı"
        : "Veri Toplanıyor";
    const actionLabel = tone === "critical"
      ? "Stratejiyi Revize Et"
      : isRunning
        ? "Testi Durdur"
        : "Testi Başlat";
    const actionType = tone === "critical" ? "clone-test" : "toggle-run";
    const actionClass = tone === "critical" ? "secondary-button" : "outline-button";
    const testTypeLabel = test.testDesignLabel || "Zaman Serisi (Sequential) Testi";
    const strategySummary = (test.strategyVariantAName && test.strategyVariantBName)
      ? `Varyant A: <strong>${escapeHtml(test.strategyVariantAName)}</strong> · Varyant B: <strong>${escapeHtml(test.strategyVariantBName)}</strong>`
      : `Strateji: <strong>${escapeHtml(test.strategyName || test.name)}</strong>`;

    return `
      <article class="ab-exp-card is-${tone}" data-ab-open-detail="${escapeAttribute(test.id)}" aria-label="${escapeHtml((test.productName || test.name) + " detay sayfasını aç")}">
        <span class="ab-exp-badge">${cardLabel}</span>
        <div class="ab-exp-grid">
          <section class="ab-exp-product">
            <span class="ab-exp-avatar ab-exp-avatar--${escapeAttribute(getAbAvatarTone(test))}">
              <span class="ab-exp-avatar__glyph">${escapeHtml(getAbAvatarLabel(test))}</span>
            </span>
            <div>
              <p class="ab-exp-product__eyebrow">
                <span class="ab-exp-product__eyebrow-icon">${renderUiIcon("spark")}</span>
                Deney kartı
              </p>
              <h3>${escapeHtml(test.productName || test.name)}</h3>
              <p>${strategySummary}</p>
              <p class="ab-exp-testtype">Test Türü: <strong>${escapeHtml(testTypeLabel)}</strong></p>
              <div class="ab-exp-tags">
                <span>${escapeHtml(test.category || test.targetLabel)}</span>
                ${test.categoryDetail ? `<span>${escapeHtml(test.categoryDetail)}</span>` : ""}
              </div>
            </div>
          </section>

          <section class="ab-exp-compare">
            <p class="ab-exp-section-label">
              <span class="ab-exp-section-label__icon">${renderUiIcon("switch")}</span>
              Varyant görünümü
            </p>
            ${tone === "running"
              ? `
                <p class="ab-exp-status">İlerleme: <strong>${new Intl.NumberFormat("tr-TR").format(sampleCollected)} / ${new Intl.NumberFormat("tr-TR").format(sampleTarget)} örneklem</strong></p>
                <div class="ab-progress-track"><span style="width:${sampleProgress}%"></span></div>
                <p class="ab-exp-note">YZ Güven Skoru: <strong>%${test.significance}</strong></p>
              `
              : `
                <div class="ab-exp-legend">
                  <span>${hasExplicitControl ? "A (Kontrol)" : (winnerId === "variant-a" ? "A (Kazanan)" : "A (Varyant A)")}</span>
                  <span>${hasExplicitControl ? (winnerId ? "B (Kazanan)" : "B (Varyant)") : (winnerId === "variant-b" ? "B (Kazanan)" : "B (Varyant B)")}</span>
                </div>
                <div class="ab-duel-track">
                  <span class="ab-duel-track__a" style="width:${aWidth}%"></span>
                  <span class="ab-duel-track__b" style="width:${bWidth}%"></span>
                </div>
                <p class="ab-exp-note">YZ Güven Skoru: <strong>%${test.significance}</strong></p>
              `
            }
          </section>

          <section class="ab-exp-kpis">
            <p class="ab-exp-section-label">
              <span class="ab-exp-section-label__icon">${renderUiIcon("growth")}</span>
              Ticari sonuç
            </p>
            <div>
              <p>${tone === "running" ? "Tahmini Uplift" : "Uplift"}</p>
              <strong class="${uplift >= 0 ? "is-up" : "is-down"}">${formatSignedPercent(uplift)}</strong>
            </div>
            <div>
              <p>${tone === "running" ? "Kalan Süre" : "Ek Gelir"}</p>
              <strong>${tone === "running" ? `${test.remainingDays || 0} gün` : formatSignedMoney(test.monthlyContribution || 0)}</strong>
            </div>
          </section>

          <section class="ab-exp-actions">
            <button class="primary-button ab-exp-actions__detail" type="button" data-ab-open-detail="${escapeAttribute(test.id)}">Detayı Gör</button>
            ${tone === "winner"
              ? `<button class="outline-button" type="button" data-ab-action="apply-winner" data-ab-test="${escapeAttribute(test.id)}" ${decision.canApply ? "" : "disabled"}>Kazananı Uygula</button>`
              : `<button class="${actionClass}" type="button" data-ab-action="${actionType}" data-ab-test="${escapeAttribute(test.id)}">${actionLabel}</button>`
            }
          </section>
        </div>
        ${tone === "critical" && test.criticalReason
          ? `
            <div class="ab-exp-critical">
              <p>İhlal Noktası</p>
              <strong>${escapeHtml(test.criticalReason)}</strong>
            </div>
          `
          : ""
        }
      </article>
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

  function getAbDetailMeta(test) {
    const hasVariantA = Array.isArray(test.variants) && test.variants.some((item) => item.id === "variant-a");
    const hasVariantB = Array.isArray(test.variants) && test.variants.some((item) => item.id === "variant-b");

    return {
      currentStrategy: test.controlStrategyName || "Mevcut Fiyat / Kontrol",
      variantAStrategy: hasVariantA ? (test.strategyVariantAName || test.strategyName || "-") : "-",
      variantBStrategy: hasVariantB ? (test.strategyVariantBName || test.strategyName || "-") : "-",
      testType: test.testDesignLabel || "Zaman Serisi (Sequential) Testi"
    };
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
                YZ Akıllı Fiyatlandırma, rakip ürün bilgilerini ve Google Trends sinyallerini tek akışta toplayıp hangi ürünün aksiyon istediğini ilk bakışta görünür hale getirir.
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

  function renderAbCreateModal() {
    if (!elements.abCreateModalRoot) return;

    if (!state.abCreateModal.open) {
      elements.abCreateModalRoot.innerHTML = "";
      syncOverlayState();
      return;
    }

    const selectedProductId = state.abCreateModal.selectedProductId;
    const selectedStrategyAId = state.abCreateModal.selectedStrategyAId;
    const selectedStrategyBId = state.abCreateModal.selectedStrategyBId;
    const selectedTestTypeId = state.abCreateModal.selectedTestTypeId;
    const sameStrategySelected = selectedStrategyAId && selectedStrategyAId === selectedStrategyBId;
    const canStart = Boolean(selectedProductId && selectedStrategyAId && selectedStrategyBId && selectedTestTypeId && !sameStrategySelected);

    elements.abCreateModalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-ab-create="1">
        <section class="modal-card ab-create-modal" role="dialog" aria-modal="true" aria-labelledby="ab-create-title">
          <div class="ab-create-head">
            <div>
              <p class="modal-eyebrow">A/B Deney Kurulumu</p>
              <h2 id="ab-create-title" class="ab-create-title">Yeni Deney Başlat</h2>
              <p class="ab-create-text">Mevcut ürünlerden birini seçin, stratejiyi karttan belirleyin ve testi canlıya alın.</p>
            </div>
            <button class="icon-button" type="button" aria-label="Kapat" data-close-ab-create="1">×</button>
          </div>

          <form id="ab-create-form" class="ab-create-form">
            <div class="field">
              <label for="ab-create-product">Ürün Seç</label>
              <select id="ab-create-product" name="productId" data-ab-create-product required>
                ${state.products.map((product) => {
                  const selected = product.id === selectedProductId ? "selected" : "";
                  return `<option value="${escapeAttribute(product.id)}" ${selected}>${escapeHtml(product.name)} • ${escapeHtml(product.category)} • ${formatMoney(product.currentPrice)}</option>`;
                }).join("")}
              </select>
            </div>

            <div class="ab-create-strategy-wrap">
              <p class="ab-create-strategy-label">Varyant A Stratejisi</p>
              <div class="ab-create-strategy-grid">
                ${AB_CREATE_STRATEGIES.map((strategy) => renderAbCreateStrategyCard(strategy, strategy.id === selectedStrategyAId, "a")).join("")}
              </div>
            </div>

            <div class="ab-create-strategy-wrap">
              <p class="ab-create-strategy-label">Varyant B Stratejisi</p>
              <div class="ab-create-strategy-grid">
                ${AB_CREATE_STRATEGIES.map((strategy) => renderAbCreateStrategyCard(strategy, strategy.id === selectedStrategyBId, "b")).join("")}
              </div>
            </div>

            <div class="ab-create-testtype-wrap">
              <p class="ab-create-strategy-label">Test Türü Seç</p>
              <div class="ab-create-testtype-grid">
                ${AB_CREATE_TEST_TYPES.map((typeItem) => renderAbCreateTestTypeCard(typeItem, typeItem.id === selectedTestTypeId)).join("")}
              </div>
            </div>

            ${sameStrategySelected ? `<p class="helper-text">Varyant A ve Varyant B için farklı stratejiler seçin.</p>` : ""}

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-ab-create="1">Vazgeç</button>
              <button class="primary-button" type="submit" ${canStart ? "" : "disabled"}>Başlat</button>
            </div>
          </form>
        </section>
      </div>
    `;
    syncOverlayState();
  }

  function renderAbCreateStrategyCard(strategy, isSelected, slot) {
    return `
      <button class="ab-create-strategy ${isSelected ? "is-selected" : ""}" type="button" data-ab-create-strategy="${escapeAttribute(strategy.id)}" data-ab-create-strategy-slot="${escapeAttribute(slot)}" aria-pressed="${isSelected ? "true" : "false"}">
        <span class="ab-create-strategy__title">${escapeHtml(strategy.name)}</span>
        <span class="ab-create-strategy__summary">${escapeHtml(strategy.summary)}</span>
      </button>
    `;
  }

  function renderAbCreateTestTypeCard(typeItem, isSelected) {
    return `
      <button class="ab-create-testtype ${isSelected ? "is-selected" : ""}" type="button" data-ab-create-test-type="${escapeAttribute(typeItem.id)}" aria-pressed="${isSelected ? "true" : "false"}">
        <span class="ab-create-testtype__title">${escapeHtml(typeItem.name)}</span>
        <span class="ab-create-testtype__summary">${escapeHtml(typeItem.summary)}</span>
      </button>
    `;
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

    if (event.target.matches("[data-close-ab-create]")) {
      closeAbCreateModal();
      return;
    }

    if (event.target.closest("[data-intro-add-product]")) {
      closeIntroModal();
      openAddDrawer();
      return;
    }

    if (event.target.closest("[data-open-ab-create]")) {
      openAbCreateModal();
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

    const abCreateStrategyTrigger = event.target.closest("[data-ab-create-strategy]");
    if (abCreateStrategyTrigger) {
      const selectedStrategyId = String(abCreateStrategyTrigger.dataset.abCreateStrategy || "");
      const slot = String(abCreateStrategyTrigger.dataset.abCreateStrategySlot || "a");
      if (slot === "b") {
        state.abCreateModal.selectedStrategyBId = selectedStrategyId;
      } else {
        state.abCreateModal.selectedStrategyAId = selectedStrategyId;
      }
      renderAbCreateModal();
      return;
    }

    const abCreateTestTypeTrigger = event.target.closest("[data-ab-create-test-type]");
    if (abCreateTestTypeTrigger) {
      state.abCreateModal.selectedTestTypeId = String(abCreateTestTypeTrigger.dataset.abCreateTestType || "");
      renderAbCreateModal();
      return;
    }

    if (event.target.closest("[data-apply-strategy]")) {
      applyDynamicPricingStrategy();
      return;
    }

    if (event.target.closest("[data-apply-insight]")) {
      showToast("YZ önerisi uygulandı.");
      return;
    }

    if (event.target.closest("[data-discard-insight]")) {
      showToast("YZ önerisi geçici olarak yok sayıldı.");
      return;
    }

    const applyRecommendationTrigger = event.target.closest("[data-apply-recommendation]");
    if (applyRecommendationTrigger) {
      const product = getProductById(applyRecommendationTrigger.dataset.applyRecommendation);
      showToast(product ? `${product.name} için YZ önerisi uygulandı.` : "YZ önerisi uygulandı.");
      return;
    }

    const discardRecommendationTrigger = event.target.closest("[data-discard-recommendation]");
    if (discardRecommendationTrigger) {
      const product = getProductById(discardRecommendationTrigger.dataset.discardRecommendation);
      showToast(product ? `${product.name} için YZ önerisi geçici olarak yok sayıldı.` : "YZ önerisi geçici olarak yok sayıldı.");
      return;
    }

    const applyHighlightTrigger = event.target.closest("[data-apply-highlight]");
    if (applyHighlightTrigger) {
      const product = getProductById(applyHighlightTrigger.dataset.applyHighlight);
      showToast(product ? `${product.name} için aksiyon uygulandı.` : "Aksiyon uygulandı.");
      return;
    }

    const discardHighlightTrigger = event.target.closest("[data-discard-highlight]");
    if (discardHighlightTrigger) {
      const product = getProductById(discardHighlightTrigger.dataset.discardHighlight);
      showToast(product ? `${product.name} için aksiyon atlandı.` : "Aksiyon atlandı.");
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
      const testId = abActionTrigger.dataset.abTest || null;
      if (testId && state.abTesting.tests.some((item) => item.id === testId)) {
        state.abTesting.selectedTestId = testId;
      }

      const action = abActionTrigger.dataset.abAction;
      if (action === "toggle-run") {
        toggleAbTestStatus(testId);
      } else if (action === "apply-winner") {
        applyAbWinner(testId);
      } else if (action === "clone-test") {
        cloneAbTest(testId);
      }
      return;
    }

    if (event.target.closest("[data-ab-back]")) {
      navigateBackFromAbDetail();
      return;
    }

    const abDetailTrigger = event.target.closest("[data-ab-open-detail]");
    if (abDetailTrigger) {
      openAbTestDetail(abDetailTrigger.dataset.abOpenDetail);
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
    if (event.target.id === "ab-create-form") {
      event.preventDefault();
      startAbCreateExperiment();
      return;
    }

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
      if (state.abCreateModal.open) {
        closeAbCreateModal();
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

    if (event.target.matches("[data-ab-status-filter]")) {
      state.abTesting.statusFilter = String(event.target.value || "all");
      renderWorkspace();
      return;
    }

    if (event.target.matches("[data-recommendation-type-filter]")) {
      state.recommendations.typeFilter = String(event.target.value || "all");
      renderWorkspace();
      return;
    }

    if (event.target.matches("[data-recommendation-priority-filter]")) {
      state.recommendations.priorityFilter = String(event.target.value || "all");
      renderWorkspace();
      return;
    }

    if (event.target.matches("[data-ab-create-product]")) {
      state.abCreateModal.selectedProductId = String(event.target.value || "");
      renderAbCreateModal();
    }
  }

  function handleInput(event) {
    if (event.target.matches("[data-ab-search]")) {
      state.abTesting.searchQuery = String(event.target.value || "");
      renderWorkspace();
      return;
    }

    if (event.target.matches("[data-recommendation-search]")) {
      state.recommendations.searchQuery = String(event.target.value || "");
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
    setIntroSeen();
    renderIntroModal();
  }

  function openAbCreateModal() {
    if (!state.products.length) {
      showToast("Deney başlatmak için önce en az bir ürün ekleyin.");
      return;
    }

    if (!state.products.some((item) => item.id === state.abCreateModal.selectedProductId)) {
      state.abCreateModal.selectedProductId = state.products[0].id;
    }

    if (!AB_CREATE_STRATEGIES.some((item) => item.id === state.abCreateModal.selectedStrategyAId)) {
      state.abCreateModal.selectedStrategyAId = AB_CREATE_STRATEGIES[0] ? AB_CREATE_STRATEGIES[0].id : null;
    }

    if (!AB_CREATE_STRATEGIES.some((item) => item.id === state.abCreateModal.selectedStrategyBId)) {
      state.abCreateModal.selectedStrategyBId = AB_CREATE_STRATEGIES[1] ? AB_CREATE_STRATEGIES[1].id : (AB_CREATE_STRATEGIES[0] ? AB_CREATE_STRATEGIES[0].id : null);
    }

    if (!AB_CREATE_TEST_TYPES.some((item) => item.id === state.abCreateModal.selectedTestTypeId)) {
      state.abCreateModal.selectedTestTypeId = AB_CREATE_TEST_TYPES[0] ? AB_CREATE_TEST_TYPES[0].id : null;
    }

    state.abCreateModal.open = true;
    renderAbCreateModal();
  }

  function closeAbCreateModal() {
    state.abCreateModal.open = false;
    renderAbCreateModal();
  }

  function startAbCreateExperiment() {
    const product = getProductById(state.abCreateModal.selectedProductId);
    const strategyA = AB_CREATE_STRATEGIES.find((item) => item.id === state.abCreateModal.selectedStrategyAId) || null;
    const strategyB = AB_CREATE_STRATEGIES.find((item) => item.id === state.abCreateModal.selectedStrategyBId) || null;
    const testType = AB_CREATE_TEST_TYPES.find((item) => item.id === state.abCreateModal.selectedTestTypeId) || null;

    if (!product || !strategyA || !strategyB || !testType) {
      showToast("Deneyi başlatmak için ürün, strateji ve test türü seçimi zorunlu.");
      return;
    }

    if (strategyA.id === strategyB.id) {
      showToast("Varyant A ve Varyant B için farklı stratejiler seçin.");
      return;
    }

    const now = new Date();
    const startedAt = now.toISOString().slice(0, 10);
    const basePrice = Number(product.currentPrice) || 0;
    const variantAPrice = getAbCreateVariantPrice(basePrice, strategyA.id);
    const variantBPrice = getAbCreateVariantPrice(basePrice, strategyB.id);
    const targetKpi = getAbCreateTargetKpi(strategyA.id);

    const newTest = {
      id: `ab-${Date.now()}`,
      name: `${product.name} ${strategyA.name} vs ${strategyB.name}`,
      productName: product.name,
      strategyName: `${strategyA.name} vs ${strategyB.name}`,
      strategyVariantAName: strategyA.name,
      strategyVariantBName: strategyB.name,
      testDesignTypeId: testType.id,
      testDesignLabel: testType.name,
      category: product.category,
      categoryDetail: `Kategori: ${product.category}`,
      cardTone: "running",
      monthlyContribution: 0,
      sampleCollected: 0,
      sampleTarget: 1000,
      remainingDays: 7,
      targetLabel: product.name,
      targetKpi,
      status: "Çalışıyor",
      startedAt,
      significance: 0,
      trafficSplit: "50/50",
      guardrails: {
        minMarginRate: 15,
        maxPriceChange: 12,
        minStock: 20,
        autoStop: true
      },
      alerts: [
        `${testType.name} ile deney başlatıldı. İlk anlamlı örneklem oluşana kadar varyantlar izleniyor.`
      ],
      variants: [
        {
          id: "variant-a",
          label: `Varyant A (${strategyA.name})`,
          price: variantAPrice,
          sessions: 0,
          orders: 0,
          revenue: 0,
          marginRate: 0.22
        },
        {
          id: "variant-b",
          label: `Varyant B (${strategyB.name})`,
          price: variantBPrice,
          sessions: 0,
          orders: 0,
          revenue: 0,
          marginRate: 0.2
        }
      ]
    };

    state.abTesting.tests.unshift(newTest);
    state.abTesting.selectedTestId = newTest.id;
    closeAbCreateModal();
    renderWorkspace();
    showToast("Yeni A/B deneyi başlatıldı.");
  }

  function openAbTestDetail(testId) {
    if (testId && state.abTesting.tests.some((item) => item.id === testId)) {
      state.abTesting.selectedTestId = testId;
    }
    window.location.hash = `#${ROUTES.abTestingDetail}`;
  }

  function navigateBackFromAbDetail() {
    const currentHash = window.location.hash;
    if (window.history.length > 1) {
      window.history.back();
      window.setTimeout(() => {
        if (window.location.hash === currentHash) {
          window.location.hash = `#${ROUTES.abTesting}`;
        }
      }, 120);
      return;
    }

    window.location.hash = `#${ROUTES.abTesting}`;
  }

  function syncOverlayState() {
    document.body.classList.toggle("drawer-open", state.drawer.open);
    document.body.classList.toggle("overlay-open", state.drawer.open || state.introModalOpen || state.abCreateModal.open);
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

  function getAbCreateVariantPrice(basePrice, strategyId) {
    const numericPrice = Number(basePrice) || 0;
    if (numericPrice <= 0) return 0;

    if (strategyId === "psych-threshold") {
      const discounted = Math.max(1, Math.round(numericPrice * 0.97));
      const threshold = Math.floor(discounted / 10) * 10 + 9;
      return Math.max(1, threshold);
    }

    if (strategyId === "margin-vs-volume") {
      return Math.max(1, Math.round(numericPrice * 1.035));
    }

    if (strategyId === "competitive-response") {
      return Math.max(1, Math.round(numericPrice * 0.95));
    }

    return numericPrice;
  }

  function getAbCreateTargetKpi(strategyId) {
    if (strategyId === "psych-threshold") return "Dönüşüm oranı";
    if (strategyId === "margin-vs-volume") return "Ziyaretçi başı gelir";
    if (strategyId === "competitive-response") return "Rekabet kazanım oranı";
    return "Ziyaretçi başı gelir";
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
          reason: product.aiSuggestionText,
          impactKind: isMarginRisk ? "opportunity" : "risk",
          impactLabel: isMarginRisk
            ? `${formatMoney(product.estimatedProfitUplift)} fırsat`
            : `${formatMoney(product.estimatedLostRevenue)} risk`
        };
      });
  }

  function getFilteredRecommendationRows() {
    const search = normalizeSearch(state.recommendations.searchQuery);
    const typeFilter = state.recommendations.typeFilter;
    const priorityFilter = state.recommendations.priorityFilter;

    return getRecommendationRows().filter((item) => {
      const searchable = normalizeSearch(`${item.name} ${item.sku} ${item.category} ${item.reason} ${item.type}`);
      const matchesSearch = !search || searchable.includes(search);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      return matchesSearch && matchesType && matchesPriority;
    });
  }

  function getDashboardActionHighlights() {
    return state.products
      .filter((item) => item.status !== "Dengede")
      .sort((a, b) => (Number(b.estimatedLostRevenue) || 0) - (Number(a.estimatedLostRevenue) || 0))
      .slice(0, 3)
      .map((item) => ({
        ...item,
        impactLabel: getDashboardActionImpactLabel(item)
      }));
  }

  function getDashboardActionImpactLabel(item) {
    const lostRevenue = Number(item.estimatedLostRevenue) || 0;
    const profitUplift = Number(item.estimatedProfitUplift) || 0;

    if (item.status === "Marj Riski" && profitUplift === 24500) {
      return "24 500 fırsatı yakala";
    }

    if (item.status !== "Marj Riski" && lostRevenue === 48000) {
      return "48 000 riski önle";
    }

    if (item.status !== "Marj Riski" && lostRevenue === 27000) {
      return "27 000 riski önle";
    }

    return item.status === "Marj Riski"
      ? `${formatMoney(item.estimatedProfitUplift)} fırsat`
      : `${formatMoney(item.estimatedLostRevenue)} risk`;
  }

  function getRecommendationVisualTone(item) {
    if (item.type === "İndirim") return "discount";
    if (item.type === "Artış") return "growth";
    return "keep";
  }

  function getRecommendationIconName(item) {
    if (item.type === "İndirim") return "discount";
    if (item.type === "Artış") return "growth";
    return "shield";
  }

  function ensureAbTestingSelection() {
    if (!state.abTesting.tests.length) {
      state.abTesting.selectedTestId = null;
      return;
    }

    if (!state.abTesting.tests.some((item) => item.id === state.abTesting.selectedTestId)) {
      state.abTesting.selectedTestId = state.abTesting.tests[0].id;
    }
  }

  function getSelectedAbTest() {
    return state.abTesting.tests.find((item) => item.id === state.abTesting.selectedTestId) || null;
  }

  function getAbTestById(testId) {
    if (!testId) return null;
    return state.abTesting.tests.find((item) => item.id === testId) || null;
  }

  function getFilteredAbTests() {
    const search = normalizeSearch(state.abTesting.searchQuery);
    const filter = state.abTesting.statusFilter;

    return state.abTesting.tests.filter((test) => {
      const tone = getAbCardTone(test);
      const searchable = normalizeSearch(`${test.name} ${test.productName} ${test.strategyName} ${test.category} ${test.targetLabel} ${test.testDesignLabel || ""}`);
      const matchesSearch = !search || searchable.includes(search);
      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "winner") return tone === "winner";
      if (filter === "running") return tone === "running";
      if (filter === "critical") return tone === "critical";
      return true;
    });
  }

  function getAbAvatarTone(test) {
    const haystack = normalizeSearch(`${test.productName || ""} ${test.category || ""} ${test.categoryDetail || ""}`);
    if (haystack.includes("ses") || haystack.includes("kulak")) return "audio";
    if (haystack.includes("tekstil") || haystack.includes("t-shirt") || haystack.includes("giyim")) return "style";
    if (haystack.includes("laptop") || haystack.includes("bilgisayar")) return "device";
    return "general";
  }

  function getAbAvatarLabel(test) {
    const tone = getAbAvatarTone(test);
    if (tone === "audio") return "SES";
    if (tone === "style") return "MOD";
    if (tone === "device") return "PC";
    return "YZ";
  }

  function renderUiIcon(name) {
    const icons = {
      spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14zM6 15l1.2 2.8L10 19l-2.8 1.2L6 23l-1.2-2.8L2 19l2.8-1.2L6 15z" fill="currentColor"/></svg>`,
      list: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5A1.5 1.5 0 1 1 5 4.5a1.5 1.5 0 0 1 0 3zm4 0V4.5h10v3H9zm-4 6A1.5 1.5 0 1 1 5 10.5a1.5 1.5 0 0 1 0 3zm4 0v-3h10v3H9zm-4 6A1.5 1.5 0 1 1 5 16.5a1.5 1.5 0 0 1 0 3zm4 0v-3h10v3H9z" fill="currentColor"/></svg>`,
      discount: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h7l7 7-9 9-7-7V4zm3 4.2A1.8 1.8 0 1 0 9 4.6a1.8 1.8 0 0 0 0 3.6z" fill="currentColor"/></svg>`,
      growth: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17.5h4.5l4.2-5.2 3.4 3.4L21 9.8V15h2V6h-9v2h5.2l-3 3-3.6-3.6L7.6 15.5H4v2z" fill="currentColor"/></svg>`,
      search: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm8.9 11.5L23 21.1 21.1 23l-3.6-3.6 1.9-1.9z" fill="currentColor"/></svg>`,
      switch: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h13l-3-3 1.4-1.4L24 8l-5.6 5.4L17 12l3-3H7V7zm10 8H4l3 3-1.4 1.4L0 14l5.6-5.4L7 10l-3 3h13v2z" fill="currentColor"/></svg>`,
      experiment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2h6v2l-1.5 2.3V10l4.8 7.3A3 3 0 0 1 15.8 22H8.2a3 3 0 0 1-2.5-4.7L10.5 10V6.3L9 4V2zm2 4.9V10L7.4 15.4h9.2L13 10V6.9l.8-1.2h-3.6l.8 1.2z" fill="currentColor"/></svg>`,
      priority: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l9 16H3L12 2zm0 5.2L6.6 16h10.8L12 7.2zM11 10h2v3h-2v-3zm0 4h2v2h-2v-2z" fill="currentColor"/></svg>`,
      grid: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor"/></svg>`,
      shield: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z" fill="currentColor"/></svg>`
    };

    return icons[name] || icons.spark;
  }

  function getAbCardTone(test) {
    if (test.cardTone === "winner" || test.cardTone === "running" || test.cardTone === "critical") {
      return test.cardTone;
    }
    if (test.criticalReason) return "critical";

    const decision = getAbDecision(test);
    if (decision.canApply || (test.status === "Tamamlandı" && test.appliedWinnerId)) return "winner";
    return "running";
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
    const hasControl = Boolean(control);
    const eligibleRows = rows
      .filter((item) => item.marginRate * 100 >= test.guardrails.minMarginRate)
      .sort((a, b) => b.rpv - a.rpv);

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
        reason: `Test sonucu uygulandı. YZ güven skoru %${test.significance} olarak kaydedildi.`,
        winnerId: test.appliedWinnerId,
        canApply: false
      };
    }

    if (test.significance < 90) {
      return {
        tone: "is-warning",
        title: "Testi sürdür",
        reason: `YZ güven skoru %${test.significance}. Karar için önerilen eşik %90.`,
        winnerId: null,
        canApply: false
      };
    }

    if (!hasControl) {
      if (eligibleRows.length < 2) {
        return {
          tone: "is-neutral",
          title: "Varyantları izlemeye devam et",
          reason: "Marj eşiğini geçen iki varyant oluşmadan kazanan önerisi verilemez.",
          winnerId: null,
          canApply: false
        };
      }

      const best = eligibleRows[0];
      const runnerUp = eligibleRows[1];
      const upliftAgainstRunner = runnerUp.rpv > 0 ? (best.rpv - runnerUp.rpv) / runnerUp.rpv : 0;

      if (upliftAgainstRunner <= 0) {
        return {
          tone: "is-neutral",
          title: "Varyantlar benzer performansta",
          reason: "A ve B varyantları arasında anlamlı bir fark oluşmadı. Testi sürdürerek örneklem toplanabilir.",
          winnerId: null,
          canApply: false
        };
      }

      return {
        tone: "is-positive",
        title: `${best.label} varyantını yayına al`,
        reason: `${best.label}, ${runnerUp.label} varyantına göre ${formatPercent(upliftAgainstRunner)} daha yüksek ziyaretçi başı gelir üretti. YZ güven skoru: %${test.significance}.`,
        winnerId: best.id,
        canApply: true
      };
    }

    const candidates = eligibleRows
      .filter((item) => item.id !== "control")
      .sort((a, b) => b.uplift - a.uplift);
    const winner = candidates[0] || null;

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
      reason: `${winner.label}, kontrol varyantına göre ${formatPercent(winner.uplift)} daha yüksek ziyaretçi başı gelir üretti. YZ güven skoru: %${test.significance}.`,
      winnerId: winner.id,
      canApply: true
    };
  }

  function toggleAbTestStatus(testId) {
    const test = getAbTestById(testId) || getSelectedAbTest();
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

  function applyAbWinner(testId) {
    const test = getAbTestById(testId) || getSelectedAbTest();
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

  function cloneAbTest(testId) {
    const test = getAbTestById(testId) || getSelectedAbTest();
    if (!test) return;

    const cloned = clone(test);
    cloned.id = `ab-${Date.now()}`;
    cloned.name = `${test.name} (Klon)`;
    cloned.status = "Durduruldu";
    cloned.significance = 0;
    cloned.appliedWinnerId = null;
    cloned.alerts = ["Klon test hazır. Parametreleri kontrol edip başlatın."];
    cloned.cardTone = "running";
    cloned.monthlyContribution = 0;
    cloned.sampleCollected = 0;
    cloned.sampleTarget = cloned.sampleTarget || 1000;
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
    if (strategyId === "stay-competitive") return renderUiIcon("switch");
    if (strategyId === "maximize-margin") return renderUiIcon("growth");
    if (strategyId === "clear-stock") return renderUiIcon("discount");
    return renderUiIcon("spark");
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

  function formatSignedPercent(value) {
    const numeric = Number(value) || 0;
    const sign = numeric > 0 ? "+" : numeric < 0 ? "-" : "";
    const formatted = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(Math.abs(numeric) * 100);
    return `${sign}%${formatted}`;
  }

  function formatSignedMoney(value) {
    const numeric = Number(value) || 0;
    const sign = numeric > 0 ? "+" : numeric < 0 ? "-" : "";
    return `${sign}${formatMoney(Math.abs(numeric))}`;
  }

  function getInitials(text) {
    const parts = String(text || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "AB";
    if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
    return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase("tr-TR");
  }

  function normalizeSearch(value) {
    return String(value || "")
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
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

  function syncPageTitle() {
    document.title = ROUTE_TITLES[state.route] || "YZ Akıllı Fiyatlandırma";
  }

  function syncIntroModalAvailability() {
    state.introModalOpen = state.route === ROUTES.dashboard && !hasSeenIntro();
  }

  function hasSeenIntro() {
    try {
      return window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === "1";
    } catch (error) {
      return true;
    }
  }

  function setIntroSeen() {
    try {
      window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, "1");
    } catch (error) {
      return;
    }
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
