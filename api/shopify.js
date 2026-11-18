module.exports = async function handler(incoming, outgoing) {
  outgoing.setHeader("Cache-Control", "private, no-store");
  const url = new URL(incoming.url, "https://" + incoming.headers.host);
  const pathname = url.searchParams.get("shopifyPath");
  if (!pathname || !(pathname.startsWith("/__shopify/") || /^\/api\/2026-10\/graphql\.json$/.test(pathname))) {
    outgoing.writeHead(404).end();
    return;
  }
  if (!["GET", "HEAD", "POST", "OPTIONS"].includes(incoming.method)) {
    outgoing.writeHead(405).end();
    return;
  }
  if (incoming.headers.origin && incoming.headers.origin !== url.origin) {
    outgoing.writeHead(403).end();
    return;
  }
  try {
    const { createShopifyRequestContext, defineShopifyI18n, createStorefrontClient, handleShopifyRoutes } = await import("@shopify/hydrogen");
    url.pathname = pathname;
    url.searchParams.delete("shopifyPath");
    const headers = new Headers();
    for (const [key, value] of Object.entries(incoming.headers)) {
      if (typeof value === "string" && key !== "content-length") headers.set(key, value);
    }
    headers.set("X-Shopify-Storefront-Access-Token", process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN);
    let body;
    if (!["GET", "HEAD"].includes(incoming.method)) {
      if (incoming.body !== undefined) body = typeof incoming.body === "string" ? incoming.body : JSON.stringify(incoming.body);
      else {
        const chunks = [];
        let size = 0;
        for await (const chunk of incoming) {
          size += chunk.length;
          if (size > 1000000) { outgoing.writeHead(413).end(); return; }
          chunks.push(Buffer.from(chunk));
        }
        body = Buffer.concat(chunks);
      }
    }
    const request = new Request(url, { method: incoming.method, headers, body });
    const requestContext = createShopifyRequestContext({
      request,
      i18n: defineShopifyI18n({ defaultLocale: { language: "EN", country: "US" } }),
      buyerIp: incoming.headers["x-vercel-forwarded-for"]?.split(",")[0].trim() || "127.0.0.1",
    });
    const storefrontClient = createStorefrontClient({
      type: "public", requestContext,
      config: { storeDomain: "mnhkb0-af.myshopify.com", apiVersion: "2026-10", publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN },
    });
    const result = await handleShopifyRoutes({ request, requestContext, storefrontClient });
    if (!result) { outgoing.writeHead(404).end(); return; }
    for (const [name, value] of result.headers) {
      if (!["set-cookie", "content-length", "content-encoding", "transfer-encoding"].includes(name)) outgoing.setHeader(name, value);
    }
    const cookies = result.headers.getSetCookie();
    if (cookies.length) outgoing.setHeader("Set-Cookie", cookies);
    outgoing.statusCode = result.status;
    outgoing.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    console.error("Shopify session proxy failed", error.message);
    outgoing.writeHead(502).end();
  }
};
