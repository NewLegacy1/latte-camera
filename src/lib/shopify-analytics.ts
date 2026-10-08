"use client";

/**
 * Shopify Analytics for this headless store, ported from Aerase (dist/shopify-analytics.js).
 * Gets Shopify's visit cookies through /api/shopify-storefront, then sends page views, adds to cart
 * and checkout starts to Shopify, so Dear Latte has sessions and a conversion funnel in Shopify
 * (and in EcomOps). Ownlane sends the matching checkout events using the tokens from tokens().
 * Stays silent until SHOPIFY_STOREFRONT_TOKEN is set, and whenever the shopper declines analytics.
 */

const MONORAIL = "https://monorail-edge.shopifysvc.com/unstable/produce_batch";
const COOKIE_QUERY = "query ensureCookies { consentManagement { cookies(visitorConsent:{}) { cookieDomain } } }";
const TREKKIE_SCHEMA = "trekkie_storefront_page_view/1.4";
const CUSTOMER_SCHEMA = "custom_storefront_customer_tracking/1.2";
const HEADLESS_APP_ID = "12875497473";
const ASSET_VERSION = "headless-custom-1";

export type ShopifyProduct = {
  productGid: string;
  variantGid: string;
  name: string;
  variantName: string;
  price: string;
  quantity: number;
};

type ShopConfig = {
  shopId: string;
  shopDomain: string;
  currency: string;
  acceptedLanguage: string;
  storefrontId: string;
  storefrontRootDomain: string;
  checkoutRootDomain: string;
  publicStorefrontToken: string;
};

type Privacy = {
  analyticsProcessingAllowed: () => boolean;
  marketingAllowed: () => boolean;
  saleOfDataAllowed: () => boolean;
  shouldShowBanner?: () => boolean;
  setTrackingConsent?: (options: Record<string, unknown>, callback: () => void) => void;
};

type Tokens = { uniqueToken: string; visitToken: string; consent: string };

const cached: Tokens = { uniqueToken: "", visitToken: "", consent: "" };
const recentEvents = new Map<string, number>();
let shopConfig: ShopConfig | null = null;
let ready: Promise<void> | null = null;

const numericGid = (gid: string) => gid.match(/gid:\/\/shopify\/[^/]+\/([^/?#]+)/)?.[1] ?? "";

function uuid() {
  const time = Math.abs((Date.now() >>> 0) + (performance.now() >>> 0)).toString(16).padStart(8, "0");
  const random = crypto.getRandomValues(new Uint16Array(31));
  let i = 0;
  return `${time}-${"xxxx-4xxx-xxxx-xxxxxxxxxxxx".replace(/x/g, () => (random[i++] % 16).toString(16).toUpperCase())}`;
}

function cookieValue(name: string) {
  for (const part of document.cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

/** Shopify returns the visit tokens in Server-Timing on the cookie handshake; fall back to its cookies. */
function trackingValues(): Tokens {
  try {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const entry = entries[i];
      if (entry.initiatorType !== "fetch" || new URL(entry.name).host !== location.host) continue;
      const found: Tokens = { uniqueToken: "", visitToken: "", consent: "" };
      for (const item of entry.serverTiming ?? []) {
        if (item.name === "_y") found.uniqueToken = item.description;
        if (item.name === "_s") found.visitToken = item.description;
        if (item.name === "_cmp") found.consent = item.description;
      }
      if (found.uniqueToken && found.visitToken && found.consent) {
        Object.assign(cached, found);
        return found;
      }
    }
  } catch {}
  if (cached.uniqueToken && cached.visitToken) return cached;
  return { uniqueToken: cookieValue("_shopify_y"), visitToken: cookieValue("_shopify_s"), consent: cookieValue("_tracking_consent") };
}

function privacyApi() {
  return (window.Shopify?.customerPrivacy as Privacy | undefined) ?? null;
}

function privacyState() {
  const api = privacyApi();
  if (!api) return null;
  try {
    const bannerRequired = typeof api.shouldShowBanner === "function" ? Boolean(api.shouldShowBanner()) : true;
    return {
      analyticsAllowed: Boolean(api.analyticsProcessingAllowed()) || !bannerRequired,
      marketingAllowed: Boolean(api.marketingAllowed()),
      saleOfDataAllowed: Boolean(api.saleOfDataAllowed()),
    };
  } catch {
    return null;
  }
}

function pageType() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  return path === "/" || path === "/lp/gift" ? "product" : "page";
}

function navigation() {
  const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return entry?.type ? [String(entry.type), "PerformanceNavigationTiming"] : ["unknown", "unknown"];
}

function formatProducts(products: ShopifyProduct[]) {
  return products.map((product) =>
    JSON.stringify({
      product_gid: product.productGid,
      name: product.name,
      variant: product.variantName,
      brand: "Dear Latte",
      price: parseFloat(product.price) || 0,
      quantity: product.quantity,
      variant_gid: product.variantGid,
      product_id: parseInt(numericGid(product.productGid) || "0", 10) || undefined,
      variant_id: parseInt(numericGid(product.variantGid) || "0", 10) || undefined,
    }),
  );
}

const schemaEvent = (schemaId: string, payload: Record<string, unknown>) => ({
  schema_id: schemaId,
  payload,
  metadata: { event_created_at_ms: Date.now() },
});

type Payload = NonNullable<ReturnType<typeof eventPayload>>;

function eventPayload(products: ShopifyProduct[], cartToken = "") {
  const privacy = privacyState();
  if (!privacy?.analyticsAllowed || !shopConfig) return null;
  const tokens = trackingValues();
  if (!tokens.uniqueToken || !tokens.visitToken || tokens.uniqueToken.startsWith("00000000-")) return null;
  const [navigationType, navigationApi] = navigation();
  return {
    ...privacy,
    ...tokens,
    shopId: parseInt(numericGid(shopConfig.shopId) || "0", 10),
    currency: shopConfig.currency || "USD",
    acceptedLanguage: shopConfig.acceptedLanguage || "EN",
    storefrontId: shopConfig.storefrontId || "0",
    url: location.href,
    canonicalUrl: location.origin + location.pathname,
    path: location.pathname,
    search: location.search,
    referrer: document.referrer,
    title: document.title,
    userAgent: navigator.userAgent,
    navigationType,
    navigationApi,
    pageType: pageType(),
    products,
    totalValue: products.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * p.quantity, 0),
    cartToken,
  };
}

function customerPayload(p: Payload) {
  const gdpr = !(p.marketingAllowed && p.analyticsAllowed);
  return {
    source: "headless",
    asset_version_id: ASSET_VERSION,
    hydrogenSubchannelId: p.storefrontId,
    is_persistent_cookie: true,
    deprecated_visit_token: p.visitToken,
    unique_token: p.uniqueToken,
    event_time: Date.now(),
    event_id: uuid(),
    event_source_url: p.url,
    referrer: p.referrer,
    user_agent: p.userAgent,
    navigation_type: p.navigationType,
    navigation_api: p.navigationApi,
    shop_id: p.shopId,
    currency: p.currency,
    ccpa_enforced: !p.saleOfDataAllowed,
    gdpr_enforced: gdpr,
    gdpr_enforced_as_string: gdpr ? "true" : "false",
    analytics_allowed: p.analyticsAllowed,
    marketing_allowed: p.marketingAllowed,
    sale_of_data_allowed: p.saleOfDataAllowed,
    canonical_url: p.canonicalUrl,
  };
}

function send(events: ReturnType<typeof schemaEvent>[]) {
  if (!events.length || /Chrome-Lighthouse/.test(navigator.userAgent)) return Promise.resolve();
  return fetch(MONORAIL, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: JSON.stringify({ events, metadata: { event_sent_at_ms: Date.now() } }),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);
}

function cartTokenOf(cartId: string) {
  const gid = cartId.match(/gid:\/\/shopify\/Cart\/([^/?#]+)/);
  if (gid) return gid[1];
  const plain = cartId.split("?")[0];
  return /^[A-Za-z0-9_-]{6,80}$/.test(plain) ? plain : "";
}

function loadPrivacy(config: ShopConfig) {
  return new Promise<void>((resolve) => {
    window.Shopify = window.Shopify || {};
    window.Shopify.shop = config.shopDomain;
    const start = () => {
      if (privacyApi()) return resolve();
      if (typeof window.Shopify?.loadFeatures === "function") {
        window.Shopify.loadFeatures([{ name: "consent-tracking-api", version: "0.1" }], () => resolve());
        return;
      }
      resolve();
    };
    if (privacyApi() || typeof window.Shopify.loadFeatures === "function") return start();
    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js";
    script.async = true;
    script.onload = start;
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

function registerHeadlessConsent(config: ShopConfig) {
  const api = privacyApi();
  if (!api?.setTrackingConsent || !config.publicStorefrontToken) return Promise.resolve();
  return new Promise<void>((resolve) => {
    try {
      api.setTrackingConsent!(
        {
          headlessStorefront: true,
          checkoutRootDomain: config.checkoutRootDomain,
          storefrontRootDomain: config.storefrontRootDomain,
          storefrontAccessToken: config.publicStorefrontToken,
        },
        () => resolve(),
      );
    } catch {
      resolve();
    }
  });
}

async function fetchTrackingCookies() {
  const tokens = trackingValues();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (tokens.visitToken) headers["X-Shopify-VisitToken"] = tokens.visitToken;
  if (tokens.uniqueToken) headers["X-Shopify-UniqueToken"] = tokens.uniqueToken;
  const res = await fetch("/api/shopify-storefront", { method: "POST", headers, body: JSON.stringify({ query: COOKIE_QUERY }) });
  await res.json().catch(() => ({}));
  trackingValues();
}

/** Boots once per page load and sends the page view. Safe to call repeatedly. */
export function startShopifyAnalytics(pageProducts: ShopifyProduct[]) {
  if (ready) return ready;
  ready = (async () => {
    try {
      const res = await fetch("/api/shopify-analytics");
      const data = (await res.json()) as ShopConfig & { ok?: boolean };
      if (!data?.ok) return;
      shopConfig = data;
      await loadPrivacy(data);
      await registerHeadlessConsent(data);
      await fetchTrackingCookies();
      const products = pageType() === "product" ? pageProducts : [];
      const payload = eventPayload(products);
      if (!payload) return;
      const events = [
        schemaEvent(TREKKIE_SCHEMA, {
          appClientId: HEADLESS_APP_ID,
          isMerchantRequest: false,
          hydrogenSubchannelId: payload.storefrontId,
          isPersistentCookie: true,
          uniqToken: payload.uniqueToken,
          visitToken: payload.visitToken,
          microSessionId: uuid(),
          microSessionCount: 1,
          url: payload.url,
          path: payload.path,
          search: payload.search,
          referrer: payload.referrer,
          title: payload.title,
          shopId: payload.shopId,
          currency: payload.currency,
          contentLanguage: payload.acceptedLanguage,
          pageType: payload.pageType,
        }),
        schemaEvent(CUSTOMER_SCHEMA, { ...customerPayload(payload), event_name: "page_rendered" }),
      ];
      if (products.length) {
        events.push(
          schemaEvent(CUSTOMER_SCHEMA, {
            ...customerPayload(payload),
            event_name: "product_page_rendered",
            products: formatProducts(products),
            total_value: payload.totalValue,
          }),
        );
      }
      await send(events);
    } catch {}
  })();
  return ready;
}

function sendCommerce(eventName: string, products: ShopifyProduct[], cartId: string) {
  const token = cartTokenOf(cartId);
  const key = `${eventName}:${products.map((p) => `${p.variantGid}x${p.quantity}`).join(",")}:${token}`;
  const now = Date.now();
  if (now - (recentEvents.get(key) ?? 0) < 2000) return Promise.resolve();
  recentEvents.set(key, now);
  const payload = eventPayload(products, token);
  if (!payload) return Promise.resolve();
  return send([
    schemaEvent(CUSTOMER_SCHEMA, {
      ...customerPayload(payload),
      event_name: eventName,
      products: formatProducts(products),
      total_value: payload.totalValue,
      ...(token ? { cart_token: token } : {}),
    }),
  ]);
}

/** Add to cart + checkout started, right before the hop to Ownlane. Never throws. */
export async function trackShopifyCheckout(products: ShopifyProduct[], cartId: string) {
  try {
    await ready;
    await Promise.all([
      sendCommerce("product_added_to_cart", products, cartId),
      sendCommerce("checkout_started", products, cartId),
    ]);
  } catch {}
}

/** The Shopify visit for Ownlane, so its checkout and purchase events land in the same Shopify session. */
export async function shopifyTokens() {
  try {
    await ready;
  } catch {}
  const privacy = privacyState();
  const tokens = trackingValues();
  if ((privacy && !privacy.analyticsAllowed) || !tokens.uniqueToken || !tokens.visitToken || tokens.uniqueToken.startsWith("00000000-")) {
    return { uniqueToken: "", visitToken: "", shopId: "", storefrontId: "" };
  }
  return {
    uniqueToken: tokens.uniqueToken,
    visitToken: tokens.visitToken,
    shopId: shopConfig ? numericGid(shopConfig.shopId) : "",
    storefrontId: shopConfig?.storefrontId ?? "",
  };
}
