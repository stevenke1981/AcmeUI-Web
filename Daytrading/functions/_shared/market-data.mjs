const EMPTY_MARKERS = new Set(["", "-", "--", "---", "N/A", "null", "undefined"]);

export const OFFICIAL_SOURCES = Object.freeze({
  twseSummary: {
    id: "twse-summary",
    organization: "臺灣證券交易所",
    label: "每日市場成交資訊",
    url: "https://openapi.twse.com.tw/v1/exchangeReport/FMTQIK",
  },
  twseQuotes: {
    id: "twse-quotes",
    organization: "臺灣證券交易所",
    label: "上市個股日成交資訊",
    url: "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
  },
  twseEligibility: {
    id: "twse-eligibility",
    organization: "臺灣證券交易所",
    label: "上市股票當日沖銷交易標的",
    url: "https://openapi.twse.com.tw/v1/exchangeReport/TWTB4U",
  },
  twseNews: {
    id: "twse-news",
    organization: "臺灣證券交易所",
    label: "證交所最新消息",
    url: "https://openapi.twse.com.tw/v1/news/newsList",
  },
  tpexSummary: {
    id: "tpex-summary",
    organization: "證券櫃檯買賣中心",
    label: "櫃買指數收盤行情",
    url: "https://app.tpex.org.tw/data/11.json",
    responseKind: "tpex-app-summary",
  },
  tpexTurnover: {
    id: "tpex-turnover",
    organization: "證券櫃檯買賣中心",
    label: "上櫃個股成交值排行",
    url: "https://app.tpex.org.tw/data/18.json",
    responseKind: "tpex-app-turnover",
  },
  tpexQuotes: {
    id: "tpex-quotes",
    organization: "證券櫃檯買賣中心",
    label: "上櫃股票收盤行情",
    url: "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes",
  },
  tpexEligibility: {
    id: "tpex-eligibility",
    organization: "證券櫃檯買賣中心",
    label: "上櫃股票現股當沖交易標的",
    url: "https://www.tpex.org.tw/openapi/v1/tpex_securities",
  },
});

export function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return EMPTY_MARKERS.has(text) ? null : text;
}

export function normalizeNumber(value) {
  const text = normalizeText(value);
  if (text === null) return null;
  const normalized = text.replace(/,/g, "").replace(/%$/, "").trim();
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function normalizeRocDate(value) {
  const text = normalizeText(value);
  if (text === null) return null;
  const digits = text.replace(/[./-]/g, "");
  if (!/^\d{6,8}$/.test(digits)) return null;

  const yearLength = digits.length - 4;
  let year = Number(digits.slice(0, yearLength));
  const month = Number(digits.slice(yearLength, yearLength + 2));
  const day = Number(digits.slice(yearLength + 2));
  if (yearLength < 4) year += 1911;

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1912 ||
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function changePercent(close, change) {
  if (close === null || change === null) return null;
  const previousClose = close - change;
  if (!(previousClose > 0)) return null;
  return (change / previousClose) * 100;
}

export function normalizeTwseSummary(rows) {
  if (!Array.isArray(rows)) return null;
  const normalized = rows
    .map((row) => {
      const close = normalizeNumber(row?.TAIEX);
      const change = normalizeNumber(row?.Change);
      return {
        market: "TWSE",
        date: normalizeRocDate(row?.Date),
        indexName: "發行量加權股價指數",
        close,
        change,
        changePercent: changePercent(close, change),
        tradeVolume: normalizeNumber(row?.TradeVolume),
        tradeVolumeUnit: "shares",
        tradeValue: normalizeNumber(row?.TradeValue),
        tradeValueUnit: "TWD",
        transactions: normalizeNumber(row?.Transaction),
      };
    })
    .filter((row) => row.date && row.close !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  return normalized[0] ?? null;
}

export function normalizeTpexSummary(rows) {
  if (!Array.isArray(rows)) return null;
  const normalized = rows
    .map((row) => {
      const close = normalizeNumber(row?.CloseIndex ?? row?.Close);
      const change = normalizeNumber(row?.IndexChange ?? row?.Change);
      return {
        market: "TPEx",
        date: normalizeRocDate(row?.Date),
        indexName: "櫃買指數",
        close,
        change,
        changePercent: changePercent(close, change),
        tradeVolume: normalizeNumber(row?.DailyTradingVolume),
        tradeVolumeUnit: "thousand-shares",
        tradeValue: normalizeNumber(row?.DailyTradingValue),
        tradeValueUnit: "TWD-million",
        transactions: null,
        advances: normalizeNumber(row?.PriceRiseCompanyNumbers),
        declines: normalizeNumber(row?.PriceDeclineCompanyNumbers),
        unchanged: normalizeNumber(row?.PriceFlatCompanyNumbers),
      };
    })
    .filter((row) => row.date && row.close !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  return normalized[0] ?? null;
}

export function normalizeTwseQuote(row) {
  const code = normalizeText(row?.Code);
  const name = normalizeText(row?.Name);
  const date = normalizeRocDate(row?.Date);
  if (!code || !name || !date) return null;
  return {
    market: "TWSE",
    marketLabel: "上市",
    date,
    code,
    name,
    open: normalizeNumber(row.OpeningPrice),
    high: normalizeNumber(row.HighestPrice),
    low: normalizeNumber(row.LowestPrice),
    close: normalizeNumber(row.ClosingPrice),
    change: normalizeNumber(row.Change),
    volume: normalizeNumber(row.TradeVolume),
    turnover: normalizeNumber(row.TradeValue),
    transactions: normalizeNumber(row.Transaction),
  };
}

export function normalizeTpexQuote(row) {
  const code = normalizeText(row?.SecuritiesCompanyCode);
  const name = normalizeText(row?.CompanyName);
  const date = normalizeRocDate(row?.Date);
  if (!code || !name || !date) return null;
  return {
    market: "TPEx",
    marketLabel: "上櫃",
    date,
    code,
    name,
    open: normalizeNumber(row.Open),
    high: normalizeNumber(row.High),
    low: normalizeNumber(row.Low),
    close: normalizeNumber(row.Close),
    change: normalizeNumber(row.Change),
    volume: normalizeNumber(row.TradingShares),
    turnover: normalizeNumber(row.TransactionAmount),
    transactions: normalizeNumber(row.TransactionNumber),
  };
}

export function normalizeQuoteRows(rows, market) {
  if (!Array.isArray(rows)) return [];
  const normalizer = market === "TWSE" ? normalizeTwseQuote : normalizeTpexQuote;
  return rows.map(normalizer).filter(Boolean);
}

export function topTurnover(rows, market, limit = 8) {
  return normalizeQuoteRows(rows, market)
    .filter((row) => row.turnover !== null)
    .sort((a, b) => b.turnover - a.turnover || a.code.localeCompare(b.code))
    .slice(0, limit);
}

export function normalizeEligibilityRows(rows, market) {
  if (!Array.isArray(rows)) return new Map();
  const entries = [];
  for (const row of rows) {
    const code = normalizeText(
      market === "TWSE" ? row?.Code : row?.["證券代號"],
    );
    const date = normalizeRocDate(
      market === "TWSE" ? row?.Date : row?.["資料日期"],
    );
    if (!code || !date) continue;
    entries.push([
      code,
      {
        date,
        restriction:
          normalizeText(
            market === "TWSE"
              ? row?.Suspension
              : row?.["暫停現股賣出後現款買進當沖註記"],
          ) ?? null,
      },
    ]);
  }
  return new Map(entries);
}

export function normalizeNews(rows, limit = 6) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const title = normalizeText(row?.Title);
      const date = normalizeRocDate(row?.Date);
      const url = normalizeText(row?.Url);
      let safeUrl = null;
      try {
        const parsed = new URL(url);
        const isTwseHost =
          parsed.hostname === "twse.com.tw" || parsed.hostname.endsWith(".twse.com.tw");
        if (parsed.protocol === "https:" && isTwseHost) {
          safeUrl = parsed.href;
        }
      } catch {
        safeUrl = null;
      }
      return title && date && safeUrl ? { title, date, url: safeUrl } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

async function fetchOfficialJson(fetchImpl, source) {
  const response = await fetchImpl(source.url, {
    headers: { Accept: "application/json" },
    cf: {
      cacheEverything: true,
      cacheTtlByStatus: { "200-299": 300, "400-599": 0 },
    },
  });
  if (!response?.ok) {
    throw new Error(`官方來源回應 HTTP ${response?.status ?? "unknown"}`);
  }
  const data = await response.json();
  if (source.responseKind === "tpex-app-summary") {
    const row = data?.tables?.[0]?.data?.find((entry) => entry?.[0] === "櫃買指數");
    if (!row || !data.date) {
      throw new Error("櫃買指數官方來源缺少必要欄位");
    }
    return [{ Date: data.date, Close: row[1], Change: row[2] }];
  }
  if (source.responseKind === "tpex-app-turnover") {
    const rows = data?.tables?.[0]?.data;
    if (!Array.isArray(rows) || !data.date) {
      throw new Error("上櫃成交值官方來源缺少必要欄位");
    }
    return rows.map((row) => ({
      Date: data.date,
      SecuritiesCompanyCode: row?.[1],
      CompanyName: row?.[2],
      TransactionAmount:
        normalizeNumber(row?.[3]) === null ? null : normalizeNumber(row?.[3]) * 1000,
    }));
  }
  if (!Array.isArray(data)) {
    throw new Error("官方來源回應格式不是資料陣列");
  }
  return data;
}

export async function collectOfficialSources(sourceKeys, fetchImpl = fetch) {
  const settled = await Promise.all(
    sourceKeys.map(async (key) => {
      const source = OFFICIAL_SOURCES[key];
      try {
        return { key, source, data: await fetchOfficialJson(fetchImpl, source), error: null };
      } catch (error) {
        return {
          key,
          source,
          data: null,
          error: error instanceof Error ? error.message : "無法讀取官方來源",
        };
      }
    }),
  );

  const data = Object.fromEntries(settled.map((entry) => [entry.key, entry.data]));
  const errors = settled
    .filter((entry) => entry.error)
    .map((entry) => ({
      source: entry.source.id,
      organization: entry.source.organization,
      message: entry.error,
    }));
  return { settled, data, errors };
}

function sourceDateFor(key, data) {
  if (!data) return null;
  if (key === "twseSummary") return normalizeTwseSummary(data)?.date ?? null;
  if (key === "tpexSummary") return normalizeTpexSummary(data)?.date ?? null;
  if (key === "twseNews") return normalizeNews(data, 1)[0]?.date ?? null;
  if (key === "twseQuotes") return normalizeQuoteRows(data, "TWSE")[0]?.date ?? null;
  if (key === "tpexQuotes") return normalizeQuoteRows(data, "TPEx")[0]?.date ?? null;
  const market = key === "twseEligibility" ? "TWSE" : "TPEx";
  return normalizeEligibilityRows(data, market).values().next().value?.date ?? null;
}

function publicSources(settled) {
  return settled.map(({ key, source, data, error }) => ({
    id: source.id,
    organization: source.organization,
    label: source.label,
    url: source.url,
    date: sourceDateFor(key, data),
    available: !error,
  }));
}

export async function buildMarketOverview({
  fetchImpl = fetch,
  now = new Date(),
} = {}) {
  const sourceKeys = [
    "twseSummary",
    "twseQuotes",
    "twseNews",
    "tpexSummary",
    "tpexTurnover",
  ];
  const collected = await collectOfficialSources(sourceKeys, fetchImpl);
  const twseSummary = normalizeTwseSummary(collected.data.twseSummary);
  const tpexQuoteRows = normalizeQuoteRows(collected.data.tpexTurnover, "TPEx");
  const tpexSummaryBase = normalizeTpexSummary(collected.data.tpexSummary);
  const tpexStatisticRows = tpexSummaryBase
    ? tpexQuoteRows.filter((row) => row.date === tpexSummaryBase.date)
    : [];
  const tpexSummary =
    tpexSummaryBase && tpexStatisticRows.length > 0
      ? {
          ...tpexSummaryBase,
          tradeVolume:
            tpexSummaryBase.tradeVolume ??
            tpexStatisticRows.reduce((sum, row) => sum + (row.volume ?? 0), 0) / 1000,
          tradeValue:
            tpexSummaryBase.tradeValue ??
            tpexStatisticRows.reduce((sum, row) => sum + (row.turnover ?? 0), 0) /
              1_000_000,
          advances:
            tpexSummaryBase.advances ??
            tpexStatisticRows.filter((row) => row.change !== null && row.change > 0)
              .length,
          declines:
            tpexSummaryBase.declines ??
            tpexStatisticRows.filter((row) => row.change !== null && row.change < 0)
              .length,
          unchanged:
            tpexSummaryBase.unchanged ??
            tpexStatisticRows.filter((row) => row.change !== null && row.change === 0)
              .length,
        }
      : tpexSummaryBase;
  const twseTurnover = topTurnover(collected.data.twseQuotes, "TWSE");
  const tpexTurnover = topTurnover(collected.data.tpexTurnover, "TPEx");
  const news = normalizeNews(collected.data.twseNews);

  return {
    generatedAt: now.toISOString(),
    nonRealtime: true,
    partial:
      collected.errors.length > 0 ||
      !twseSummary ||
      !tpexSummary ||
      twseTurnover.length === 0 ||
      tpexTurnover.length === 0 ||
      news.length === 0,
    errors: collected.errors,
    summaries: { twse: twseSummary, tpex: tpexSummary },
    turnover: { twse: twseTurnover, tpex: tpexTurnover },
    news,
    sources: publicSources(collected.settled),
  };
}

function matchScore(stock, query) {
  const folded = query.toLocaleLowerCase("zh-Hant-TW");
  const code = stock.code.toLocaleLowerCase("zh-Hant-TW");
  const name = stock.name.toLocaleLowerCase("zh-Hant-TW");
  if (code === folded) return 0;
  if (name === folded) return 1;
  if (code.startsWith(folded)) return 2;
  if (name.startsWith(folded)) return 3;
  if (code.includes(folded)) return 4;
  if (name.includes(folded)) return 5;
  return null;
}

function attachEligibility(stock, eligibilityMap, eligibilityAvailable) {
  if (!eligibilityAvailable) {
    return {
      ...stock,
      dayTrade: {
        status: "unknown",
        date: null,
        buyThenSell: null,
        sellThenBuy: null,
        restriction: "當沖標的官方來源目前無法取得",
      },
    };
  }
  const entry = eligibilityMap.get(stock.code);
  if (!entry) {
    return {
      ...stock,
      dayTrade: {
        status: "not-listed",
        date: null,
        buyThenSell: false,
        sellThenBuy: false,
        restriction: "未列於官方當日沖銷交易標的資料",
      },
    };
  }
  return {
    ...stock,
    dayTrade: {
      status: "eligible",
      date: entry.date,
      buyThenSell: true,
      sellThenBuy: !entry.restriction,
      restriction: entry.restriction,
    },
  };
}

export async function searchStocks(
  query,
  { fetchImpl = fetch, now = new Date(), limit = 8 } = {},
) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery || normalizedQuery.length > 40) {
    return {
      generatedAt: now.toISOString(),
      nonRealtime: true,
      partial: false,
      errors: [],
      query: normalizedQuery ?? "",
      matches: [],
      sources: [],
      validationError: "請輸入 1 至 40 個字元的股票代號或名稱",
    };
  }

  const sourceKeys = [
    "twseQuotes",
    "twseEligibility",
    "tpexQuotes",
    "tpexEligibility",
  ];
  const collected = await collectOfficialSources(sourceKeys, fetchImpl);
  const twseEligibility = normalizeEligibilityRows(
    collected.data.twseEligibility,
    "TWSE",
  );
  const tpexEligibility = normalizeEligibilityRows(
    collected.data.tpexEligibility,
    "TPEx",
  );
  const eligibilityAvailable = {
    TWSE: twseEligibility.size > 0,
    TPEx: tpexEligibility.size > 0,
  };

  const twseStocks = normalizeQuoteRows(collected.data.twseQuotes, "TWSE");
  const tpexStocks = normalizeQuoteRows(collected.data.tpexQuotes, "TPEx");
  const quoteAvailable = {
    TWSE: twseStocks.length > 0,
    TPEx: tpexStocks.length > 0,
  };
  const stocks = [...twseStocks, ...tpexStocks];
  const matches = stocks
    .map((stock) => ({ stock, score: matchScore(stock, normalizedQuery) }))
    .filter((entry) => entry.score !== null)
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.stock.market.localeCompare(b.stock.market) ||
        a.stock.code.localeCompare(b.stock.code),
    )
    .slice(0, limit)
    .map(({ stock }) =>
      attachEligibility(
        stock,
        stock.market === "TWSE" ? twseEligibility : tpexEligibility,
        eligibilityAvailable[stock.market],
      ),
    );

  return {
    generatedAt: now.toISOString(),
    nonRealtime: true,
    partial:
      collected.errors.length > 0 ||
      !quoteAvailable.TWSE ||
      !quoteAvailable.TPEx ||
      !eligibilityAvailable.TWSE ||
      !eligibilityAvailable.TPEx,
    errors: collected.errors,
    query: normalizedQuery,
    matches,
    sources: publicSources(collected.settled),
    availability: {
      quotes: quoteAvailable,
      eligibility: eligibilityAvailable,
    },
    validationError: null,
  };
}
