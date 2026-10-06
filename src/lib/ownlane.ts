import "server-only";

import { dollars, isColor, isTier, payableCents, type AddonId, type PressColor, type Tier } from "@/lib/offer";

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
  colors: { Black: "67926128984287", White: "67925834301663", Green: "67926129017055" },
  refillKitGift: "67926129213663",
  frotherGift: "67926754033887",
  frother: "67926129443039",
};

const DISCOUNT_CODES: Record<Tier, string | null> = { 1: null, 2: "BUNDLE2", 3: "BUNDLE3" };

function numericId(value: string | undefined, fallback: string) {
  return value?.match(/(\d+)\s*$/)?.[1] ?? fallback;
}

function variantIds() {
  const env = process.env;
  return {
    colors: {
      Black: numericId(env.SHOPIFY_BLACK_VARIANT_ID, DEFAULTS.colors.Black),
      White: numericId(env.SHOPIFY_WHITE_VARIANT_ID, DEFAULTS.colors.White),
      Green: numericId(env.SHOPIFY_GREEN_VARIANT_ID, DEFAULTS.colors.Green),
    } satisfies Record<PressColor, string>,
    refillKitGift: numericId(env.SHOPIFY_REFILL_KIT_VARIANT_ID, DEFAULTS.refillKitGift),
    frotherGift: numericId(env.SHOPIFY_FREE_FROTHER_VARIANT_ID, DEFAULTS.frotherGift),
    frother: numericId(env.SHOPIFY_FROTHER_VARIANT_ID, DEFAULTS.frother),
    card: process.env.SHOPIFY_CUSTOM_CARD_VARIANT_ID ? numericId(process.env.SHOPIFY_CUSTOM_CARD_VARIANT_ID, "") : "",
  };
}

export type CheckoutRequest = {
  tier: Tier;
  color: PressColor;
  addons: AddonId[];
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
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
  const attributes = Array.isArray(record.attributes) ? record.attributes : [];
  const attribute = (key: string, max: number) => {
    const entry = attributes.find(
      (item): item is { key: string; value: string } =>
        !!item && typeof item === "object" && (item as { key?: unknown }).key === key,
    );
    return text(entry?.value, max);
  };
  return {
    tier: record.tier,
    color: record.color,
    addons,
    fbclid: attribute("fbclid", 500),
    fbp: attribute("_fbp", 200),
    fbc: attribute("_fbc", 600),
  };
}

function cookie(header: string, name: string) {
  return header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
}

export async function createCheckout(request: CheckoutRequest, headers: Headers) {
  const ids = variantIds();
  const lines: { variantId: string; quantity: number }[] = [
    { variantId: ids.colors[request.color], quantity: request.tier },
  ];
  if (request.tier === 2 || request.tier === 3) {
    lines.push({ variantId: ids.refillKitGift, quantity: 1 });
  }
  const wantsPaidFrother = request.addons.includes("milk-frother-wand") && request.tier !== 3;
  if (request.tier === 3) {
    lines.push({ variantId: ids.frotherGift, quantity: 1 });
  } else if (wantsPaidFrother) {
    lines.push({ variantId: ids.frother, quantity: 1 });
  }
  const wantsCard = request.addons.includes("custom-message-card");
  if (wantsCard) {
    if (!ids.card) {
      throw new CheckoutError("The custom message card isn't available yet. Remove it and try again.", 409);
    }
    lines.push({ variantId: ids.card, quantity: 1 });
  }

  const cookies = headers.get("cookie") ?? "";
  const attribution = {
    fbp: request.fbp ?? text(cookie(cookies, "_fbp"), 200),
    fbc: request.fbc ?? text(cookie(cookies, "_fbc"), 600),
    fbclid: request.fbclid,
    clientIp: text(headers.get("x-forwarded-for")?.split(",")[0], 200),
    userAgent: text(headers.get("user-agent"), 1000),
    sourceUrl: text(headers.get("referer"), 2000),
  };

  const shop = (process.env.SHOPIFY_STORE_DOMAIN || DEFAULTS.shop).replace(/^https?:\/\//, "").replace(/\/$/, "");
  const host = (process.env.OWNLANE_CHECKOUT_HOST || DEFAULTS.checkoutHost).replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${host}/api/checkout/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, lines, discountCode: DISCOUNT_CODES[request.tier], visitorId: null, attribution }),
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
    variantId: ids.colors[request.color],
    value: dollars(payableCents(request.tier, { frother: wantsPaidFrother, messageCard: wantsCard })),
  };
}
