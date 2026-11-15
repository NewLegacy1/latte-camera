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
  { name: "Starbucks", mark: "Starbucks" },
  { name: "TikTok", mark: "TikTok" },
  { name: "Amazon", mark: "amazon" },
  { name: "Etsy", mark: "Etsy" },
  { name: "Instagram", mark: "Instagram" },
  { name: "Facebook", mark: "Facebook" },
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
    src: "/images/hero.jpg",
    alt: "The white Latte Camera beside a latte with a cocoa Christmas tree on the foam. Example design; included cards vary.",
  },
  {
    src: "/images/shot-press.jpg",
    alt: "A hand pressing the Latte Camera over a latte, dusting a cocoa design onto the foam.",
  },
  {
    src: "/images/shot-designs.jpg",
    alt: "Four lattes with cocoa designs beside matching stencil cards. Example designs; the cards in the box vary.",
  },
  {
    src: "/images/shot-cards.jpg",
    alt: "The white Latte Camera beside four reusable stencil cards. Example designs; the four cards in the box vary.",
  },
  {
    src: "/images/shot-steps.jpg",
    alt: "Three frames: a stencil card sliding in, the press dusting a design onto foam, and the finished latte.",
  },
  {
    src: "/images/shot-serve.jpg",
    alt: "The Latte Camera on a holiday table with three designed lattes, while friends take a photo.",
  },
  {
    src: "/images/mornings.jpg",
    alt: "A couple toasting lattes with cocoa designs beside the Latte Camera.",
  },
  {
    src: "/images/shot-gift.jpg",
    alt: "A couple lifting the Latte Camera out of a gift box. Example designs; included cards vary.",
  },
  {
    src: "/images/shot-before.jpg",
    alt: "Two lattes side by side, one plain and one with a cocoa design, with the Latte Camera in front.",
  },
];

export const packs: {
  tier: Tier;
  name: string;
  support: string;
  badge?: string;
  dark?: boolean;
  bonuses: { title: string; note?: string }[];
}[] = [
  {
    tier: 1,
    name: "One for you",
    support: "Your morning coffee, dressed up",
    bonuses: [],
  },
  {
    tier: 2,
    name: "One to keep. One to give.",
    support: `Save ${money(packSaveCents(2))} compared with two singles`,
    badge: "Most popular",
    bonuses: [{ title: "Includes a FREE cocoa & cinnamon refill kit" }],
  },
  {
    tier: 3,
    name: "The gifting set",
    support: `Save ${money(packSaveCents(3))} compared with three singles, plus both gifts`,
    badge: "Includes both gifts",
    dark: true,
    bonuses: [
      { title: "Includes a FREE cocoa & cinnamon refill kit" },
      { title: `Plus a FREE milk frother wand · ${money(PRICE.frother)} value` },
    ],
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

export function packLabel(tier: Tier) {
  switch (tier) {
    case 1:
      return "1 Latte Camera";
    case 2:
      return "2 Latte Cameras";
    case 3:
      return "3 Latte Cameras";
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}
