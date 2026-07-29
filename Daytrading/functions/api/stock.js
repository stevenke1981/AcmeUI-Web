import { searchStocks } from "../_shared/market-data.mjs";

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

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  try {
    const payload = await searchStocks(url.searchParams.get("query"));
    if (payload.validationError) return jsonResponse(payload, 400);

    const quoteSourcesAvailable = payload.sources.some(
      (source) =>
        (source.id === "twse-quotes" || source.id === "tpex-quotes") &&
        source.available,
    );
    if (!quoteSourcesAvailable) return jsonResponse(payload, 503);
    if (payload.matches.length) {
      return jsonResponse(payload, 200, { cacheable: !payload.partial });
    }
    return jsonResponse(payload, payload.partial ? 503 : 404);
  } catch {
    return jsonResponse(
      {
        generatedAt: new Date().toISOString(),
        nonRealtime: true,
        partial: true,
        errors: [{ source: "stock-api", message: "股票查詢服務暫時無法處理請求" }],
        query: url.searchParams.get("query") ?? "",
        matches: [],
        sources: [],
        validationError: null,
      },
      503,
    );
  }
}
