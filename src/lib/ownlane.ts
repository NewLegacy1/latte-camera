import "server-only";

import { VARIANTS, dollars, isColor, isTier, packLines, payableCents, type AddonId, type PressColor, type Tier } from "@/lib/offer";

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Ownlane charges Shopify's prices from its synced catalog. The camera is one
 * product with a Color option at $60.00; Buy 2 / Buy 3 pricing comes from the
 * BUNDLE2 ($20 off 2+) and BUNDLE3 ($30 off 3+) Shopify discount codes, and the
 * gifts are dedicated $0.00 variants. Env vars override the IDs.
 */
const DEFAULTS = {
  shop: "edr0qi-9t.myshopify.com",
  checkoutHost: "https://checkout.dearlatte.shop",
};

const DISCOUNT_CODES: Record<Tier, string | null> = { 1: null, 2: "BUNDLE2", 3: "BUNDLE3" };

function numericId(value: string | undefined, fallback: string) {
  return value?.match(/(\d+)\s*$/)?.[1] ?? fallback;
}

function variantIds() {
  const env = process.env;
  return {
    colors: {
      Black: numericId(env.SHOPIFY_BLACK_VARIANT_ID, VARIANTS.colors.Black),
      White: numericId(env.SHOPIFY_WHITE_VARIANT_ID, VARIANTS.colors.White),
      Green: numericId(env.SHOPIFY_GREEN_VARIANT_ID, VARIANTS.colors.Green),
    } satisfies Record<PressColor, string>,
    refillKitGift: numericId(env.SHOPIFY_REFILL_KIT_VARIANT_ID, VARIANTS.refillKitGift),
    frotherGift: numericId(env.SHOPIFY_FREE_FROTHER_VARIANT_ID, VARIANTS.frotherGift),
    frother: numericId(env.SHOPIFY_FROTHER_VARIANT_ID, VARIANTS.frother),
    card: process.env.SHOPIFY_CUSTOM_CARD_VARIANT_ID ? numericId(process.env.SHOPIFY_CUSTOM_CARD_VARIANT_ID, "") : "",
  };
}

/** What the storefront knows about the shopper: Meta cookies, first landing page, and the Shopify visit. */
export type CheckoutAttribution = {
  fbp: string | null;
  fbc: string | null;
  fbclid: string | null;
  landingUrl: string | null;
  referrer: string | null;
  metaInitiateEventId: string | null;
  shopifyUniqueToken: string | null;
  shopifyVisitToken: string | null;
  shopifyShopId: string | null;
  shopifyStorefrontId: string | null;
};

export type CheckoutRequest = {
  tier: Tier;
  color: PressColor;
  addons: AddonId[];
  visitorId: string | null;
  attribution: CheckoutAttribution;
};

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export function parseCheckoutBody(body: unknown): CheckoutRequest {
  if (!body || typeof body !== "object") {
    throw new CheckoutError("Missing order details.");
  }
  const record = body as Record<string, unknown>;
  if (!isTier(record.tier) || !isColor(record.color)) {
    throw new CheckoutError("Choose a pack and a color.");
  }
  const addons = Array.isArray(record.addons)
    ? record.addons.filter((item): item is AddonId => item === "milk-frother-wand" || item === "custom-message-card")
    : [];
  const raw = (record.attribution && typeof record.attribution === "object" ? record.attribution : {}) as Record<string, unknown>;
  const visitorId = text(record.visitorId, 80);
  return {
    tier: record.tier,
    color: record.color,
    addons,
    visitorId: visitorId && /^[A-Za-z0-9_-]{8,80}$/.test(visitorId) ? visitorId : null,
    attribution: {
      fbp: text(raw.fbp, 200),
      fbc: text(raw.fbc, 600),
      fbclid: text(raw.fbclid, 500),
      landingUrl: text(raw.landingUrl, 2000),
      referrer: text(raw.referrer, 2000),
      metaInitiateEventId: text(raw.metaInitiateEventId, 120),
      shopifyUniqueToken: text(raw.shopifyUniqueToken, 80),
      shopifyVisitToken: text(raw.shopifyVisitToken, 80),
      shopifyShopId: text(raw.shopifyShopId, 80),
      shopifyStorefrontId: text(raw.shopifyStorefrontId, 40),
    },
  };
}

function cookie(header: string, name: string) {
  return header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
}

export function shopDomain() {
  return (process.env.SHOPIFY_STORE_DOMAIN || DEFAULTS.shop).replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T) {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

/**
 * A real Storefront cart is what Shopify Analytics counts as an add to cart, tied to the shopper's
 * Shopify visit. Needs SHOPIFY_STOREFRONT_TOKEN; without it, or on any failure, checkout carries on.
 */
async function createShopifyCart(
  lines: { variantId: string; quantity: number }[],
  tokens: { visitToken: string | null; uniqueToken: string | null; buyerIp: string | null },
) {
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  if (!token) return "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Shopify-Storefront-Private-Token": token,
  };
  if (tokens.buyerIp) headers["Shopify-Storefront-Buyer-IP"] = tokens.buyerIp;
  if (tokens.visitToken) {
    headers["Shopify-Storefront-S"] = tokens.visitToken;
    headers["X-Shopify-VisitToken"] = tokens.visitToken;
  }
  if (tokens.uniqueToken) {
    headers["Shopify-Storefront-Y"] = tokens.uniqueToken;
    headers["X-Shopify-UniqueToken"] = tokens.uniqueToken;
  }
  const response = await fetch(`https://${shopDomain()}/api/2026-07/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: "mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id } userErrors { message } } }",
      variables: {
        input: {
          lines: lines.map((line) => ({ merchandiseId: `gid://shopify/ProductVariant/${line.variantId}`, quantity: line.quantity })),
          buyerIdentity: { countryCode: "US" },
        },
      },
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as { data?: { cartCreate?: { cart?: { id?: unknown } } } };
  const id = payload.data?.cartCreate?.cart?.id;
  return typeof id === "string" ? id : "";
}

export async function createCheckout(request: CheckoutRequest, headers: Headers) {
  const ids = variantIds();
  const wantsPaidFrother = request.addons.includes("milk-frother-wand") && request.tier !== 3;
  const lines = packLines(request.tier, request.color, wantsPaidFrother, ids);
  const wantsCard = request.addons.includes("custom-message-card");
  if (wantsCard) {
    if (!ids.card) {
      throw new CheckoutError("The custom message card isn't available yet. Remove it and try again.", 409);
    }
    lines.push({ variantId: ids.card, quantity: 1 });
  }

  const cookies = headers.get("cookie") ?? "";
  const clientIp = text(headers.get("x-forwarded-for")?.split(",")[0], 200);
  const shopifyCartId = await withTimeout(
    createShopifyCart(lines, {
      visitToken: request.attribution.shopifyVisitToken,
      uniqueToken: request.attribution.shopifyUniqueToken,
      buyerIp: clientIp,
    }).catch(() => ""),
    2500,
    "",
  );
  const attribution = {
    ...request.attribution,
    fbp: request.attribution.fbp ?? text(cookie(cookies, "_fbp"), 200),
    fbc: request.attribution.fbc ?? text(cookie(cookies, "_fbc"), 600),
    clientIp,
    userAgent: text(headers.get("user-agent"), 1000),
    sourceUrl: text(headers.get("referer"), 2000),
    shopifyCartId: shopifyCartId || null,
  };

  const host = (process.env.OWNLANE_CHECKOUT_HOST || DEFAULTS.checkoutHost).replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${host}/api/checkout/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop: shopDomain(),
        lines,
        discountCode: DISCOUNT_CODES[request.tier],
        visitorId: request.visitorId,
        attribution,
      }),
      cache: "no-store",
    });
  } catch {
    throw new CheckoutError("Checkout didn't answer. Try the button again in a moment.", 502);
  }
  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !payload.url?.startsWith("https://")) {
    throw new CheckoutError(payload.error || "Checkout isn't ready yet. Try the button again in a moment.", 502);
  }

  return {
    checkoutUrl: payload.url,
    cartId: shopifyCartId || null,
    variantId: ids.colors[request.color],
    value: dollars(payableCents(request.tier, { frother: wantsPaidFrother, messageCard: wantsCard })),
  };
}
