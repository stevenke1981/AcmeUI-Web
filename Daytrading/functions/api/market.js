import { buildMarketOverview } from "../_shared/market-data.mjs";

const CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=900";

function jsonResponse(payload, status = 200, { cacheable = status === 200 } = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheable ? CACHE_CONTROL : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function onRequestGet() {
  try {
    const payload = await buildMarketOverview();
    const hasAnyData =
      payload.summaries.twse ||
      payload.summaries.tpex ||
      payload.turnover.twse.length ||
      payload.turnover.tpex.length ||
      payload.news.length;
    if (!hasAnyData) return jsonResponse(payload, 503);
    return jsonResponse(payload, 200, { cacheable: !payload.partial });
  } catch {
    return jsonResponse(
      {
        generatedAt: new Date().toISOString(),
        nonRealtime: true,
        partial: true,
        errors: [{ source: "market-api", message: "市場資訊服務暫時無法處理請求" }],
        summaries: { twse: null, tpex: null },
        turnover: { twse: [], tpex: [] },
        news: [],
        sources: [],
      },
      503,
    );
  }
}
