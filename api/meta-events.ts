const eventNames = new Set(["PageView", "ViewContent", "AddToCart", "InitiateCheckout"]);
const productionOrigin = "https://dearlatte.shop";

export async function POST(request: Request) {
  const token = process.env.DEARLATTE_META_CAPI_ACCESS_TOKEN;
  const version = process.env.DEARLATTE_META_GRAPH_API_VERSION;
  const pixel = process.env.NEXT_PUBLIC_DEARLATTE_META_PIXEL_ID;
  if (!token || !version || !/^v\d+\.0$/.test(version) || !pixel || !/^\d+$/.test(pixel)) {
    return new Response(null, { status: 503 });
  }
  if (request.headers.get("origin") !== productionOrigin || request.headers.get("sec-fetch-site") !== "same-origin") {
    return new Response(null, { status: 403 });
  }
  if (Number(request.headers.get("content-length")) > 4096) return new Response(null, { status: 413 });
  const raw = await request.text();
  if (raw.length > 4096) return new Response(null, { status: 413 });
  let input;
  try { input = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
  if (!input || !eventNames.has(input.name) || typeof input.id !== "string" || !/^[a-f\d-]{36}$/i.test(input.id)) {
    return new Response(null, { status: 400 });
  }
  const data = input.data ?? {};
  const customData: Record<string, unknown> = {};
  if (Array.isArray(data.content_ids)) {
    customData.content_ids = data.content_ids.filter((id: unknown) => typeof id === "string" && /^\d{1,25}$/.test(id)).slice(0, 100);
    customData.content_type = "product";
  }
  if (Number.isFinite(data.value) && data.value >= 0 && /^[A-Z]{3}$/.test(data.currency)) {
    customData.value = data.value;
    customData.currency = data.currency;
  }
  if (Number.isSafeInteger(data.num_items) && data.num_items > 0) customData.num_items = data.num_items;
  const userAgent = request.headers.get("user-agent");
  if (!userAgent) return new Response(null, { status: 400 });
  const cookies = request.headers.get("cookie") ?? "";
  const userData: Record<string, string> = { client_user_agent: userAgent };
  for (const key of ["fbp", "fbc"]) {
    const value = cookies.match(new RegExp("(?:^|; *)_" + key + "=([a-zA-Z0-9_.-]{1,350})(?:;|$)"))?.[1];
    if (value) userData[key] = value;
  }
  const path = typeof input.path === "string" && /^\/[a-zA-Z0-9/_-]{0,250}$/.test(input.path) ? input.path : "/";
  try {
    const result = await fetch(`https://graph.facebook.com/${version}/${pixel}/events`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{
        event_name: input.name, event_id: input.id, event_time: Math.floor(Date.now() / 1000),
        action_source: "website", event_source_url: productionOrigin + path, user_data: userData,
        custom_data: customData,
      }], test_event_code: process.env.DEARLATTE_META_TEST_EVENT_CODE }),
      signal: AbortSignal.timeout(4500),
    });
    return new Response(null, { status: result.ok ? 204 : 502 });
  } catch {
    return new Response(null, { status: 502 });
  }
}
