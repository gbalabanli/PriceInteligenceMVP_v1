import { messages } from "./i18n.js";
import { mockData } from "./data.js";

const DEFAULT_ROUTE = "/dashboard";
const STORAGE_KEYS = {
  locale: "price-intelligence.locale",
  preferences: "price-intelligence.preferences"
};

const ROUTES = {
  dashboard: "/dashboard",
  monitoring: "/price-monitoring",
  recommendations: "/yz-fiyat-onerileri",
  dynamic: "/dynamic-pricing",
  ab: "/ab-testing",
  productDetail: "/product-detail",
  settings: "/settings",
  scenario: "/scenario-lab"
};

const baseline = createBaselineState();
const state = {
  locale: readStoredLocale(),
  route: DEFAULT_ROUTE,
  searchText: "",
  selectedProductId: baseline.products[0]?.id ?? null,
  lastRegularRoute: DEFAULT_ROUTE,
  scenario: { active: "normal" },
  monitoring: { risk: "all", sort: "risk-desc", selectedIds: [] },
  recommendations: { tab: "pending", selectedIds: [] },
  dynamic: {
    mode: "manual",
    running: false,
    guardrailsOnly: false,
    previewId: null,
    appliedStack: [],
    candidates: []
  },
  ab: { range: "30d" },
  settings: {
    locale: readStoredLocale(),
    currency: "TRY",
    compactMode: false
  },
  data: {
    products: clone(baseline.products),
    recommendations: clone(baseline.recommendations),
    notesByProductId: {},
    experiments: clone(baseline.experiments)
  },
  confirm: {
    isOpen: false,
    messageKey: "",
    onConfirm: null
  }
};

state.dynamic.candidates = buildSimulationCandidates(state.data.products);
state.dynamic.previewId = state.dynamic.candidates[0]?.id ?? null;

const elements = {
  content: document.getElementById("content"),
  toast: document.getElementById("toast"),
  search: document.getElementById("search-input"),
  confirmModal: document.getElementById("confirm-modal"),
  confirmTitle: document.getElementById("confirm-title"),
  confirmMessage: document.getElementById("confirm-message")
};

bootstrap();

function bootstrap() {
  if (elements.search) {
    elements.search.addEventListener("input", (event) => {
      state.searchText = event.target.value.trim().toLowerCase();
      render();
    });
  }

  window.addEventListener("hashchange", syncRouteFromHash);
  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);

  syncRouteFromHash();
  applyLocalizationToStaticNodes();
  render();
}

function syncRouteFromHash() {
  const hash = window.location.hash.replace(/^#/, "") || DEFAULT_ROUTE;
  const normalized = hash.startsWith("/") ? hash : `/${hash}`;
  state.route = isKnownRoute(normalized) ? normalized : DEFAULT_ROUTE;
  if (!window.location.hash) {
    window.location.hash = `#${state.route}`;
  }
  if (isRegularRoute(state.route)) {
    state.lastRegularRoute = state.route;
  }
  render();
}

function isKnownRoute(route) {
  return Object.values(ROUTES).includes(route);
}

function isRegularRoute(route) {
  return (
    route !== ROUTES.settings &&
    route !== ROUTES.scenario &&
    route !== ROUTES.productDetail
  );
}

function onClick(event) {
  const target = event.target.closest("button, [data-action], [data-route]");
  if (!target) return;

  const route = target.dataset.route;
  if (route) {
    window.location.hash = `#${route}`;
    return;
  }

  const locale = target.dataset.locale;
  if (locale) {
    setLocale(locale);
    return;
  }

  const action = target.dataset.action;
  if (!action) return;
  handleAction(action, target);
}

function onChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

  if (target.id === "monitor-risk") {
    state.monitoring.risk = target.value;
    return;
  }
  if (target.id === "monitor-sort") {
    state.monitoring.sort = target.value;
    return;
  }
  if (target.id === "ab-range") {
    state.ab.range = target.value;
    return;
  }
  if (target.id === "settings-locale") {
    state.settings.locale = target.value;
    return;
  }
  if (target.id === "settings-currency") {
    state.settings.currency = target.value;
    return;
  }
  if (target.id === "settings-compact") {
    state.settings.compactMode = target.checked;
    return;
  }

  if (target.dataset.selectRecoId) {
    toggleInList(state.recommendations.selectedIds, Number(target.dataset.selectRecoId), target.checked);
    return;
  }
  if (target.dataset.selectProductId) {
    toggleInList(state.monitoring.selectedIds, Number(target.dataset.selectProductId), target.checked);
  }
}

function handleAction(action, node) {
  switch (action) {
    case "go-monitoring":
      window.location.hash = `#${ROUTES.monitoring}`;
      break;
    case "go-recommendations":
      state.recommendations.tab = "pending";
      window.location.hash = `#${ROUTES.recommendations}`;
      break;
    case "open-product":
      state.selectedProductId = Number(node.dataset.productId);
      window.location.hash = `#${ROUTES.productDetail}`;
      break;
    case "back-dashboard":
      window.location.hash = `#${ROUTES.dashboard}`;
      break;
    case "confirm-cancel":
      closeConfirm();
      break;
    case "confirm-accept":
      if (typeof state.confirm.onConfirm === "function") {
        state.confirm.onConfirm();
      }
      closeConfirm();
      break;
    default:
      handlePageAction(action, node);
      break;
  }
}

function setLocale(locale) {
  if (!messages[locale] || state.locale === locale) return;
  state.locale = locale;
  state.settings.locale = locale;
  localStorage.setItem(STORAGE_KEYS.locale, locale);
  applyLocalizationToStaticNodes();
  showToast(t("toast.languageChanged"));
  render();
}

function applyLocalizationToStaticNodes() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  });

  if (elements.search) {
    elements.search.placeholder = t("header.searchPlaceholder");
  }
}

function render() {
  applyLocalizationToStaticNodes();
  setActiveMenu();
  setActiveLanguageButtons();
  renderConfirmModal();

  if (!elements.content) return;
  elements.content.innerHTML = renderCurrentPage();
}

function renderCurrentPage() {
  switch (state.route) {
    case ROUTES.dashboard:
      return renderDashboardPage();
    case ROUTES.monitoring:
      return renderMonitoringPage();
    case ROUTES.recommendations:
      return renderRecommendationsPage();
    case ROUTES.dynamic:
      return renderDynamicPage();
    case ROUTES.ab:
      return renderABPage();
    case ROUTES.productDetail:
      return renderProductDetailPage();
    case ROUTES.settings:
      return renderSettingsPage();
    case ROUTES.scenario:
      return renderScenarioPage();
    default:
      return renderDashboardPage();
  }
}

function renderDashboardPage() {
  const products = getVisibleProducts();
  const critical = products.filter((p) => p.status !== "ok");
  const pendingCount = state.data.recommendations.filter((item) => item.status === "pending").length;

  const highLoss = products.filter((p) => p.currentPrice > p.competitorMin).length;
  const lowMargin = products.filter((p) => p.currentPrice < p.competitorMin).length;
  const estimatedGain = state.data.recommendations
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + Math.max(0, r.suggestedPrice - r.currentPrice), 0);

  return `
    ${renderPageHeader("page.dashboard.title", "page.dashboard.subtitle")}
    <section class="kpi-grid">
      ${renderKpiCard("page.dashboard.kpi.tracked", String(products.length))}
      ${renderKpiCard("page.dashboard.kpi.highPriceLoss", String(highLoss), "red")}
      ${renderKpiCard("page.dashboard.kpi.lowMarginLoss", String(lowMargin), "yellow")}
      ${renderKpiCard("page.dashboard.kpi.estimatedGain", formatMoney(estimatedGain), "green")}
    </section>

    <section class="card">
      <h3 class="card-title">${t("page.dashboard.criticalList")}</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${t("page.monitoring.table.product")}</th>
              <th>${t("page.monitoring.table.currentPrice")}</th>
              <th>${t("page.monitoring.table.competitorMin")}</th>
              <th>${t("page.monitoring.table.status")}</th>
              <th>${t("page.monitoring.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            ${critical.length ? critical.map((product) => renderProductTableRow(product)).join("") : renderEmptyRow(5)}
          </tbody>
        </table>
      </div>
      <div class="btn-row">
        <button class="btn secondary" data-action="go-monitoring">${t("page.dashboard.viewCritical")}</button>
        <button class="btn primary" data-action="go-recommendations">${t("page.dashboard.openSuggestions")} (${pendingCount})</button>
        <button class="btn secondary" data-action="reset-demo">${t("page.dashboard.resetDemo")}</button>
      </div>
    </section>

    <section class="card" style="margin-top:12px;">
      <h3 class="card-title">${t("page.dashboard.lastActions")}</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${t("page.monitoring.table.product")}</th>
              <th>${t("page.monitoring.table.aiPrice")}</th>
              <th>${t("page.monitoring.table.status")}</th>
              <th>${t("page.monitoring.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            ${state.data.recommendations.slice(0, 5).map((item) => renderRecommendationCompactRow(item)).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderMonitoringPage() {
  const products = getMonitoringProducts();
  return `
    ${renderPageHeader("page.monitoring.title", "page.monitoring.subtitle", true)}
    <section class="card">
      <div class="toolbar">
        <div class="toolbar-left">
          <label class="muted" for="monitor-risk">${t("page.monitoring.filterRisk")}</label>
          <select id="monitor-risk" class="select">
            <option value="all" ${selectedIf(state.monitoring.risk, "all")}>${t("common.all")}</option>
            <option value="high" ${selectedIf(state.monitoring.risk, "high")}>${t("status.highRisk")}</option>
            <option value="low" ${selectedIf(state.monitoring.risk, "low")}>${t("status.lowMargin")}</option>
            <option value="ok" ${selectedIf(state.monitoring.risk, "ok")}>${t("status.competitive")}</option>
          </select>

          <label class="muted" for="monitor-sort">${t("page.monitoring.sortBy")}</label>
          <select id="monitor-sort" class="select">
            <option value="risk-desc" ${selectedIf(state.monitoring.sort, "risk-desc")}>${t("sort.riskDesc")}</option>
            <option value="price-asc" ${selectedIf(state.monitoring.sort, "price-asc")}>${t("sort.priceAsc")}</option>
            <option value="price-desc" ${selectedIf(state.monitoring.sort, "price-desc")}>${t("sort.priceDesc")}</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn secondary" data-action="apply-monitor-filters">${t("page.monitoring.applyFilters")}</button>
          <button class="btn secondary" data-action="clear-monitor-filters">${t("page.monitoring.clearFilters")}</button>
          <button class="btn primary" data-action="send-monitoring-to-reco">${t("page.monitoring.sendToAi")}</button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>${t("page.monitoring.table.product")}</th>
              <th>${t("page.monitoring.table.currentPrice")}</th>
              <th>${t("page.monitoring.table.competitorMin")}</th>
              <th>${t("page.monitoring.table.aiPrice")}</th>
              <th>${t("page.monitoring.table.status")}</th>
              <th>${t("page.monitoring.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            ${products.length ? products.map((product) => renderMonitoringRow(product)).join("") : renderEmptyRow(7)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderRecommendationsPage() {
  const list = getRecommendationsByTab();
  return `
    ${renderPageHeader("page.reco.title", "page.reco.subtitle", true)}
    <section class="card">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="tabs">
            <button class="tab-btn ${state.recommendations.tab === "pending" ? "active" : ""}" data-action="set-reco-tab" data-tab="pending">${t("page.reco.tabPending")}</button>
            <button class="tab-btn ${state.recommendations.tab === "processed" ? "active" : ""}" data-action="set-reco-tab" data-tab="processed">${t("page.reco.tabProcessed")}</button>
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn secondary" data-action="toggle-reco-filter">${t("common.filter")}</button>
          <button class="btn secondary" data-action="approve-all-visible">${t("page.reco.applyAll")}</button>
          <button class="btn secondary" data-action="approve-selected-reco">${t("page.reco.approveSelected")}</button>
          <button class="btn secondary" data-action="reject-selected-reco">${t("page.reco.rejectSelected")}</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>${t("page.monitoring.table.product")}</th>
              <th>${t("page.monitoring.table.currentPrice")}</th>
              <th>${t("page.monitoring.table.aiPrice")}</th>
              <th>${t("page.product.reason")}</th>
              <th>${t("page.monitoring.table.status")}</th>
              <th>${t("page.monitoring.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            ${list.length ? list.map((item) => renderRecommendationRow(item)).join("") : renderEmptyRow(7)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDynamicPage() {
  const allCandidates = state.dynamic.candidates.filter((item) => item.mode === state.dynamic.mode);
  const visibleCandidates = state.dynamic.guardrailsOnly
    ? allCandidates.filter((item) => item.guardrailHits > 0)
    : allCandidates;
  const preview = visibleCandidates.find((item) => item.id === state.dynamic.previewId) ?? visibleCandidates[0] ?? null;

  return `
    ${renderPageHeader("page.dynamic.title", "page.dynamic.subtitle", true)}
    <section class="card">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="tabs">
            <button class="tab-btn ${state.dynamic.mode === "manual" ? "active" : ""}" data-action="set-dynamic-mode" data-mode="manual">${t("page.dynamic.modeManual")}</button>
            <button class="tab-btn ${state.dynamic.mode === "auto" ? "active" : ""}" data-action="set-dynamic-mode" data-mode="auto">${t("page.dynamic.modeAuto")}</button>
          </div>
          <span class="chip">${state.dynamic.running ? t("page.dynamic.running") : t("page.dynamic.idle")}</span>
        </div>
        <div class="toolbar-right">
          <button class="btn primary" data-action="run-simulation">${t("page.dynamic.runSimulation")}</button>
          <button class="btn secondary" data-action="pause-simulation">${t("page.dynamic.pauseSimulation")}</button>
          <button class="btn secondary" data-action="reset-simulation">${t("page.dynamic.resetSimulation")}</button>
          <button class="btn secondary" data-action="toggle-guardrails">${t("page.dynamic.showGuardrails")}</button>
        </div>
      </div>
      <div class="split-grid">
        <div class="card">
          <h3 class="card-title">${t("common.simulation")}</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>${t("page.monitoring.table.product")}</th>
                  <th>${t("page.monitoring.table.aiPrice")}</th>
                  <th>${t("page.dynamic.guardrails")}</th>
                  <th>${t("page.monitoring.table.action")}</th>
                </tr>
              </thead>
              <tbody>
                ${visibleCandidates.length ? visibleCandidates.map((item) => renderSimulationRow(item)).join("") : renderEmptyRow(4)}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">${t("page.dynamic.previewPanel")}</h3>
          ${preview ? renderSimulationPreview(preview) : `<p class="muted">${t("common.noRecords")}</p>`}
        </div>
      </div>
    </section>
  `;
}

function renderABPage() {
  const experiments = getVisibleExperiments();
  const runningCount = experiments.filter((item) => item.status === "running").length;
  const avgLift = experiments.length
    ? experiments.reduce((sum, item) => sum + item.liftPercent, 0) / experiments.length
    : 0;

  return `
    ${renderPageHeader("page.ab.title", "page.ab.subtitle", true)}
    <section class="kpi-grid">
      ${renderKpiCard("page.dashboard.kpi.tracked", String(experiments.length))}
      ${renderKpiCard("common.run", String(runningCount), "yellow")}
      ${renderKpiCard("page.ab.kpi.lift", `${avgLift.toFixed(2)}%`, "green")}
      ${renderKpiCard("page.ab.kpi.bestVariant", getBestVariantLabel(experiments))}
    </section>
    <section class="card">
      <div class="toolbar">
        <div class="toolbar-left">
          <label class="muted" for="ab-range">${t("page.ab.range")}</label>
          <select id="ab-range" class="select">
            <option value="7d" ${selectedIf(state.ab.range, "7d")}>${t("page.ab.last7")}</option>
            <option value="30d" ${selectedIf(state.ab.range, "30d")}>${t("page.ab.last30")}</option>
            <option value="90d" ${selectedIf(state.ab.range, "90d")}>${t("page.ab.last90")}</option>
          </select>
        </div>
        <div class="toolbar-right">
          <button class="btn secondary" data-action="apply-ab-range">${t("page.ab.applyRange")}</button>
          <button class="btn secondary" data-action="reset-ab-range">${t("page.ab.resetRange")}</button>
          <button class="btn secondary" data-action="export-ab-snapshot">${t("page.ab.exportSnapshot")}</button>
          <button class="btn primary" data-action="run-ab-test">${t("page.ab.runNewTest")}</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${t("page.ab.table.test")}</th>
              <th>${t("page.ab.table.date")}</th>
              <th>${t("page.ab.table.control")}</th>
              <th>${t("page.ab.table.variant")}</th>
              <th>${t("page.ab.table.lift")}</th>
              <th>${t("page.ab.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            ${experiments.length ? experiments.map((item) => renderExperimentRow(item)).join("") : renderEmptyRow(6)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderProductDetailPage() {
  const products = getVisibleProducts();
  const current = state.data.products.find((item) => item.id === state.selectedProductId) ?? state.data.products[0];
  if (!current) {
    return `
      ${renderPageHeader("page.product.title", "page.product.subtitle", true)}
      <section class="card"><p class="muted">${t("common.noRecords")}</p></section>
    `;
  }
  const recommendation = getRecommendationByProductId(current.id);
  const index = products.findIndex((item) => item.id === current.id);
  const prevProduct = index > 0 ? products[index - 1] : null;
  const nextProduct = index >= 0 && index < products.length - 1 ? products[index + 1] : null;
  const notes = state.data.notesByProductId[current.id] ?? [];

  return `
    ${renderPageHeader("page.product.title", "page.product.subtitle", true)}
    <section class="split-grid">
      <div class="card">
        <h3 class="card-title">${escapeHtml(current.name)} <span class="chip mono">${escapeHtml(current.sku)}</span></h3>
        <p class="muted">${t("page.monitoring.table.currentPrice")}: <strong>${formatMoney(current.currentPrice)}</strong></p>
        <p class="muted">${t("page.monitoring.table.competitorMin")}: <strong>${formatMoney(current.competitorMin)}</strong></p>
        <p class="muted">${t("page.monitoring.table.aiPrice")}: <strong>${formatMoney(current.aiPrice)}</strong></p>
        <span class="status-badge ${statusClass(current.status)}">${t(statusKey(current.status))}</span>
      </div>
      <div class="card">
        <h3 class="card-title">${t("page.reco.title")}</h3>
        ${recommendation ? `
          <p class="muted">${t("page.product.reason")}: ${t(recommendation.reasonKey)}</p>
          <p class="muted">${t("page.product.suggested")}: <strong>${formatMoney(recommendation.suggestedPrice)}</strong></p>
          <p class="muted">${t("page.monitoring.table.status")}: <span class="chip">${t(recommendationStatusKey(recommendation.status))}</span></p>
          <div class="btn-row">
            <button class="btn primary" data-action="approve-single-reco" data-reco-id="${recommendation.id}">${t("common.approve")}</button>
            <button class="btn secondary" data-action="reject-single-reco" data-reco-id="${recommendation.id}">${t("common.reject")}</button>
            <button class="btn secondary" data-action="add-product-note" data-product-id="${current.id}">${t("common.addNote")}</button>
          </div>
        ` : `<p class="muted">${t("common.noRecords")}</p>`}
      </div>
    </section>

    <section class="card" style="margin-top:12px;">
      <h3 class="card-title">${t("page.product.notes")}</h3>
      ${notes.length ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>` : `<p class="muted">${t("common.noRecords")}</p>`}
      <div class="btn-row">
        <button class="btn secondary" data-action="product-prev" ${prevProduct ? `data-product-id="${prevProduct.id}"` : "disabled"}>${t("common.previous")}</button>
        <button class="btn secondary" data-action="product-next" ${nextProduct ? `data-product-id="${nextProduct.id}"` : "disabled"}>${t("common.next")}</button>
      </div>
    </section>
  `;
}

function renderSettingsPage() {
  return `
    ${renderPageHeader("page.settings.title", "page.settings.subtitle", true)}
    <section class="card">
      <div class="toolbar">
        <div class="toolbar-left" style="display:grid;gap:10px;min-width:280px;">
          <label class="muted" for="settings-locale">${t("page.settings.locale")}</label>
          <select id="settings-locale" class="select">
            <option value="tr" ${selectedIf(state.settings.locale, "tr")}>TR</option>
            <option value="en" ${selectedIf(state.settings.locale, "en")}>EN</option>
          </select>
          <label class="muted" for="settings-currency">${t("page.settings.currency")}</label>
          <select id="settings-currency" class="select">
            <option value="TRY" ${selectedIf(state.settings.currency, "TRY")}>TRY</option>
            <option value="USD" ${selectedIf(state.settings.currency, "USD")}>USD</option>
            <option value="EUR" ${selectedIf(state.settings.currency, "EUR")}>EUR</option>
          </select>
          <label><input id="settings-compact" type="checkbox" ${state.settings.compactMode ? "checked" : ""}> ${t("page.settings.compactMode")}</label>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn primary" data-action="save-settings">${t("page.settings.savePreferences")}</button>
        <button class="btn secondary" data-action="restore-defaults">${t("common.restoreDefaults")}</button>
      </div>
    </section>
  `;
}

function renderScenarioPage() {
  return `
    ${renderPageHeader("page.scenario.title", "page.scenario.subtitle", true)}
    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${t("page.scenario.id")}</th>
              <th>${t("page.scenario.label")}</th>
              <th>${t("page.monitoring.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            ${mockData.scenarios.map((item) => `
              <tr>
                <td><span class="chip mono">${escapeHtml(item.id)}</span></td>
                <td>${t(`page.scenario.${item.id}`) || escapeHtml(item.label)}</td>
                <td><button class="btn primary" data-action="load-scenario" data-scenario-id="${item.id}">${t("page.scenario.loadScenario")}</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="btn-row">
        <button class="btn secondary" data-action="reseed-scenario">${t("page.scenario.reseed")}</button>
      </div>
    </section>
  `;
}

function renderPageHeader(titleKey, subtitleKey, showBack = false) {
  return `
    <header class="page-header">
      <div>
        <h1 class="page-title">${t(titleKey)}</h1>
        <p class="page-subtitle">${t(subtitleKey)}</p>
      </div>
      ${showBack ? `<button class="back-btn" data-action="back-dashboard">${t("common.backToDashboard")}</button>` : ""}
    </header>
  `;
}

function renderKpiCard(labelKey, value, tone = "") {
  return `
    <article class="card">
      <p class="kpi-label">${labelKey.includes(".") ? t(labelKey) : escapeHtml(labelKey)}</p>
      <p class="kpi-value ${tone}">${escapeHtml(value)}</p>
    </article>
  `;
}

function renderProductTableRow(product) {
  return `
    <tr>
      <td>${escapeHtml(product.name)}</td>
      <td>${formatMoney(product.currentPrice)}</td>
      <td>${formatMoney(product.competitorMin)}</td>
      <td><span class="status-badge ${statusClass(product.status)}">${t(statusKey(product.status))}</span></td>
      <td><button class="link-btn" data-action="open-product" data-product-id="${product.id}">${t("common.openDetails")}</button></td>
    </tr>
  `;
}

function renderMonitoringRow(product) {
  const checked = state.monitoring.selectedIds.includes(product.id) ? "checked" : "";
  return `
    <tr>
      <td><input class="table-check" type="checkbox" data-select-product-id="${product.id}" ${checked}></td>
      <td>${escapeHtml(product.name)} <span class="chip mono">${escapeHtml(product.sku)}</span></td>
      <td>${formatMoney(product.currentPrice)}</td>
      <td>${formatMoney(product.competitorMin)}</td>
      <td>${formatMoney(product.aiPrice)}</td>
      <td><span class="status-badge ${statusClass(product.status)}">${t(statusKey(product.status))}</span></td>
      <td><button class="link-btn" data-action="open-product" data-product-id="${product.id}">${t("common.openDetails")}</button></td>
    </tr>
  `;
}

function renderRecommendationCompactRow(item) {
  const product = getProductById(item.productId);
  return `
    <tr>
      <td>${escapeHtml(product?.name ?? "-")}</td>
      <td>${formatMoney(item.suggestedPrice)}</td>
      <td><span class="chip">${t(recommendationStatusKey(item.status))}</span></td>
      <td><button class="link-btn" data-action="open-product" data-product-id="${item.productId}">${t("common.openDetails")}</button></td>
    </tr>
  `;
}

function renderRecommendationRow(item) {
  const product = getProductById(item.productId);
  const checked = state.recommendations.selectedIds.includes(item.id) ? "checked" : "";
  const isPending = item.status === "pending";
  return `
    <tr>
      <td>${isPending ? `<input class="table-check" type="checkbox" data-select-reco-id="${item.id}" ${checked}>` : ""}</td>
      <td>${escapeHtml(product?.name ?? "-")} <span class="chip mono">${escapeHtml(product?.sku ?? "")}</span></td>
      <td>${formatMoney(item.currentPrice)}</td>
      <td>${formatMoney(item.suggestedPrice)}</td>
      <td>${t(item.reasonKey)}</td>
      <td><span class="chip">${t(recommendationStatusKey(item.status))}</span></td>
      <td>
        <div class="row-actions">
          ${isPending ? `<button class="btn secondary" data-action="apply-reco" data-reco-id="${item.id}">${t("common.apply")}</button>` : ""}
          ${isPending ? `<button class="btn secondary" data-action="approve-single-reco" data-reco-id="${item.id}">${t("common.approve")}</button>` : ""}
          ${isPending ? `<button class="btn secondary" data-action="reject-single-reco" data-reco-id="${item.id}">${t("common.reject")}</button>` : ""}
          <button class="btn secondary" data-action="open-product" data-product-id="${item.productId}">${t("common.openDetails")}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderSimulationRow(item) {
  return `
    <tr>
      <td>${escapeHtml(item.productName)} <span class="chip mono">${escapeHtml(item.sku)}</span></td>
      <td>${formatMoney(item.suggestedPrice)}</td>
      <td><span class="chip">${item.guardrailHits}</span></td>
      <td><button class="btn secondary" data-action="preview-simulation" data-candidate-id="${item.id}">${t("common.preview")}</button></td>
    </tr>
  `;
}

function renderSimulationPreview(candidate) {
  return `
    <p class="muted">${escapeHtml(candidate.productName)} <span class="chip mono">${escapeHtml(candidate.sku)}</span></p>
    <p class="muted">Current: <strong>${formatMoney(candidate.currentPrice)}</strong></p>
    <p class="muted">Suggested: <strong>${formatMoney(candidate.suggestedPrice)}</strong></p>
    <p class="muted">Guardrail hits: <strong>${candidate.guardrailHits}</strong></p>
    <div class="btn-row">
      <button class="btn primary" data-action="apply-simulation" data-candidate-id="${candidate.id}">${t("common.apply")}</button>
      <button class="btn secondary" data-action="rollback-simulation">${t("common.rollback")}</button>
    </div>
  `;
}

function renderExperimentRow(item) {
  return `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.date)}</td>
      <td>${formatMoney(item.controlPrice)}</td>
      <td>${formatMoney(item.variantPrice)}</td>
      <td>${item.liftPercent.toFixed(2)}%</td>
      <td><span class="chip">${t(abStatusKey(item.status))}</span></td>
    </tr>
  `;
}

function renderEmptyRow(colspan) {
  return `<tr><td colspan="${colspan}" class="muted">${t("common.noRecords")}</td></tr>`;
}

function handlePageAction(action, node) {
  switch (action) {
    case "reset-demo":
      openConfirm("confirm.resetDemo", () => {
        resetAppState();
        showToast(t("toast.stateReset"));
        render();
      });
      break;
    case "apply-monitor-filters":
      render();
      break;
    case "clear-monitor-filters":
      state.monitoring.risk = "all";
      state.monitoring.sort = "risk-desc";
      state.monitoring.selectedIds = [];
      render();
      break;
    case "send-monitoring-to-reco":
      sendSelectedProductsToRecommendations();
      break;
    case "set-reco-tab":
      state.recommendations.tab = node.dataset.tab === "processed" ? "processed" : "pending";
      state.recommendations.selectedIds = [];
      render();
      break;
    case "toggle-reco-filter":
      showToast(t("common.filter"));
      break;
    case "approve-all-visible":
      approveRecommendations(getRecommendationsByTab().map((item) => item.id));
      break;
    case "approve-selected-reco":
      approveRecommendations(state.recommendations.selectedIds);
      break;
    case "reject-selected-reco":
      if (!state.recommendations.selectedIds.length) return;
      openConfirm("confirm.rejectBulk", () => {
        rejectRecommendations(state.recommendations.selectedIds);
      });
      break;
    case "apply-reco":
      applyRecommendation(Number(node.dataset.recoId));
      break;
    case "approve-single-reco":
      approveRecommendations([Number(node.dataset.recoId)]);
      break;
    case "reject-single-reco":
      openConfirm("confirm.reject", () => {
        rejectRecommendations([Number(node.dataset.recoId)]);
      });
      break;
    case "set-dynamic-mode":
      state.dynamic.mode = node.dataset.mode === "auto" ? "auto" : "manual";
      state.dynamic.previewId = state.dynamic.candidates.find((item) => item.mode === state.dynamic.mode)?.id ?? null;
      render();
      break;
    case "run-simulation":
      runSimulation();
      break;
    case "pause-simulation":
      state.dynamic.running = false;
      showToast(t("toast.simulationPaused"));
      render();
      break;
    case "reset-simulation":
      openConfirm("confirm.resetSimulation", () => {
        resetSimulationState();
        render();
      });
      break;
    case "toggle-guardrails":
      state.dynamic.guardrailsOnly = !state.dynamic.guardrailsOnly;
      render();
      break;
    case "preview-simulation":
      state.dynamic.previewId = Number(node.dataset.candidateId);
      render();
      break;
    case "apply-simulation":
      applySimulationCandidate(Number(node.dataset.candidateId));
      break;
    case "rollback-simulation":
      if (!state.dynamic.appliedStack.length) return;
      openConfirm("confirm.rollback", () => {
        rollbackSimulation();
      });
      break;
    case "apply-ab-range":
      render();
      break;
    case "reset-ab-range":
      state.ab.range = "30d";
      render();
      break;
    case "export-ab-snapshot":
      exportAbSnapshot();
      break;
    case "run-ab-test":
      runNewAbTest();
      break;
    case "add-product-note":
      addProductNote(Number(node.dataset.productId));
      break;
    case "product-prev":
    case "product-next":
      if (node.dataset.productId) {
        state.selectedProductId = Number(node.dataset.productId);
        render();
      }
      break;
    case "save-settings":
      saveSettings();
      break;
    case "restore-defaults":
      openConfirm("confirm.restoreDefaults", () => {
        state.settings = { locale: "tr", currency: "TRY", compactMode: false };
        setLocale("tr");
        showToast(t("toast.saved"));
      });
      break;
    case "load-scenario":
      if (node.dataset.scenarioId) {
        loadScenario(node.dataset.scenarioId);
      }
      break;
    case "reseed-scenario":
      reseedScenarioValues();
      break;
    default:
      break;
  }
}

function getVisibleProducts() {
  const text = state.searchText;
  return state.data.products.filter((product) => {
    if (!text) return true;
    return `${product.name} ${product.sku}`.toLowerCase().includes(text);
  });
}

function getMonitoringProducts() {
  const products = getVisibleProducts().filter((product) => {
    if (state.monitoring.risk === "all") return true;
    return product.status === state.monitoring.risk;
  });
  const rank = { high: 3, low: 2, ok: 1 };

  if (state.monitoring.sort === "price-asc") {
    products.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (state.monitoring.sort === "price-desc") {
    products.sort((a, b) => b.currentPrice - a.currentPrice);
  } else {
    products.sort((a, b) => rank[b.status] - rank[a.status]);
  }
  return products;
}

function getRecommendationsByTab() {
  const visibleProductIds = new Set(getVisibleProducts().map((item) => item.id));
  return state.data.recommendations.filter((item) => {
    const tabMatch =
      state.recommendations.tab === "pending"
        ? item.status === "pending"
        : item.status !== "pending";
    return tabMatch && visibleProductIds.has(item.productId);
  });
}

function getRecommendationByProductId(productId) {
  return state.data.recommendations.find((item) => item.productId === productId) ?? null;
}

function getProductById(productId) {
  return state.data.products.find((item) => item.id === productId) ?? null;
}

function approveRecommendations(ids) {
  if (!ids?.length) return;
  ids.forEach((id) => {
    const rec = state.data.recommendations.find((item) => item.id === id);
    if (!rec || rec.status !== "pending") return;
    rec.status = "approved";
  });
  state.recommendations.selectedIds = [];
  showToast(t("toast.saved"));
  render();
}

function rejectRecommendations(ids) {
  if (!ids?.length) return;
  ids.forEach((id) => {
    const rec = state.data.recommendations.find((item) => item.id === id);
    if (!rec || rec.status !== "pending") return;
    rec.status = "rejected";
  });
  state.recommendations.selectedIds = [];
  showToast(t("toast.saved"));
  render();
}

function applyRecommendation(recoId) {
  const rec = state.data.recommendations.find((item) => item.id === recoId);
  if (!rec) return;
  const product = getProductById(rec.productId);
  if (!product) return;

  product.currentPrice = rec.suggestedPrice;
  product.status = product.currentPrice > product.competitorMin ? "high" : "ok";
  rec.status = "approved";
  rec.currentPrice = product.currentPrice;
  showToast(t("toast.saved"));
  render();
}

function runSimulation() {
  if (state.dynamic.mode !== "auto") {
    state.dynamic.mode = "auto";
  }
  state.dynamic.running = true;
  state.dynamic.candidates = state.dynamic.candidates.map((item, index) => {
    if (item.mode !== "auto") return item;
    const delta = ((index % 3) - 1) * 5;
    return {
      ...item,
      suggestedPrice: Math.max(1, item.suggestedPrice + delta),
      guardrailHits: item.suggestedPrice + delta < item.floorPrice ? 1 : item.guardrailHits
    };
  });
  showToast(t("toast.simulationStarted"));
  render();
}

function resetSimulationState() {
  state.dynamic.running = false;
  state.dynamic.guardrailsOnly = false;
  state.dynamic.appliedStack = [];
  state.dynamic.candidates = buildSimulationCandidates(state.data.products);
  state.dynamic.previewId = state.dynamic.candidates.find((item) => item.mode === state.dynamic.mode)?.id ?? null;
}

function applySimulationCandidate(candidateId) {
  const candidate = state.dynamic.candidates.find((item) => item.id === candidateId);
  if (!candidate) return;
  const product = getProductById(candidate.productId);
  if (!product) return;
  state.dynamic.appliedStack.push({ productId: product.id, prevPrice: product.currentPrice });
  product.currentPrice = candidate.suggestedPrice;
  product.status = "ok";
  showToast(t("toast.simulationApplied"));
  render();
}

function rollbackSimulation() {
  const item = state.dynamic.appliedStack.pop();
  if (!item) return;
  const product = getProductById(item.productId);
  if (!product) return;
  product.currentPrice = item.prevPrice;
  showToast(t("toast.simulationRolledBack"));
  render();
}

function runNewAbTest() {
  const id = state.data.experiments.length + 1;
  const now = new Date();
  state.data.experiments.unshift({
    id: `exp-${id}`,
    name: `Variant Test ${id}`,
    date: now.toISOString().slice(0, 10),
    controlPrice: 999 + id * 10,
    variantPrice: 989 + id * 10,
    liftPercent: Number((Math.random() * 5 + 0.5).toFixed(2)),
    status: "running"
  });
  showToast(t("toast.saved"));
  render();
}

function getVisibleExperiments() {
  const days = state.ab.range === "7d" ? 7 : state.ab.range === "90d" ? 90 : 30;
  const now = new Date();
  return state.data.experiments.filter((item) => {
    const date = new Date(item.date);
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  });
}

function exportAbSnapshot() {
  const payload = {
    exportedAt: new Date().toISOString(),
    range: state.ab.range,
    experiments: getVisibleExperiments()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ab-snapshot.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(t("toast.saved"));
}

function addProductNote(productId) {
  const note = window.prompt(t("page.product.notes"));
  if (!note) return;
  if (!state.data.notesByProductId[productId]) {
    state.data.notesByProductId[productId] = [];
  }
  state.data.notesByProductId[productId].push(note);
  showToast(t("toast.saved"));
  render();
}

function saveSettings() {
  const { locale, currency, compactMode } = state.settings;
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ locale, currency, compactMode }));
  setLocale(locale);
  showToast(t("toast.saved"));
  render();
}

function loadScenario(id) {
  state.scenario.active = id;
  if (id === "empty") {
    state.data.products = [];
    state.data.recommendations = [];
  } else if (id === "warning") {
    state.data.products = clone(baseline.products).map((item) => ({
      ...item,
      status: item.status === "ok" ? "high" : item.status,
      aiPrice: Math.max(1, item.aiPrice - 15)
    }));
    state.data.recommendations = seedRecommendations(state.data.products);
  } else if (id === "conflict") {
    state.data.products = clone(baseline.products).map((item) => ({
      ...item,
      competitorMin: Math.max(1, item.competitorMin - 50),
      aiPrice: item.currentPrice + 30,
      status: "low"
    }));
    state.data.recommendations = seedRecommendations(state.data.products);
  } else {
    state.data.products = clone(baseline.products);
    state.data.recommendations = clone(baseline.recommendations);
  }
  state.dynamic.candidates = buildSimulationCandidates(state.data.products);
  state.dynamic.previewId = state.dynamic.candidates[0]?.id ?? null;
  state.selectedProductId = state.data.products[0]?.id ?? null;
  state.monitoring.selectedIds = [];
  state.recommendations.selectedIds = [];
  showToast(t("toast.stateReset"));
  const target = state.lastRegularRoute || ROUTES.dashboard;
  window.location.hash = `#${target}`;
}

function reseedScenarioValues() {
  state.data.products = state.data.products.map((item, index) => {
    const offset = ((index % 3) - 1) * 7;
    const currentPrice = Math.max(1, item.currentPrice + offset);
    return {
      ...item,
      currentPrice,
      aiPrice: Math.max(1, currentPrice - 5)
    };
  });
  state.data.recommendations = seedRecommendations(state.data.products);
  state.dynamic.candidates = buildSimulationCandidates(state.data.products);
  state.dynamic.previewId = state.dynamic.candidates[0]?.id ?? null;
  showToast(t("toast.saved"));
  render();
}

function sendSelectedProductsToRecommendations() {
  if (!state.monitoring.selectedIds.length) return;
  state.monitoring.selectedIds.forEach((productId) => {
    const product = getProductById(productId);
    if (!product) return;
    const existing = getRecommendationByProductId(product.id);
    if (existing) {
      existing.status = "pending";
      existing.currentPrice = product.currentPrice;
      existing.suggestedPrice = product.aiPrice;
      return;
    }
    state.data.recommendations.push(createRecommendation(product, state.data.recommendations.length + 1));
  });
  state.monitoring.selectedIds = [];
  state.recommendations.tab = "pending";
  showToast(t("toast.saved"));
  window.location.hash = `#${ROUTES.recommendations}`;
}

function resetAppState() {
  state.searchText = "";
  if (elements.search) elements.search.value = "";
  state.selectedProductId = baseline.products[0]?.id ?? null;
  state.monitoring = { risk: "all", sort: "risk-desc", selectedIds: [] };
  state.recommendations = { tab: "pending", selectedIds: [] };
  state.dynamic = {
    mode: "manual",
    running: false,
    guardrailsOnly: false,
    previewId: null,
    appliedStack: [],
    candidates: buildSimulationCandidates(clone(baseline.products))
  };
  state.dynamic.previewId = state.dynamic.candidates[0]?.id ?? null;
  state.ab = { range: "30d" };
  state.data = {
    products: clone(baseline.products),
    recommendations: clone(baseline.recommendations),
    notesByProductId: {},
    experiments: clone(baseline.experiments)
  };
}

function openConfirm(messageKey, onConfirm) {
  state.confirm.isOpen = true;
  state.confirm.messageKey = messageKey;
  state.confirm.onConfirm = onConfirm;
  renderConfirmModal();
}

function closeConfirm() {
  state.confirm.isOpen = false;
  state.confirm.messageKey = "";
  state.confirm.onConfirm = null;
  renderConfirmModal();
}

function renderConfirmModal() {
  if (!elements.confirmModal || !elements.confirmMessage || !elements.confirmTitle) return;
  if (!state.confirm.isOpen) {
    elements.confirmModal.classList.add("hidden");
    return;
  }
  elements.confirmTitle.textContent = t("confirm.title");
  elements.confirmMessage.textContent = t(state.confirm.messageKey);
  elements.confirmModal.classList.remove("hidden");
}

function showToast(text) {
  if (!elements.toast) return;
  elements.toast.textContent = text;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timerId);
  showToast.timerId = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 1400);
}

function setActiveMenu() {
  const map = {
    [ROUTES.dashboard]: "dashboard",
    [ROUTES.monitoring]: "dashboard",
    [ROUTES.recommendations]: "recommendations",
    [ROUTES.productDetail]: "recommendations",
    [ROUTES.dynamic]: "dynamicPricing",
    [ROUTES.ab]: "abTesting"
  };
  const activeKey = map[state.route] ?? "";
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.menuItem === activeKey);
  });
}

function setActiveLanguageButtons() {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.locale === state.locale);
  });
}

function t(key) {
  return messages[state.locale]?.[key] ?? messages.en[key] ?? key;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "-";
  const locale = state.locale === "tr" ? "tr-TR" : "en-US";
  const currency = state.settings.currency || "TRY";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function selectedIf(actual, expected) {
  return actual === expected ? "selected" : "";
}

function statusClass(status) {
  if (status === "high") return "high";
  if (status === "low") return "low";
  return "ok";
}

function statusKey(status) {
  if (status === "high") return "status.highRisk";
  if (status === "low") return "status.lowMargin";
  return "status.competitive";
}

function recommendationStatusKey(status) {
  if (status === "approved") return "status.approved";
  if (status === "rejected") return "status.rejected";
  return "status.pending";
}

function getBestVariantLabel(experiments) {
  if (!experiments.length) return "-";
  const best = experiments.reduce((prev, cur) => (cur.liftPercent > prev.liftPercent ? cur : prev));
  return best.name;
}

function abStatusKey(status) {
  return status === "running" ? "page.ab.status.running" : "page.ab.status.completed";
}

function toggleInList(list, value, isChecked) {
  const index = list.indexOf(value);
  if (isChecked && index === -1) list.push(value);
  if (!isChecked && index >= 0) list.splice(index, 1);
}

function readStoredLocale() {
  const value = localStorage.getItem(STORAGE_KEYS.locale);
  return value === "en" ? "en" : "tr";
}

function createBaselineState() {
  const products = clone(mockData.products);
  return {
    products,
    recommendations: seedRecommendations(products),
    experiments: [
      {
        id: "exp-101",
        name: "Earbud Price Step",
        date: "2026-03-01",
        controlPrice: 1249,
        variantPrice: 1199,
        liftPercent: 3.9,
        status: "completed"
      },
      {
        id: "exp-102",
        name: "Watch Margin Guardrail",
        date: "2026-02-26",
        controlPrice: 3399,
        variantPrice: 3499,
        liftPercent: 1.4,
        status: "running"
      },
      {
        id: "exp-103",
        name: "Mouse Weekend Promo",
        date: "2026-01-15",
        controlPrice: 849,
        variantPrice: 829,
        liftPercent: 2.1,
        status: "completed"
      }
    ]
  };
}

function seedRecommendations(products) {
  return products.map((product, index) => createRecommendation(product, index + 1));
}

function createRecommendation(product, id) {
  const reasonKey =
    product.status === "high"
      ? "reason.competitorUndercut"
      : product.status === "low"
        ? "reason.marginOpportunity"
        : "reason.keepLeader";
  return {
    id,
    productId: product.id,
    currentPrice: product.currentPrice,
    suggestedPrice: product.aiPrice,
    reasonKey,
    status: "pending"
  };
}

function buildSimulationCandidates(products) {
  const list = [];
  products.forEach((product, index) => {
    const floorPrice = Math.max(1, Math.round(product.competitorMin * 0.94));
    const manualPrice = Math.max(1, product.aiPrice);
    const autoPrice = Math.max(1, product.aiPrice - ((index % 2) * 10 + 5));
    list.push({
      id: index * 2 + 1,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      mode: "manual",
      currentPrice: product.currentPrice,
      suggestedPrice: manualPrice,
      floorPrice,
      guardrailHits: manualPrice < floorPrice ? 1 : 0
    });
    list.push({
      id: index * 2 + 2,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      mode: "auto",
      currentPrice: product.currentPrice,
      suggestedPrice: autoPrice,
      floorPrice,
      guardrailHits: autoPrice < floorPrice ? 1 : 0
    });
  });
  return list;
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
