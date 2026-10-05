export const colors = ["Black", "White", "Green"] as const;
export type PressColor = (typeof colors)[number];

export const tiers = [1, 2, 3] as const;
export type Tier = (typeof tiers)[number];

export const addonIds = ["milk-frother-wand", "custom-message-card"] as const;
export type AddonId = (typeof addonIds)[number];

export const HANDLES = {
  press: "dear-latte-stencil-press",
  refill: "cocoa-cinnamon-refill-kit",
  frother: "milk-frother-wand",
  messageCard: "custom-message-card",
} as const;

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
