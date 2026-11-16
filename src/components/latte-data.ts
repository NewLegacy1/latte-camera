import { PRICE, money, packSaveCents, type Tier } from "@/lib/offer";

/** Early Black Friday ends end-of-day Nov 20, 2026 in America/Toronto (EST). */
export const SALE_ENDS_AT = Date.parse("2026-11-21T04:59:59.000Z");

export type Countdown = { days: string; hrs: string; min: string; sec: string; live: boolean };

export function readCountdown(now = Date.now()): Countdown {
  const left = Math.max(0, SALE_ENDS_AT - now);
  const total = Math.floor(left / 1000);
  const days = Math.floor(total / 86400);
  const hrs = Math.floor((total % 86400) / 3600);
  const min = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { days: pad(days), hrs: pad(hrs), min: pad(min), sec: pad(sec), live: left > 0 };
}

export const brandMarks = [
  { name: "Starbucks", src: "/images/logos/starbucks.png" },
  { name: "TikTok", src: "/images/logos/tiktok.png" },
  { name: "Amazon", src: "/images/logos/amazon.png" },
  { name: "Etsy", src: "/images/logos/etsy.png" },
  { name: "Instagram", src: "/images/logos/instagram.png" },
  { name: "Facebook", src: "/images/logos/facebook.png" },
] as const;

export const reviews = [
  {
    title: "My mornings are so much better",
    body: "I never thought I'd care about latte art but here I am, making little hearts on my oat milk latte every morning. It's become my favorite part of the routine. The stencils slide in and out so easily.",
    name: "Sarah L.",
  },
  {
    title: "Bought 3 — one for each color",
    body: "Got the white one first, then came back for the sage and the black. They look incredible on my coffee bar. My friends all want one now. The cocoa powder designs are so sharp and detailed, way better than I expected.",
    name: "Marcus T.",
  },
  {
    title: "Perfect for my coffee shop",
    body: "We use Dear Latte at our small café and customers light up every time. The designs are our go-tos. It adds a personal touch that people actually photograph and post about. Great for business.",
    name: "Elena V.",
  },
] as const;

export const slides: { src: string; alt: string }[] = [
  {
    src: "/images/shot-press.jpg",
    alt: "A hand pressing the Latte Camera over a latte, dusting a cocoa design onto the foam.",
  },
  {
    src: "/images/shot-serve.jpg",
    alt: "Finished lattes with cocoa designs served on a café table.",
  },
  {
    src: "/images/shot-gift.jpg",
    alt: "A couple lifting the Latte Camera out of a gift box. Example designs; included cards vary.",
  },
  {
    src: "/images/shot-cards.jpg",
    alt: "Reusable stencil cards from the Dear Latte starter pack. Designs vary by box.",
  },
  {
    src: "/images/shot-designs.jpg",
    alt: "Latte foam designs stamped with the Latte Camera.",
  },
  {
    src: "/images/shot-steps.jpg",
    alt: "Fill, slide, and press — the three steps to latte art with the Latte Camera.",
  },
  {
    src: "/images/shot-before.jpg",
    alt: "The Latte Camera beside a fresh latte, ready to stamp.",
  },
  {
    src: "/images/gallery-table.jpg",
    alt: "Dear Latte setup on a coffee table with designed lattes.",
  },
  {
    src: "/images/gallery-camera-cup.jpg",
    alt: "The Latte Camera beside a speckled mug with heart latte art and Morning Mischief stencil cards.",
  },
];

export const packs: {
  tier: Tier;
  name: string;
  line: string;
  badge?: string;
  include?: string;
}[] = [
  {
    tier: 1,
    name: "One for you",
    line: "1 camera · 4 stencil cards",
  },
  {
    tier: 2,
    name: "One to keep. One to give.",
    line: "2 cameras · 8 stencil cards",
    badge: "MOST POPULAR",
    include: "Free cocoa & cinnamon refill kit",
  },
  {
    tier: 3,
    name: "The gifting set",
    line: "3 cameras · 12 stencil cards",
    badge: "BOTH GIFTS INCLUDED",
    include: "Free refill kit + milk frother",
  },
];

export const moments = [
  {
    src: "/images/mornings.jpg",
    alt: "Two finished lattes with cocoa designs beside the Latte Camera. Example designs; included cards vary.",
    caption: "Just for you.",
  },
  {
    src: "/images/shot-serve.jpg",
    alt: "Friends at a table with designed lattes and the Latte Camera.",
    caption: "Made for two.",
  },
  {
    src: "/images/shot-before.jpg",
    alt: "A plain latte beside one finished with a cocoa design.",
    caption: "One more before you go?",
  },
] as const;

export function stencilCount(tier: Tier) {
  return tier * 4;
}

export function packLabel(tier: Tier) {
  switch (tier) {
    case 1:
      return `1 camera · ${stencilCount(1)} stencil cards`;
    case 2:
      return `2 cameras · ${stencilCount(2)} stencil cards`;
    case 3:
      return `3 cameras · ${stencilCount(3)} stencil cards`;
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}

export function packSummary(tier: Tier) {
  switch (tier) {
    case 1:
      return packLabel(1);
    case 2:
      return `${packLabel(2)} · Free refill kit`;
    case 3:
      return `${packLabel(3)} · Free refill kit + frother`;
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}

export function packShortName(tier: Tier) {
  switch (tier) {
    case 1:
      return "One for you";
    case 2:
      return "One to keep. One to give.";
    case 3:
      return "The gifting set";
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}

/** Kept for older imports that still reference money/packSaveCents through this module. */
export { PRICE, money, packSaveCents };
