import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import {
  OFFICIAL_SOURCES,
  buildMarketOverview,
  normalizeNumber,
  normalizeQuoteRows,
  normalizeRocDate,
  normalizeTpexSummary,
  normalizeTwseSummary,
  searchStocks,
} from "./functions/_shared/market-data.mjs";
import { onRequestGet as getMarket } from "./functions/api/market.js";
import { onRequestGet as getStock } from "./functions/api/stock.js";

const require = createRequire(import.meta.url);
const {
  applyPriceToCalculator,
  dayTradeDescription,
  formatDate,
} = require("./market-info.js");

const fixtures = {
  twseSummary: [
    {
      Date: "1150727",
      TradeVolume: "1,000",
      TradeValue: "2,000",
      Transaction: "30",
      TAIEX: "23000.00",
      Change: "-10.50",
    },
    {
      Date: "1150728",
      TradeVolume: "2,000",
      TradeValue: "4,000",
      Transaction: "50",
      TAIEX: "23100.25",
      Change: "+100.25",
    },
  ],
  twseQuotes: [
    {
      Date: "1150728",
      Code: "2330",
      Name: "台積電",
      TradeVolume: "12,345",
      TradeValue: "12,345,000",
      OpeningPrice: "1000",
      HighestPrice: "1020",
      LowestPrice: "995",
      ClosingPrice: "1015",
      Change: "+15",
      Transaction: "999",
    },
    {
      Date: "1150728",
      Code: "2317",
      Name: "鴻海",
      TradeVolume: "8,000",
      TradeValue: "8,000,000",
      OpeningPrice: "200",
      HighestPrice: "205",
      LowestPrice: "198",
      ClosingPrice: "203",
      Change: "-2",
      Transaction: "500",
    },
  ],
  twseEligibility: [
    { Date: "1150729", Code: "2330", Name: "台積電", Suspension: "" },
  ],
  twseNews: [
    {
      Title: "測試消息",
      Url: "https://www.twse.com.tw/zh/about/news/news/content.html?id=1",
      Date: "1150728",
    },
    {
      Title: "不安全網址",
      Url: "https://example.com/not-official",
      Date: "1150728",
    },
    {
      Title: "偽裝的證交所網域",
      Url: "https://not-twse.com.tw/not-official",
      Date: "1150728",
    },
  ],
  tpexSummary: {
    date: "20260728",
    tables: [
      {
        data: [["櫃買指數", "250.50", "-1.25", "-0.50"]],
      },
    ],
  },
  tpexTurnover: {
    date: "20260728",
    tables: [
      {
        data: [
          ["1", "6488", "環球晶", "900"],
          ["2", "8299", "群聯", "800"],
        ],
      },
    ],
  },
  tpexQuotes: [
    {
      Date: "1150728",
      SecuritiesCompanyCode: "6488",
      CompanyName: "環球晶",
      Close: "450",
      Change: "+5",
      Open: "445",
      High: "455",
      Low: "440",
      TradingShares: "2,000",
      TransactionAmount: "900,000",
      TransactionNumber: "100",
    },
  ],
  tpexEligibility: [
    {
      資料日期: "1150729",
      證券代號: "6488",
      證券名稱: "環球晶",
      暫停現股賣出後現款買進當沖註記: "暫停",
    },
  ],
};

function fixtureFetch(overrides = {}) {
  const byUrl = new Map(
    Object.entries(OFFICIAL_SOURCES).map(([key, source]) => [
      source.url,
      Object.hasOwn(overrides, key) ? overrides[key] : fixtures[key],
    ]),
  );
  return async (url) => {
    const fixture = byUrl.get(url);
    if (fixture instanceof Error) throw fixture;
    if (fixture?.httpError) {
      return { ok: false, status: fixture.httpError, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => fixture };
  };
}

test("ROC date and official numeric values normalize defensively", () => {
  assert.equal(normalizeRocDate("1150728"), "2026-07-28");
  assert.equal(normalizeRocDate("115/02/29"), null);
  assert.equal(normalizeRocDate("not-a-date"), null);
  assert.equal(normalizeNumber("+1,234.50"), 1234.5);
  assert.equal(normalizeNumber("---"), null);
  assert.equal(normalizeNumber("12abc"), null);
});

test("summary normalizers select the latest valid row and preserve source units", () => {
  const twse = normalizeTwseSummary(fixtures.twseSummary);
  assert.equal(twse.date, "2026-07-28");
  assert.equal(twse.close, 23100.25);
  assert.equal(twse.tradeValueUnit, "TWD");

  const tpex = normalizeTpexSummary([
    {
      Date: "1150728",
      DailyTradingValue: "1,234",
      DailyTradingVolume: "5,678",
      CloseIndex: "250.50",
      IndexChange: "-1.25",
    },
  ]);
  assert.equal(tpex.close, 250.5);
  assert.equal(tpex.tradeValue, 1234);
  assert.equal(tpex.tradeValueUnit, "TWD-million");

  const tpexHistory = normalizeTpexSummary([
    { Date: "20260727", Close: "350.10", Change: "-1.20" },
    { Date: "20260728", Close: "352.42", Change: "+2.32" },
  ]);
  assert.equal(tpexHistory.date, "2026-07-28");
  assert.equal(tpexHistory.close, 352.42);
});

test("malformed quote rows are omitted without fabricated zero values", () => {
  const rows = normalizeQuoteRows(
    [
      { Date: "bad", Code: "2330", Name: "台積電" },
      { Date: "1150728", Code: "", Name: "缺代號" },
      {
        Date: "1150728",
        Code: "9999",
        Name: "欄位不完整",
        ClosingPrice: "---",
      },
    ],
    "TWSE",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].close, null);
  assert.equal(rows[0].volume, null);
});

test("market overview keeps healthy sections when one upstream fails", async () => {
  const payload = await buildMarketOverview({
    fetchImpl: fixtureFetch({ tpexSummary: new Error("upstream unavailable") }),
    now: new Date("2026-07-29T01:02:03.000Z"),
  });
  assert.equal(payload.generatedAt, "2026-07-29T01:02:03.000Z");
  assert.equal(payload.partial, true);
  assert.equal(payload.summaries.twse.close, 23100.25);
  assert.equal(payload.summaries.tpex, null);
  assert.equal(payload.turnover.twse[0].code, "2330");
  assert.equal(payload.news.length, 1);
  assert.equal(payload.errors[0].source, "tpex-summary");
});

test("stock search joins quote and eligibility data without guessing restrictions", async () => {
  const payload = await searchStocks("台積電", {
    fetchImpl: fixtureFetch(),
    now: new Date("2026-07-29T00:00:00.000Z"),
  });
  assert.equal(payload.partial, false);
  assert.equal(payload.matches.length, 1);
  assert.equal(payload.matches[0].code, "2330");
  assert.equal(payload.matches[0].dayTrade.status, "eligible");
  assert.equal(payload.matches[0].dayTrade.sellThenBuy, true);

  const limited = await searchStocks("6488", { fetchImpl: fixtureFetch() });
  assert.equal(limited.matches[0].dayTrade.buyThenSell, true);
  assert.equal(limited.matches[0].dayTrade.sellThenBuy, false);
  assert.match(dayTradeDescription(limited.matches[0].dayTrade), /先賣後買限制/);
});

test("eligibility becomes unknown when its official source fails", async () => {
  const payload = await searchStocks("2330", {
    fetchImpl: fixtureFetch({
      twseEligibility: { httpError: 503 },
    }),
  });
  assert.equal(payload.partial, true);
  assert.equal(payload.matches[0].dayTrade.status, "unknown");
  assert.equal(payload.matches[0].dayTrade.buyThenSell, null);
});

test("schema drift cannot become a false not-listed eligibility result", async () => {
  const payload = await searchStocks("2330", {
    fetchImpl: fixtureFetch({
      twseEligibility: [{}],
    }),
  });
  assert.equal(payload.partial, true);
  assert.equal(payload.availability.eligibility.TWSE, false);
  assert.equal(payload.matches[0].dayTrade.status, "unknown");
});

test("a missing market source keeps no-match results unconfirmed and uncached", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fixtureFetch({
    twseQuotes: new Error("TWSE unavailable"),
  });
  try {
    const response = await getStock({
      request: new Request("https://example.test/api/stock?query=2330"),
    });
    const payload = await response.json();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(payload.partial, true);
    assert.equal(payload.matches.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("successful function responses cache, validation errors do not", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fixtureFetch();
  try {
    const marketResponse = await getMarket();
    assert.equal(marketResponse.status, 200);
    assert.match(marketResponse.headers.get("cache-control"), /max-age=300/);

    const invalidResponse = await getStock({
      request: new Request("https://example.test/api/stock?query="),
    });
    assert.equal(invalidResponse.status, 400);
    assert.equal(invalidResponse.headers.get("cache-control"), "no-store");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("partial function responses remain usable but are never publicly cached", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fixtureFetch({
    tpexSummary: new Error("TPEx summary unavailable"),
    twseEligibility: new Error("TWSE eligibility unavailable"),
  });
  try {
    const marketResponse = await getMarket();
    assert.equal(marketResponse.status, 200);
    assert.equal(marketResponse.headers.get("cache-control"), "no-store");

    const stockResponse = await getStock({
      request: new Request("https://example.test/api/stock?query=2330"),
    });
    const stockPayload = await stockResponse.json();
    assert.equal(stockResponse.status, 200);
    assert.equal(stockResponse.headers.get("cache-control"), "no-store");
    assert.equal(stockPayload.matches[0].dayTrade.status, "unknown");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("client helper fills an existing calculator input and dispatches input", () => {
  const events = [];
  const input = {
    value: "",
    dispatchEvent(event) {
      events.push(event);
    },
  };
  class TestEvent {
    constructor(type, options) {
      this.type = type;
      this.bubbles = options.bubbles;
    }
  }
  const documentRef = {
    defaultView: { Event: TestEvent },
    getElementById(id) {
      return id === "buy-price" ? input : null;
    },
  };

  assert.equal(applyPriceToCalculator("buy", 1015, documentRef), true);
  assert.equal(input.value, "1015.00");
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "input");
  assert.equal(events[0].bubbles, true);
  assert.equal(formatDate("2026-07-28"), "2026/07/28");
});
