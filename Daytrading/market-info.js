(function (globalScope) {
  "use strict";

  const numberFormatter = new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 2,
  });
  const integerFormatter = new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  });
  const compactFormatter = new Intl.NumberFormat("zh-TW", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function formatNumber(value, maximumFractionDigits = 2) {
    if (!isFiniteNumber(value)) return "—";
    return new Intl.NumberFormat("zh-TW", {
      maximumFractionDigits,
    }).format(value);
  }

  function formatDate(isoDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || "")) return "日期未提供";
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date);
  }

  function formatGeneratedAt(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "產生時間未提供";
    return new Intl.DateTimeFormat("zh-TW", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function formatChange(value, suffix = "") {
    if (!isFiniteNumber(value)) return "—";
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${numberFormatter.format(value)}${suffix}`;
  }

  function formatTurnover(value) {
    return isFiniteNumber(value) ? `NT$${compactFormatter.format(value)}` : "—";
  }

  function changeClass(value) {
    if (!isFiniteNumber(value) || value === 0) return "status-neutral";
    return value > 0 ? "status-positive" : "status-negative";
  }

  function createElement(documentRef, tagName, className, text) {
    const element = documentRef.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function replaceWithMessage(element, message) {
    element.replaceChildren();
    const tagName = /^(OL|UL)$/.test(element.tagName) ? "li" : "p";
    element.append(
      createElement(element.ownerDocument, tagName, "acme-market-placeholder", message),
    );
  }

  function metric(documentRef, label, value) {
    const wrapper = createElement(documentRef, "div");
    wrapper.append(
      createElement(documentRef, "dt", "", label),
      createElement(documentRef, "dd", "", value),
    );
    return wrapper;
  }

  function renderSummary(documentRef, summary, dataElement, dateElement) {
    if (!summary) {
      dateElement.textContent = "來源暫時無資料";
      dateElement.removeAttribute("datetime");
      replaceWithMessage(dataElement, "此市場的官方彙總資料目前無法顯示。");
      return;
    }

    dateElement.dateTime = summary.date;
    dateElement.textContent = `資料日 ${formatDate(summary.date)}`;
    const indexRow = createElement(documentRef, "div", "acme-index-value");
    indexRow.append(
      createElement(
        documentRef,
        "strong",
        "",
        formatNumber(summary.close, 2),
      ),
      createElement(
        documentRef,
        "span",
        changeClass(summary.change),
        `${formatChange(summary.change)}（${formatChange(summary.changePercent, "%")}）`,
      ),
    );

    const metrics = createElement(documentRef, "dl", "acme-market-metrics");
    if (summary.market === "TPEx") {
      metrics.append(
        metric(
          documentRef,
          "成交值（百萬元）",
          formatNumber(summary.tradeValue, 0),
        ),
        metric(
          documentRef,
          "成交量（千股）",
          formatNumber(summary.tradeVolume, 0),
        ),
        metric(documentRef, "上漲家數", formatNumber(summary.advances, 0)),
        metric(documentRef, "下跌家數", formatNumber(summary.declines, 0)),
      );
    } else {
      metrics.append(
        metric(documentRef, "成交金額", formatTurnover(summary.tradeValue)),
        metric(
          documentRef,
          "成交股數",
          isFiniteNumber(summary.tradeVolume)
            ? compactFormatter.format(summary.tradeVolume)
            : "—",
        ),
        metric(documentRef, "成交筆數", formatNumber(summary.transactions, 0)),
        metric(documentRef, "資料性質", "官方盤後"),
      );
    }

    dataElement.className = "";
    dataElement.replaceChildren(indexRow, metrics);
  }

  function renderRanking(documentRef, rows, listElement) {
    listElement.replaceChildren();
    if (!Array.isArray(rows) || rows.length === 0) {
      listElement.append(
        createElement(documentRef, "li", "acme-market-placeholder", "此來源目前無排行資料。"),
      );
      return;
    }

    rows.forEach((row) => {
      const item = createElement(documentRef, "li");
      const content = createElement(documentRef, "div", "acme-ranking-row");
      const name = createElement(documentRef, "span", "acme-ranking-name");
      name.append(
        createElement(documentRef, "strong", "", `${row.code} ${row.name}`),
        createElement(documentRef, "small", "", `收盤 ${formatNumber(row.close, 2)}`),
      );
      const value = createElement(documentRef, "span", "acme-ranking-value");
      value.append(
        createElement(documentRef, "strong", "", formatTurnover(row.turnover)),
        createElement(
          documentRef,
          "small",
          changeClass(row.change),
          formatChange(row.change),
        ),
      );
      content.append(name, value);
      item.append(content);
      listElement.append(item);
    });
  }

  function renderNews(documentRef, rows, listElement) {
    listElement.replaceChildren();
    if (!Array.isArray(rows) || rows.length === 0) {
      listElement.append(
        createElement(documentRef, "li", "acme-market-placeholder", "證交所消息目前無法顯示。"),
      );
      return;
    }

    rows.forEach((row) => {
      const item = createElement(documentRef, "li");
      const link = createElement(documentRef, "a");
      link.href = row.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(
        createElement(documentRef, "span", "", row.title),
        createElement(documentRef, "time", "", formatDate(row.date)),
      );
      link.lastElementChild.dateTime = row.date;
      item.append(link);
      listElement.append(item);
    });
  }

  function renderSourceNote(element, payload) {
    const dates = Array.from(
      new Set(
        (payload.sources || [])
          .filter((source) => source.available && source.date)
          .map((source) => formatDate(source.date)),
      ),
    );
    const dateText = dates.length ? dates.join("、") : "無可用資料日期";
    element.textContent =
      `資料來源：臺灣證券交易所、證券櫃檯買賣中心；資料日：${dateText}；` +
      `本站 API 產生時間：${formatGeneratedAt(payload.generatedAt)}。非即時行情。`;
  }

  async function loadMarketOverview(documentRef, fetchImpl) {
    const status = documentRef.getElementById("market-overview-status");
    const section = documentRef.getElementById("market-overview");
    if (!status || !section) return;

    if (globalScope.location?.protocol === "file:") {
      status.className = "acme-data-state is-partial";
      status.textContent =
        "市場資訊需由已部署網站讀取；直接開啟檔案時，當沖小算盤仍可完整使用。";
      [
        "twse-summary-data",
        "tpex-summary-data",
        "twse-turnover-list",
        "tpex-turnover-list",
        "twse-news-list",
      ].forEach((id) => {
        const element = documentRef.getElementById(id);
        if (element) replaceWithMessage(element, "網站環境下才會載入官方盤後資料。");
      });
      return;
    }

    status.className = "acme-data-state";
    status.textContent = "正在讀取官方市場資料…";
    section.setAttribute("aria-busy", "true");
    try {
      const response = await fetchImpl("api/market", {
        headers: { Accept: "application/json" },
      });
      const payload = await response.json();
      renderSummary(
        documentRef,
        payload.summaries?.twse,
        documentRef.getElementById("twse-summary-data"),
        documentRef.getElementById("twse-summary-date"),
      );
      renderSummary(
        documentRef,
        payload.summaries?.tpex,
        documentRef.getElementById("tpex-summary-data"),
        documentRef.getElementById("tpex-summary-date"),
      );
      renderRanking(
        documentRef,
        payload.turnover?.twse,
        documentRef.getElementById("twse-turnover-list"),
      );
      renderRanking(
        documentRef,
        payload.turnover?.tpex,
        documentRef.getElementById("tpex-turnover-list"),
      );
      renderNews(documentRef, payload.news, documentRef.getElementById("twse-news-list"));
      renderSourceNote(documentRef.getElementById("market-source-note"), payload);

      if (!response.ok) {
        throw new Error("市場資訊服務回應失敗");
      }
      status.className = payload.partial
        ? "acme-data-state is-partial"
        : "acme-data-state";
      status.textContent = payload.partial
        ? `已顯示可取得的官方資料；${payload.errors?.length || 1} 個來源暫時無法讀取。`
        : "官方盤後資料已更新。";
    } catch {
      status.className = "acme-data-state is-error";
      status.replaceChildren(
        createElement(documentRef, "span", "", "官方市場資料暫時無法讀取，請稍後再試。"),
      );
      const retryButton = createElement(documentRef, "button", "acme-button", "重新載入市場資料");
      retryButton.type = "button";
      retryButton.addEventListener("click", () => loadMarketOverview(documentRef, fetchImpl));
      status.append(retryButton);
      [
        "twse-summary-data",
        "tpex-summary-data",
        "twse-turnover-list",
        "tpex-turnover-list",
        "twse-news-list",
      ].forEach((id) => {
        const element = documentRef.getElementById(id);
        if (element) replaceWithMessage(element, "官方盤後資料目前無法顯示。");
      });
    } finally {
      section.removeAttribute("aria-busy");
    }
  }

  function dayTradeDescription(dayTrade) {
    if (!dayTrade || dayTrade.status === "unknown") {
      return "當沖標的狀態目前無法確認";
    }
    if (dayTrade.status === "not-listed") {
      return "未列入官方當日沖銷交易標的";
    }
    if (dayTrade.sellThenBuy) {
      return "可先買後賣，也可先賣後買";
    }
    return dayTrade.restriction
      ? `可先買後賣；先賣後買限制：${dayTrade.restriction}`
      : "可先買後賣；先賣後買目前受限";
  }

  function applyPriceToCalculator(side, price, documentRef) {
    if (!isFiniteNumber(price) || price <= 0 || !documentRef) return false;
    const inputId = side === "sell" ? "sell-price" : "buy-price";
    const input = documentRef.getElementById(inputId);
    if (!input) return false;
    input.value = price.toFixed(2);
    const EventConstructor =
      documentRef.defaultView?.Event || globalScope.Event;
    input.dispatchEvent(new EventConstructor("input", { bubbles: true }));
    return true;
  }

  function renderStockResults(documentRef, payload) {
    const results = documentRef.getElementById("stock-search-results");
    results.replaceChildren();
    if (!payload.matches?.length) return;

    payload.matches.forEach((stock) => {
      const card = createElement(documentRef, "article", "acme-stock-result");
      const heading = createElement(documentRef, "div", "acme-stock-result-heading");
      const identity = createElement(documentRef, "div");
      identity.append(
        createElement(documentRef, "h3", "", `${stock.code} ${stock.name}`),
        createElement(
          documentRef,
          "p",
          "",
          `${stock.marketLabel}・資料日 ${formatDate(stock.date)}`,
        ),
      );
      const close = createElement(documentRef, "div", "acme-stock-close");
      close.append(
        createElement(documentRef, "span", "", "收盤價"),
        createElement(documentRef, "strong", "", formatNumber(stock.close, 2)),
        createElement(
          documentRef,
          "span",
          changeClass(stock.change),
          formatChange(stock.change),
        ),
      );
      heading.append(identity, close);

      const metrics = createElement(documentRef, "dl", "acme-stock-metrics");
      metrics.append(
        metric(documentRef, "開盤", formatNumber(stock.open, 2)),
        metric(documentRef, "最高", formatNumber(stock.high, 2)),
        metric(documentRef, "最低", formatNumber(stock.low, 2)),
        metric(
          documentRef,
          "成交量（股）",
          isFiniteNumber(stock.volume) ? integerFormatter.format(stock.volume) : "—",
        ),
        metric(
          documentRef,
          "成交值",
          isFiniteNumber(stock.turnover) ? formatTurnover(stock.turnover) : "—",
        ),
      );

      const eligibility = createElement(documentRef, "div", "acme-daytrade-state");
      eligibility.append(
        createElement(documentRef, "strong", "", "當沖標的"),
        createElement(documentRef, "span", "", dayTradeDescription(stock.dayTrade)),
      );
      if (stock.dayTrade?.date) {
        eligibility.append(
          createElement(
            documentRef,
            "small",
            "",
            `資格資料日 ${formatDate(stock.dayTrade.date)}`,
          ),
        );
      }

      card.append(heading, metrics, eligibility);
      if (isFiniteNumber(stock.close) && stock.close > 0) {
        const actions = createElement(documentRef, "div", "acme-stock-actions");
        [
          ["buy", "帶入買進價"],
          ["sell", "帶入賣出價"],
        ].forEach(([side, label]) => {
          const button = createElement(documentRef, "button", "acme-button", label);
          button.type = "button";
          button.addEventListener("click", () => {
            if (!applyPriceToCalculator(side, stock.close, documentRef)) return;
            const input = documentRef.getElementById(
              side === "sell" ? "sell-price" : "buy-price",
            );
            input.focus();
            documentRef.getElementById("calculator")?.scrollIntoView({
              block: "start",
              behavior: globalScope.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            });
          });
          actions.append(button);
        });
        card.append(actions);
      }
      results.append(card);
    });
  }

  async function submitStockSearch(documentRef, fetchImpl) {
    const input = documentRef.getElementById("stock-query");
    const status = documentRef.getElementById("stock-search-status");
    const results = documentRef.getElementById("stock-search-results");
    const query = input.value.trim();
    if (!query) {
      input.setAttribute("aria-invalid", "true");
      status.className = "acme-data-state is-error";
      status.textContent = "請輸入股票代號或名稱。";
      results.replaceChildren();
      return;
    }

    input.removeAttribute("aria-invalid");
    status.className = "acme-data-state";
    status.textContent = "正在查詢官方盤後資料…";
    results.setAttribute("aria-busy", "true");
    try {
      const response = await fetchImpl(`api/stock?query=${encodeURIComponent(query)}`, {
        headers: { Accept: "application/json" },
      });
      const payload = await response.json();
      renderStockResults(documentRef, payload);
      renderSourceNote(documentRef.getElementById("stock-source-note"), payload);
      if (payload.validationError) {
        input.setAttribute("aria-invalid", "true");
        status.className = "acme-data-state is-error";
        status.textContent = payload.validationError;
      } else if (!payload.matches?.length) {
        const isUnconfirmed = response.status >= 500 || payload.partial;
        status.className = isUnconfirmed
          ? "acme-data-state is-error"
          : "acme-data-state is-partial";
        status.textContent =
          isUnconfirmed
            ? "部分官方股票資料暫時無法讀取，無法確認是否有符合結果，請稍後再試。"
            : `找不到「${query}」的上市或上櫃盤後資料。`;
      } else {
        status.className = payload.partial
          ? "acme-data-state is-partial"
          : "acme-data-state";
        status.textContent = payload.partial
          ? `找到 ${payload.matches.length} 筆結果；部分官方來源暫時無法讀取，資格狀態可能不完整。`
          : `找到 ${payload.matches.length} 筆官方盤後結果。`;
      }
    } catch {
      results.replaceChildren();
      status.className = "acme-data-state is-error";
      status.textContent = "股票查詢暫時無法使用，請稍後再試。";
    } finally {
      results.removeAttribute("aria-busy");
    }
  }

  function init(documentRef = globalScope.document, fetchImpl = globalScope.fetch) {
    if (!documentRef) return;
    const form = documentRef.getElementById("stock-search-form");
    const input = documentRef.getElementById("stock-query");
    if (globalScope.location?.protocol === "file:") {
      if (form) {
        form.querySelectorAll("input, button").forEach((control) => {
          control.disabled = true;
        });
      }
      const status = documentRef.getElementById("stock-search-status");
      if (status) {
        status.className = "acme-data-state is-partial";
        status.textContent =
          "個股查詢需由已部署網站使用；直接開啟檔案時不影響當沖試算。";
      }
    } else if (form && typeof fetchImpl === "function") {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitStockSearch(documentRef, fetchImpl);
      });
      input?.addEventListener("input", () => input.removeAttribute("aria-invalid"));
    }
    if (typeof fetchImpl === "function") {
      loadMarketOverview(documentRef, fetchImpl);
    }
  }

  const api = {
    applyPriceToCalculator,
    dayTradeDescription,
    formatChange,
    formatDate,
    formatNumber,
    init,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init(document));
    } else {
      init(document);
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
