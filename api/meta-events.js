const { isIP } = require("node:net");

const eventNames = new Set(["PageView", "ViewContent", "AddToCart", "InitiateCheckout"]);
const productionOrigin = "https://dearlatte.shop";

async function forwardEvent(request) {
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
  const customData = {};
  if (Array.isArray(data.content_ids)) {
    customData.content_ids = data.content_ids.filter((id) => typeof id === "string" && /^\d{1,25}$/.test(id)).slice(0, 100);
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
  const userData = { client_user_agent: userAgent };
  const clientIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim();
  if (clientIp && isIP(clientIp)) userData.client_ip_address = clientIp;
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
    if (!result.ok) {
      const error = (await result.json().catch(() => null))?.error;
      console.warn("Meta rejected event", { status: result.status, code: error?.code, subcode: error?.error_subcode });
      return new Response(null, { status: 502 });
    }
    return new Response(null, { status: 204 });
  } catch {
    console.warn("Meta event request failed");
    return new Response(null, { status: 502 });
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.writeHead(405).end();
    return;
  }
  if (Number(request.headers["content-length"]) > 4096) {
    response.writeHead(413).end();
    return;
  }
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (typeof value === "string") headers.set(name, value);
    }
    const suppliedBody = request.body;
    let body = typeof suppliedBody === "string" ? suppliedBody : JSON.stringify(suppliedBody);
    if (body === undefined) {
      let size = 0;
      const chunks = [];
      for await (const chunk of request) {
        const bytes = Buffer.from(chunk);
        size += bytes.length;
        if (size > 4096) {
          response.writeHead(413).end();
          return;
        }
        chunks.push(bytes);
      }
      body = Buffer.concat(chunks).toString("utf8");
    }
    const result = await forwardEvent(new Request(productionOrigin + "/api/meta-events/", { method: "POST", headers, body }));
    response.writeHead(result.status).end();
  } catch {
    response.writeHead(400).end();
  }
};
