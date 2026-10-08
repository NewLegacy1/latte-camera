import { NextResponse } from "next/server";
import { shopDomain } from "@/lib/ownlane";

/**
 * Shopify's cookie handshake for headless stores. Only this one query is forwarded, with the private
 * Storefront token, so Shopify sets its _shopify_y / _shopify_s visit cookies on dearlatte.shop.
 */
const COOKIE_QUERY = "query ensureCookies { consentManagement { cookies(visitorConsent:{}) { cookieDomain } } }";

function cookieRootDomain(host: string | null) {
  const name = (host ?? "").split(":")[0];
  return name === "dearlatte.shop" || name.endsWith(".dearlatte.shop") ? ".dearlatte.shop" : "";
}

function rewriteCookie(cookie: string, domain: string) {
  let next = cookie.replace(/;\s*Domain=[^;]*/gi, "").replace(/;\s*SameSite=[^;]*/gi, "");
  next += "; Path=/; SameSite=Lax";
  if (domain) next += `; Domain=${domain}`;
  return next;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  if (String(body?.query ?? "").replace(/\s+/g, " ").trim() !== COOKIE_QUERY) {
    return NextResponse.json({ ok: false, message: "Unsupported query." }, { status: 400 });
  }
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Shopify is not configured." }, { status: 409 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Shopify-Storefront-Private-Token": token,
  };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  if (ip) headers["Shopify-Storefront-Buyer-IP"] = ip;
  const visitToken = request.headers.get("x-shopify-visittoken");
  const uniqueToken = request.headers.get("x-shopify-uniquetoken");
  if (visitToken) headers["X-Shopify-VisitToken"] = visitToken;
  if (uniqueToken) headers["X-Shopify-UniqueToken"] = uniqueToken;

  try {
    const response = await fetch(`https://${shopDomain()}/api/unstable/graphql.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: COOKIE_QUERY }),
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as { data?: unknown; errors?: unknown };
    const result = !response.ok || payload.errors
      ? NextResponse.json({ ok: false, message: "Shopify tracking request failed." }, { status: 502 })
      : NextResponse.json({ ok: true, data: payload.data ?? {} });
    // The browser reads the visit tokens from Server-Timing (src/lib/shopify-analytics.ts).
    const serverTiming = response.headers.get("server-timing");
    if (serverTiming) result.headers.set("Server-Timing", serverTiming);
    const domain = cookieRootDomain(request.headers.get("host"));
    for (const cookie of response.headers.getSetCookie()) {
      result.headers.append("Set-Cookie", rewriteCookie(cookie, domain));
    }
    return result;
  } catch {
    return NextResponse.json({ ok: false, message: "Shopify tracking request failed." }, { status: 502 });
  }
}
