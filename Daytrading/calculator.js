(function (globalScope) {
  const moneyFormatter = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  });
  const priceFormatter = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const DEFAULTS = {
    side: "buyThenSell",
    buyPrice: 100,
    sellPrice: 101.24,
    shareCount: 1000,
    commissionRatePercent: 0.1425,
    commissionDiscount: 2.8,
    minimumFee: 20,
    applyMinimumFee: true,
    taxRatePercent: 0.15,
    targetReturnPercent: 1,
  };

  function roundMoney(value) {
    return Math.round(value);
  }

  function money(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return moneyFormatter.format(value);
  }

  function formatPrice(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }
    return priceFormatter.format(value);
  }

  function moneyAbs(value) {
    return money(Math.abs(value));
  }

  function calculateSingleFee(amount, commissionRatePercent, commissionDiscount, minimumFee, applyMinimumFee) {
    const feeRaw = amount * (commissionRatePercent / 100) * (commissionDiscount / 10);
    const flooredFee = applyMinimumFee ? Math.max(feeRaw, minimumFee) : feeRaw;
    return roundMoney(flooredFee);
  }

  function validateInputs({
    buyPrice,
    sellPrice,
    shareCount,
    commissionRatePercent,
    commissionDiscount,
    minimumFee,
    applyMinimumFee,
    taxRatePercent,
    targetReturnPercent = DEFAULTS.targetReturnPercent,
  }) {
    const errors = {
      buyPrice: "",
      sellPrice: "",
      shareCount: "",
      commissionRatePercent: "",
      commissionDiscount: "",
      minimumFee: "",
      taxRatePercent: "",
      targetReturnPercent: "",
    };

    if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
      errors.buyPrice = "買進價必須為大於 0 的數字。";
    }
    if (!Number.isFinite(sellPrice) || sellPrice <= 0) {
      errors.sellPrice = "賣出價必須為大於 0 的數字。";
    }
    if (!Number.isFinite(shareCount) || !Number.isInteger(shareCount) || shareCount <= 0) {
      errors.shareCount = "股數必須為正整數。";
    }

    if (!Number.isFinite(commissionRatePercent) || commissionRatePercent < 0) {
      errors.commissionRatePercent = "券商手續費率必須為大於等於 0 的數字。";
    }
    if (
      !Number.isFinite(commissionDiscount) ||
      commissionDiscount < 1 ||
      commissionDiscount > 10
    ) {
      errors.commissionDiscount = "電子下單折扣必須介於 1 到 10 折。";
    }
    if (!Number.isFinite(minimumFee) || minimumFee < 0) {
      errors.minimumFee = "每筆最低手續費必須為大於等於 0 的數字。";
    }
    if (!Number.isFinite(taxRatePercent) || taxRatePercent < 0) {
      errors.taxRatePercent = "當沖證交稅率必須為大於等於 0 的數字。";
    }
    if (!Number.isFinite(targetReturnPercent) || targetReturnPercent < 1) {
      errors.targetReturnPercent = "目標淨報酬率必須至少為 1%。";
    }

    return {
      errors,
      isValid:
        !errors.buyPrice &&
        !errors.sellPrice &&
        !errors.shareCount &&
        !errors.commissionRatePercent &&
        !errors.commissionDiscount &&
        !errors.minimumFee &&
        !errors.taxRatePercent &&
        !errors.targetReturnPercent,
    };
  }

  function calculateCoreResult({
    buyPrice,
    sellPrice,
    shareCount,
    commissionRatePercent,
    commissionDiscount,
    minimumFee,
    applyMinimumFee,
    taxRatePercent,
  }) {
    const grossBuyAmount = buyPrice * shareCount;
    const grossSellAmount = sellPrice * shareCount;
    const buyFee = calculateSingleFee(
      grossBuyAmount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee
    );
    const sellFee = calculateSingleFee(
      grossSellAmount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee
    );
    const tax = roundMoney(grossSellAmount * (taxRatePercent / 100));
    const grossDiff = grossSellAmount - grossBuyAmount;
    const totalCost = buyFee + sellFee + tax;
    const netProfit = grossDiff - totalCost;
    const netReturnRate = grossBuyAmount === 0 ? 0 : (netProfit / grossBuyAmount) * 100;
    return {
      grossBuyAmount,
      grossSellAmount,
      buyFee,
      sellFee,
      tax,
      grossDiff,
      totalCost,
      netProfit,
      netReturnRate,
    };
  }

  function calculateNetProfit({
    buyPrice,
    sellPrice,
    shareCount,
    commissionRatePercent,
    commissionDiscount,
    minimumFee,
    applyMinimumFee,
    taxRatePercent,
  }) {
    const parsed = validateInputs({
      buyPrice,
      sellPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      taxRatePercent,
    });
    if (!parsed.isValid) {
      return null;
    }
    return calculateCoreResult({
      buyPrice,
      sellPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
    }).netProfit;
  }

  function calculateIntradayPnL({
    side = DEFAULTS.side,
    buyPrice,
    sellPrice,
    shareCount,
    commissionRatePercent = DEFAULTS.commissionRatePercent,
    commissionDiscount = DEFAULTS.commissionDiscount,
    minimumFee = DEFAULTS.minimumFee,
    applyMinimumFee = DEFAULTS.applyMinimumFee,
    taxRatePercent = DEFAULTS.taxRatePercent,
    targetReturnPercent = DEFAULTS.targetReturnPercent,
  }) {
    const parsed = validateInputs({
      buyPrice,
      sellPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
      targetReturnPercent,
    });
    if (!parsed.isValid) {
      return {
        valid: false,
        errors: parsed.errors,
        data: null,
      };
    }

    const core = calculateCoreResult({
      buyPrice,
      sellPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
    });

    const breakEvenPrice = calculateBreakEvenPrice({
      side,
      buyPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
    });

    return {
      valid: true,
      errors: parsed.errors,
      data: {
        ...core,
        breakEvenPrice,
        status:
          core.netProfit > 0 ? "positive" : core.netProfit < 0 ? "negative" : "neutral",
        side,
        summary: buildSummary({
          grossDiff: core.grossDiff,
          netProfit: core.netProfit,
          totalCost: core.totalCost,
          side,
          shareCount,
        }),
      },
    };
  }

  function evaluateNetProfit(params) {
    return calculateNetProfit(params);
  }

  function calculateBreakEvenPrice({
    side,
    buyPrice,
    shareCount,
    commissionRatePercent,
    commissionDiscount,
    minimumFee,
    applyMinimumFee,
    taxRatePercent,
  }) {
    const parsed = validateInputs({
      buyPrice,
      sellPrice: buyPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
    });
    if (!parsed.isValid) {
      return null;
    }

    const evaluate = (sellPrice) =>
      evaluateNetProfit({
        side,
        buyPrice,
        sellPrice,
        shareCount,
        commissionRatePercent,
        commissionDiscount,
        minimumFee,
        applyMinimumFee,
        taxRatePercent,
      });

    let low = 0;
    let high = Math.max(1, buyPrice);
    let candidate = evaluate(high);
    for (let i = 0; i < 80 && candidate !== null && candidate < 0; i += 1) {
      high *= 2;
      candidate = evaluate(high);
    }
    if (candidate === null || candidate < 0) {
      return null;
    }

    for (let i = 0; i < 70; i += 1) {
      const mid = (low + high) / 2;
      const profit = evaluate(mid);
      if (profit === null) {
        return null;
      }
      if (profit >= 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    let price = Number((high).toFixed(2));
    while (price - 0.01 >= 0) {
      const previous = evaluate(Number((price - 0.01).toFixed(2)));
      if (previous !== null && previous >= 0) {
        price = Number((price - 0.01).toFixed(2));
        continue;
      }
      break;
    }

    while (evaluate(price) !== null && evaluate(price) < 0) {
      price = Number((price + 0.01).toFixed(2));
      if (price > 1_000_000) {
        return null;
      }
    }

    return Number(price.toFixed(2));
  }

  function calculateSellPriceForTargetReturn({
    buyPrice,
    shareCount,
    commissionRatePercent = DEFAULTS.commissionRatePercent,
    commissionDiscount = DEFAULTS.commissionDiscount,
    minimumFee = DEFAULTS.minimumFee,
    applyMinimumFee = DEFAULTS.applyMinimumFee,
    taxRatePercent = DEFAULTS.taxRatePercent,
    targetReturnPercent = DEFAULTS.targetReturnPercent,
  }) {
    const parsed = validateInputs({
      buyPrice,
      sellPrice: buyPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
      targetReturnPercent,
    });
    if (!parsed.isValid) return null;

    const evaluate = (sellPrice) =>
      calculateCoreResult({
        buyPrice,
        sellPrice,
        shareCount,
        commissionRatePercent,
        commissionDiscount,
        minimumFee,
        applyMinimumFee,
        taxRatePercent,
      }).netReturnRate;

    let low = buyPrice;
    let high = Math.max(buyPrice + 0.01, buyPrice * (1 + targetReturnPercent / 100));
    let highReturn = evaluate(high);
    for (let i = 0; i < 80 && highReturn < targetReturnPercent; i += 1) {
      high *= 1.5;
      highReturn = evaluate(high);
    }
    if (!Number.isFinite(highReturn) || highReturn < targetReturnPercent) return null;

    for (let i = 0; i < 70; i += 1) {
      const mid = (low + high) / 2;
      if (evaluate(mid) >= targetReturnPercent) {
        high = mid;
      } else {
        low = mid;
      }
    }

    let price = Math.ceil((high - Number.EPSILON) * 100) / 100;
    while (price > 0.01 && evaluate(Number((price - 0.01).toFixed(2))) >= targetReturnPercent) {
      price = Number((price - 0.01).toFixed(2));
    }
    while (evaluate(price) < targetReturnPercent) {
      price = Number((price + 0.01).toFixed(2));
    }
    return Number(price.toFixed(2));
  }

  function calculateBuyPriceForTargetReturn({
    sellPrice,
    shareCount,
    commissionRatePercent = DEFAULTS.commissionRatePercent,
    commissionDiscount = DEFAULTS.commissionDiscount,
    minimumFee = DEFAULTS.minimumFee,
    applyMinimumFee = DEFAULTS.applyMinimumFee,
    taxRatePercent = DEFAULTS.taxRatePercent,
    targetReturnPercent = DEFAULTS.targetReturnPercent,
  }) {
    const parsed = validateInputs({
      buyPrice: sellPrice,
      sellPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
      targetReturnPercent,
    });
    if (!parsed.isValid) return null;

    const evaluate = (buyPrice) =>
      calculateCoreResult({
        buyPrice,
        sellPrice,
        shareCount,
        commissionRatePercent,
        commissionDiscount,
        minimumFee,
        applyMinimumFee,
        taxRatePercent,
      }).netReturnRate;

    let low = 0.01;
    let high = sellPrice;
    if (evaluate(low) < targetReturnPercent) return null;

    for (let i = 0; i < 70; i += 1) {
      const mid = (low + high) / 2;
      if (evaluate(mid) >= targetReturnPercent) {
        low = mid;
      } else {
        high = mid;
      }
    }

    let price = Math.floor((low + Number.EPSILON) * 100) / 100;
    while (price + 0.01 < sellPrice && evaluate(Number((price + 0.01).toFixed(2))) >= targetReturnPercent) {
      price = Number((price + 0.01).toFixed(2));
    }
    while (price >= 0.01 && evaluate(price) < targetReturnPercent) {
      price = Number((price - 0.01).toFixed(2));
    }
    return price >= 0.01 ? Number(price.toFixed(2)) : null;
  }

  function buildSummary({ grossDiff, netProfit, totalCost, side, shareCount }) {
    if (shareCount <= 0 || !Number.isFinite(grossDiff)) {
      return "資料不足，無法產生摘要。";
    }
    const perShare = grossDiff / shareCount;
    const action = side === "sellThenBuy" ? "先賣後買" : "先買後賣";
    const direction = netProfit >= 0 ? "賺" : "虧";
    const profitAmount = direction === "虧" ? moneyAbs(netProfit) : money(netProfit);
    return `${action}情境下每股價差 ${money(perShare)}，扣除約 ${money(totalCost)} 成本後，預估淨${direction} ${profitAmount}。`;
  }

  function setFieldError(field, message) {
    const errorEl = document.getElementById(`${field}-error`);
    const inputEl = document.getElementById(field);
    if (!errorEl || !inputEl) return;
    errorEl.textContent = message || "";
    inputEl.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function formatRate(value) {
    return `${new Intl.NumberFormat("zh-TW", {
      maximumFractionDigits: 4,
    }).format(value)}%`;
  }

  function updateUI(result) {
    const statusTitle = document.getElementById("status-title");
    const netProfitEl = document.getElementById("net-profit");
    const statusText = document.getElementById("status-text");
    const netSummary = document.getElementById("human-summary");
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setFieldError("buy-price", result?.errors?.buyPrice || "");
    setFieldError("sell-price", result?.errors?.sellPrice || "");
    setFieldError("share-count", result?.errors?.shareCount || "");
    setFieldError("commission-rate", result?.errors?.commissionRatePercent || "");
    setFieldError("commission-discount", result?.errors?.commissionDiscount || "");
    setFieldError("minimum-fee", result?.errors?.minimumFee || "");
    setFieldError("tax-rate", result?.errors?.taxRatePercent || "");
    setFieldError("target-return", result?.errors?.targetReturnPercent || "");

    if (!result.valid) {
      statusTitle.textContent = "請先完成有效輸入";
      statusText.textContent = "請補齊交易欄位後再試算。";
      statusText.className = "acme-status status-warning";
      setText("net-profit", "—");
      netProfitEl.className = "acme-kpi";
      setText("gross-buy", "—");
      setText("gross-diff", "—");
      setText("total-cost", "—");
      setText("net-return", "—");
      setText("breakeven", "—");
      setText("metric-buy-amount", "—");
      setText("metric-buy-fee", "—");
      setText("metric-sell-amount", "—");
      setText("metric-sell-fee", "—");
      setText("metric-tax", "—");
      setText("metric-total-cost", "—");
      setText("metric-net-profit", "—");
      netSummary.textContent = "請輸入完整且正確資料後再試算。";
      return;
    }

    const d = result.data;
    statusTitle.textContent = d.netProfit >= 0 ? "預估淨獲利" : "預估淨損失";
    setText("net-profit", money(d.netProfit));
    netProfitEl.className = `acme-kpi status-${d.status}`;
    statusText.textContent =
      d.netProfit > 0
        ? "損益為正，預估有利可圖。"
        : d.netProfit < 0
          ? "損益為負，請注意交易成本。"
          : "損益接近 0，接近平衡。";
    statusText.className = `acme-status status-${d.status === "neutral" ? "warning" : d.status}`;
    setText("gross-buy", money(d.grossBuyAmount));
    setText("gross-diff", money(d.grossDiff));
    setText("total-cost", money(d.totalCost));
    setText("net-return", `${formatRate(d.netReturnRate)}`);
    setText("breakeven", d.breakEvenPrice == null ? "—" : formatPrice(d.breakEvenPrice));
    setText("metric-buy-amount", money(d.grossBuyAmount));
    setText("metric-buy-fee", money(d.buyFee));
    setText("metric-sell-amount", money(d.grossSellAmount));
    setText("metric-sell-fee", money(d.sellFee));
    setText("metric-tax", money(d.tax));
    setText("metric-total-cost", money(d.totalCost));
    setText("metric-net-profit", money(d.netProfit));
    netSummary.textContent = d.summary;
  }

  function toDecimalOrNaN(value, decimals = 2) {
    const trimmed = value?.trim();
    if (!trimmed) return NaN;
    const escaped = trimmed.replace(/,/g, "");
    const pattern =
      decimals === 0
        ? /^\d+$/
        : new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`);
    if (!pattern.test(escaped)) return NaN;
    return Number(escaped);
  }

  function toAnyDecimalOrNaN(value) {
    const trimmed = value?.trim();
    if (!trimmed) return NaN;
    const escaped = trimmed.replace(/,/g, "");
    if (!/^-?\d+(?:\.\d+)?$/.test(escaped)) return NaN;
    return Number(escaped);
  }

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function recalc() {
    const side = document.querySelector('input[name="trade-direction"]:checked')?.value || DEFAULTS.side;
    const buyPrice = toDecimalOrNaN(getInputValue("buy-price"), 2);
    const sellPrice = toDecimalOrNaN(getInputValue("sell-price"), 2);
    const shareCount = toDecimalOrNaN(getInputValue("share-count"), 0);
    const commissionRatePercent = toAnyDecimalOrNaN(getInputValue("commission-rate"));
    const commissionDiscount = toAnyDecimalOrNaN(getInputValue("commission-discount"));
    const minimumFee = toAnyDecimalOrNaN(getInputValue("minimum-fee"));
    const applyMinimumFee = document.getElementById("apply-minimum-fee").checked;
    const taxRatePercent = toAnyDecimalOrNaN(getInputValue("tax-rate"));
    const targetReturnPercent = toAnyDecimalOrNaN(getInputValue("target-return"));

    const rawResult = calculateIntradayPnL({
      side,
      buyPrice,
      sellPrice,
      shareCount,
      commissionRatePercent,
      commissionDiscount,
      minimumFee,
      applyMinimumFee,
      taxRatePercent,
      targetReturnPercent,
    });
    updateUI(rawResult);
  }

  function getTargetPriceContext() {
    return {
      shareCount: toDecimalOrNaN(getInputValue("share-count"), 0),
      commissionRatePercent: toAnyDecimalOrNaN(getInputValue("commission-rate")),
      commissionDiscount: toAnyDecimalOrNaN(getInputValue("commission-discount")),
      minimumFee: toAnyDecimalOrNaN(getInputValue("minimum-fee")),
      applyMinimumFee: document.getElementById("apply-minimum-fee").checked,
      taxRatePercent: toAnyDecimalOrNaN(getInputValue("tax-rate")),
      targetReturnPercent: toAnyDecimalOrNaN(getInputValue("target-return")),
    };
  }

  function announceAutoPrice(message) {
    const status = document.getElementById("auto-price-status");
    if (status) status.textContent = message;
  }

  function syncSellPriceFromBuy() {
    const buyPrice = toDecimalOrNaN(getInputValue("buy-price"), 2);
    const sellPrice = calculateSellPriceForTargetReturn({
      buyPrice,
      ...getTargetPriceContext(),
    });
    if (sellPrice == null) {
      announceAutoPrice("目前設定無法反推出符合目標的賣出價。");
      return false;
    }
    document.getElementById("sell-price").value = sellPrice.toFixed(2);
    announceAutoPrice(`已依買進價反推賣出價 ${formatPrice(sellPrice)}，預估淨報酬率至少 ${getInputValue("target-return")}%。`);
    return true;
  }

  function syncBuyPriceFromSell() {
    const sellPrice = toDecimalOrNaN(getInputValue("sell-price"), 2);
    const buyPrice = calculateBuyPriceForTargetReturn({
      sellPrice,
      ...getTargetPriceContext(),
    });
    if (buyPrice == null) {
      announceAutoPrice("目前設定無法反推出符合目標的買進價。");
      return false;
    }
    document.getElementById("buy-price").value = buyPrice.toFixed(2);
    announceAutoPrice(`已依賣出價反推買進價 ${formatPrice(buyPrice)}，預估淨報酬率至少 ${getInputValue("target-return")}%。`);
    return true;
  }

  function bindEvents() {
    let lastEditedPrice = "buy";
    const buyInput = document.getElementById("buy-price");
    const sellInput = document.getElementById("sell-price");
    buyInput.addEventListener("input", () => {
      lastEditedPrice = "buy";
      syncSellPriceFromBuy();
      recalc();
    });
    sellInput.addEventListener("input", () => {
      lastEditedPrice = "sell";
      syncBuyPriceFromSell();
      recalc();
    });

    const priceContextInputs = [
      "share-count",
      "commission-rate",
      "commission-discount",
      "minimum-fee",
      "apply-minimum-fee",
      "tax-rate",
      "target-return",
    ];
    for (const id of priceContextInputs) {
      const el = document.getElementById(id);
      if (!el) continue;
      const updatePrices = () => {
        if (lastEditedPrice === "sell") {
          syncBuyPriceFromSell();
        } else {
          syncSellPriceFromBuy();
        }
        recalc();
      };
      el.addEventListener("input", updatePrices);
      el.addEventListener("change", updatePrices);
    }

    const rerenderers = [
      "direction-buy",
      "direction-sell",
    ];

    for (const id of rerenderers) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.addEventListener("input", recalc);
      el.addEventListener("change", recalc);
    }

    document.querySelectorAll("[data-shares]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const shares = Number(btn.getAttribute("data-shares"));
        const target = document.getElementById("share-count");
        if (target) {
          target.value = String(shares);
          if (lastEditedPrice === "sell") {
            syncBuyPriceFromSell();
          } else {
            syncSellPriceFromBuy();
          }
          recalc();
        }
      });
    });

    const resetBtn = document.getElementById("reset-sample");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        document.getElementById("buy-price").value = String(DEFAULTS.buyPrice);
        document.getElementById("sell-price").value = String(DEFAULTS.sellPrice);
        document.getElementById("share-count").value = String(DEFAULTS.shareCount);
        document.getElementById("commission-rate").value = String(DEFAULTS.commissionRatePercent);
        document.getElementById("commission-discount").value = String(DEFAULTS.commissionDiscount);
        document.getElementById("minimum-fee").value = String(DEFAULTS.minimumFee);
        document.getElementById("apply-minimum-fee").checked = DEFAULTS.applyMinimumFee;
        document.getElementById("tax-rate").value = String(DEFAULTS.taxRatePercent);
        document.getElementById("target-return").value = String(DEFAULTS.targetReturnPercent);
        document.getElementById("direction-buy").checked = true;
        lastEditedPrice = "buy";
        syncSellPriceFromBuy();
        recalc();
      });
    }
  }

  function mountDefaults() {
    document.getElementById("buy-price").value = String(DEFAULTS.buyPrice);
    document.getElementById("sell-price").value = String(DEFAULTS.sellPrice);
    document.getElementById("share-count").value = String(DEFAULTS.shareCount);
    document.getElementById("commission-rate").value = String(DEFAULTS.commissionRatePercent);
    document.getElementById("commission-discount").value = String(DEFAULTS.commissionDiscount);
    document.getElementById("minimum-fee").value = String(DEFAULTS.minimumFee);
    document.getElementById("apply-minimum-fee").checked = DEFAULTS.applyMinimumFee;
    document.getElementById("tax-rate").value = String(DEFAULTS.taxRatePercent);
    document.getElementById("target-return").value = String(DEFAULTS.targetReturnPercent);
    document.getElementById("direction-buy").checked = true;
  }

  function initializeUI() {
    mountDefaults();
    syncSellPriceFromBuy();
    bindEvents();
    recalc();
  }

  const api = {
    DEFAULTS,
    moneyFormatter,
    money,
    formatPrice,
    validateInputs,
    calculateIntradayPnL,
    calculateBreakEvenPrice,
    calculateSellPriceForTargetReturn,
    calculateBuyPriceForTargetReturn,
    calculateNetProfit,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.DaytradingCalculator = api;
  if (typeof document !== "undefined") {
    initializeUI();
  }
})(typeof window !== "undefined" ? window : global);
