export const colors = ["Black", "White", "Green"] as const;
export type PressColor = (typeof colors)[number];

export const tiers = [1, 2, 3] as const;
export type Tier = (typeof tiers)[number];

export const addonIds = ["milk-frother-wand", "custom-message-card"] as const;
export type AddonId = (typeof addonIds)[number];

/**
 * Shopify variant IDs on edr0qi-9t.myshopify.com. Checkout sends these lines
 * to Ownlane, and Meta events use them as content IDs so browsing events match
 * Ownlane's Purchase. Server env vars can override them (src/lib/ownlane.ts).
 */
export const VARIANTS = {
  colors: { Black: "67926128984287", White: "67925834301663", Green: "67926129017055" } as Record<PressColor, string>,
  refillKitGift: "67926129213663",
  frotherGift: "67926754033887",
  frother: "67926129443039",
};
export type VariantIds = typeof VARIANTS;

/** The Shopify lines for a pack: Buy 2 adds the refill kit, Buy 3 adds the refill kit and frother. */
export function packLines(tier: Tier, color: PressColor, paidFrother: boolean, ids: VariantIds = VARIANTS) {
  const lines = [{ variantId: ids.colors[color], quantity: tier as number }];
  if (tier === 2 || tier === 3) lines.push({ variantId: ids.refillKitGift, quantity: 1 });
  if (tier === 3) lines.push({ variantId: ids.frotherGift, quantity: 1 });
  else if (paidFrother) lines.push({ variantId: ids.frother, quantity: 1 });
  return lines;
}

const PRODUCTS: Record<string, { productId: string; name: string }> = {
  [VARIANTS.colors.Black]: { productId: "15412939948255", name: "The Latte Camera" },
  [VARIANTS.colors.White]: { productId: "15412939948255", name: "The Latte Camera" },
  [VARIANTS.colors.Green]: { productId: "15412939948255", name: "The Latte Camera" },
  [VARIANTS.refillKitGift]: { productId: "15412968947935", name: "Cocoa & Cinnamon Refill Kit (Free Gift)" },
  [VARIANTS.frotherGift]: { productId: "15413097857247", name: "Milk Frother Wand (Free Gift)" },
  [VARIANTS.frother]: { productId: "15412969046239", name: "Milk Frother Wand" },
};

/** The pack as Shopify Analytics products: the pack price spread over the presses, gifts at $0. */
export function packProducts(tier: Tier, color: PressColor, paidFrother: boolean) {
  return packLines(tier, color, paidFrother).map((line) => {
    const product = PRODUCTS[line.variantId];
    const unitCents =
      line.variantId === VARIANTS.colors[color] ? PRICE.tier[tier] / tier : line.variantId === VARIANTS.frother ? PRICE.frother : 0;
    return {
      productGid: `gid://shopify/Product/${product.productId}`,
      variantGid: `gid://shopify/ProductVariant/${line.variantId}`,
      name: product.name,
      variantName: line.variantId === VARIANTS.colors[color] ? color : "",
      price: (unitCents / 100).toFixed(2),
      quantity: line.quantity,
    };
  });
}

/** Locked prices in cents. Do not add other discounts. */
export const PRICE = {
  tier: { 1: 6000, 2: 10000, 3: 15000 },
  compareTier1: 9995,
  frother: 1495,
  messageCard: 1995,
} as const;

export const SWATCH: Record<PressColor, string> = {
  Black: "#241816",
  White: "#F4F0EA",
  Green: "#B0BCA6",
};

export function isTier(value: unknown): value is Tier {
  return value === 1 || value === 2 || value === 3;
}

export function isColor(value: unknown): value is PressColor {
  return value === "Black" || value === "White" || value === "Green";
}

export function isAddon(value: unknown): value is AddonId {
  return value === "milk-frother-wand" || value === "custom-message-card";
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

/** What the customer pays. Buy 3 already includes the frother. */
export function payableCents(
  tier: Tier,
  addons: { frother: boolean; messageCard: boolean },
) {
  const frother = tier === 3 ? 0 : addons.frother ? PRICE.frother : 0;
  const card = addons.messageCard ? PRICE.messageCard : 0;
  return PRICE.tier[tier] + frother + card;
}

export function packOption(tier: Tier) {
  switch (tier) {
    case 1:
      return "Pack 1";
    case 2:
      return "Pack 2";
    case 3:
      return "Pack 3";
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}

export function matchesPack(value: string, tier: Tier) {
  const normalized = value.toLowerCase().trim();
  if (normalized === String(tier)) return true;
  const pack = new RegExp(`\\bpack\\s*${tier}\\b`);
  const buy = new RegExp(`\\bbuy\\s*${tier}\\b`);
  return pack.test(normalized) || buy.test(normalized);
}
