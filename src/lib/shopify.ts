import "server-only";

import {
  HANDLES,
  PRICE,
  dollars,
  isColor,
  isTier,
  matchesPack,
  payableCents,
  type AddonId,
  type PressColor,
  type Tier,
} from "@/lib/offer";

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type VariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  selectedOptions: { name: string; value: string }[];
};

type ProductNode = {
  handle: string;
  variants: { nodes: VariantNode[] };
} | null;

type Catalog = {
  press: ProductNode;
  refill: ProductNode;
  frother: ProductNode;
  card: ProductNode;
};

const PRODUCT_FIELDS = `
  handle
  variants(first: 30) {
    nodes {
      id
      title
      availableForSale
      price { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

const CATALOG_QUERY = `
  query Catalog {
    press: product(handle: "${HANDLES.press}") { ${PRODUCT_FIELDS} }
    refill: product(handle: "${HANDLES.refill}") { ${PRODUCT_FIELDS} }
    frother: product(handle: "${HANDLES.frother}") { ${PRODUCT_FIELDS} }
    card: product(handle: "${HANDLES.messageCard}") { ${PRODUCT_FIELDS} }
  }
`;

const CART_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

function shopifyEnv() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2025-01";
  if (!domain || !token) {
    throw new CheckoutError(
      "Checkout isn't connected yet. Add the Shopify store domain and Storefront API token on the server.",
      503,
    );
  }
  return { domain, token, version };
}

async function storefront<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const { domain, token, version } = shopifyEnv();
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new CheckoutError("Shopify didn't answer. Try the button again in a moment.", 502);
  }
  const json = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new CheckoutError(json.errors.map((error) => error.message).join(" "), 502);
  }
  if (!json.data) {
    throw new CheckoutError("Shopify sent an empty catalog response.", 502);
  }
  return json.data;
}

function cents(amount: string) {
  return Math.round(Number(amount) * 100);
}

function assertPrice(variant: VariantNode, expected: number, label: string) {
  if (variant.price.currencyCode !== "USD") {
    throw new CheckoutError(`${label} must be priced in USD in Shopify.`, 409);
  }
  if (cents(variant.price.amount) !== expected) {
    throw new CheckoutError(
      `${label} is ${variant.price.amount} in Shopify. This offer is locked at ${dollars(expected)}. Update the variant before sending ads.`,
      409,
    );
  }
}

function variantByPrice(product: ProductNode, expected: number, label: string) {
  const match = product?.variants.nodes.find(
    (variant) => variant.price.currencyCode === "USD" && cents(variant.price.amount) === expected,
  );
  if (!match) {
    throw new CheckoutError(
      `${label} needs a Shopify variant priced at $${dollars(expected)}. Storefront checkout charges the variant price, so a free gift has to be a $0.00 variant.`,
      409,
    );
  }
  return match;
}

export function findPressVariant(variants: VariantNode[], tier: Tier, color: PressColor) {
  return variants.find((variant) => {
    const haystack = [variant.title, ...variant.selectedOptions.map((option) => option.value)].join(" ");
    const tokens = haystack.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const colorOk = tokens.includes(color.toLowerCase());
    const packOk = matchesPack(haystack, tier);
    return colorOk && packOk;
  });
}

export type CheckoutRequest = {
  tier: Tier;
  color: PressColor;
  addons: AddonId[];
  attributes: { key: string; value: string }[];
};

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
  const allowedAttributes = new Set([
    "_fbp",
    "_fbc",
    "fbclid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gift_message",
  ]);
  const attributes = Array.isArray(record.attributes)
    ? record.attributes.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const entry = item as { key?: unknown; value?: unknown };
        if (typeof entry.key !== "string" || typeof entry.value !== "string") return [];
        if (!allowedAttributes.has(entry.key)) return [];
        const value = entry.key === "gift_message" ? entry.value.trim().slice(0, 200) : entry.value.slice(0, 500);
        if (!value) return [];
        return [{ key: entry.key, value }];
      })
    : [];
  return { tier: record.tier, color: record.color, addons, attributes };
}

export async function createCheckout(request: CheckoutRequest) {
  const data = await storefront<{
    press: ProductNode;
    refill: ProductNode;
    frother: ProductNode;
    card: ProductNode;
  }>(CATALOG_QUERY);

  const catalog: Catalog = data;
  const pressVariants = catalog.press?.variants.nodes ?? [];
  const press = findPressVariant(pressVariants, request.tier, request.color);
  if (!press) {
    throw new CheckoutError(
      `No ${request.color} Pack ${request.tier} variant on ${HANDLES.press}. Options should be Pack 1/2/3 and Black/White/Green.`,
      409,
    );
  }
  assertPrice(press, PRICE.tier[request.tier], `${request.color} Pack ${request.tier}`);

  const lines: { merchandiseId: string; quantity: number }[] = [
    { merchandiseId: press.id, quantity: 1 },
  ];

  if (request.tier === 2 || request.tier === 3) {
    const refill = variantByPrice(catalog.refill, 0, "Cocoa & cinnamon refill kit");
    lines.push({ merchandiseId: refill.id, quantity: 1 });
  }

  const wantsPaidFrother = request.addons.includes("milk-frother-wand") && request.tier !== 3;
  if (request.tier === 3) {
    const frother = variantByPrice(catalog.frother, 0, "Milk frother wand gift");
    lines.push({ merchandiseId: frother.id, quantity: 1 });
  } else if (wantsPaidFrother) {
    const frother = variantByPrice(catalog.frother, PRICE.frother, "Milk frother wand");
    lines.push({ merchandiseId: frother.id, quantity: 1 });
  }

  if (request.addons.includes("custom-message-card")) {
    const card = variantByPrice(catalog.card, PRICE.messageCard, "Custom message card");
    lines.push({ merchandiseId: card.id, quantity: 1 });
  }

  const result = await storefront<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(CART_MUTATION, {
    input: {
      lines,
      attributes: request.attributes,
    },
  });

  const errors = result.cartCreate.userErrors;
  const checkoutUrl = result.cartCreate.cart?.checkoutUrl;
  if (errors.length > 0 || !checkoutUrl) {
    throw new CheckoutError(errors.map((error) => error.message).join(" ") || "Shopify didn't open checkout.", 502);
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(checkoutUrl);
  } catch {
    throw new CheckoutError("Shopify returned an unreadable checkout link.", 502);
  }
  if (parsedUrl.protocol !== "https:") {
    throw new CheckoutError("Shopify returned an unsafe checkout link.", 502);
  }

  return {
    checkoutUrl,
    variantId: press.id,
    value: dollars(
      payableCents(request.tier, {
        frother: wantsPaidFrother,
        messageCard: request.addons.includes("custom-message-card"),
      }),
    ),
  };
}
