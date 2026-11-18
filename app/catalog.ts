export const colours = {
  cream: { name: "Cream White", shopify: "White", swatch: "#f0e6d1" },
  sage: { name: "Sage Green", shopify: "Green", swatch: "#a6ad96" },
  black: { name: "Black", shopify: "Black", swatch: "#302c29" },
} as const;
export type Colour = keyof typeof colours;

export const bundles = [
  { count: 1, name: "One Camera", price: 6000, finishes: ["cream"], freeShipping: false, gifts: [] },
  { count: 2, name: "Two Cameras", price: 10000, finishes: ["cream", "sage"], popular: true, freeShipping: true, gifts: ["refill"] },
  { count: 3, name: "Three Cameras", price: 15000, finishes: ["black", "cream", "sage"], freeShipping: true, gifts: ["refill", "frother"] },
] as const;
export type BundleIndex = 0 | 1 | 2;
export const defaultColours: Colour[] = ["cream", "sage", "black"];

export const gifts = {
  frother: { name: "Handheld Milk Frother", image: "frother" },
  refill: { name: "Cocoa & Cinnamon Refill Kit", image: "refill" },
} as const;
export type Selection = { bundle: BundleIndex; colours: Colour[] };
export type CartItem = Selection & { quantity: number };
export const money = (cents: number, compact = false, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", {
    style: "currency", currency, currencyDisplay: "narrowSymbol",
    minimumFractionDigits: compact && cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
  }).format(cents / 100);
export const selectionKey = (item: Selection) =>
  JSON.stringify([item.bundle, item.colours]);

export function readCart(value: string | null): CartItem[] {
  try {
    const rows: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter((row): row is CartItem => {
      if (!row || !Number.isInteger(row.bundle) || !bundles[row.bundle as BundleIndex]) return false;
      return Number.isSafeInteger(row.quantity) && row.quantity > 0 &&
        Array.isArray(row.colours) && row.colours.length === bundles[row.bundle as BundleIndex].count &&
        row.colours.every((colour: string) => Object.hasOwn(colours, colour));
    });
  } catch {
    return [];
  }
}

export const gallery = [
  { image: "hero", alt: "Sage Green Latte Camera beside a cappuccino with a cocoa heart", label: "The Latte Camera" },
  { image: "press", alt: "A hand presses the Latte Camera as cocoa falls onto the foam", label: "The cocoa press" },
  { image: "holiday-camera", alt: "Cream White Latte Camera with four holiday and everyday stencils", label: "Cream White camera and stencils" },
  { image: "stencil-demo", alt: "Sliding a bulldog stencil into a Cream White Latte Camera", label: "Sliding in a stencil" },
  { image: "family", alt: "A hand holding the Sage Green Latte Camera above a cup", label: "The camera in hand" },
  { image: "cups", alt: "Five decorated lattes alongside a Sage Green Latte Camera", label: "The finished cups" },
  { image: "kit", alt: "The Latte Camera and stencils arranged together", label: "Camera and stencils" },
  { image: "gift", alt: "A Sage Green Latte Camera in a tissue-lined gift box", label: "Gifting inspiration" },
] as const;

export const info = [
  ["How It Works", "Fill the camera with cocoa or cinnamon powder. Slide in a reusable stencil, hold the camera over your foamy coffee and press. Lift to reveal your design."],
  ["What’s Included", "Each Latte Camera includes 12 reusable stencil designs."],
  ["Product Details", "A camera-shaped, manually operated stencil press for cocoa or cinnamon. It requires no batteries or electricity."],
  ["Shipping & Returns", "The two- and three-camera bundles include standard shipping. Available delivery services and rates for your address appear at checkout."],
] as const;

export const faq = [
  ["Do I need an espresso machine?", "No. Start with a drink that has a layer of milk foam, such as a latte or cappuccino."],
  ["What powder can I use?", "Use cocoa or ground cinnamon to create your design."],
  ["Can I reuse the stencils?", "Yes. The 12 included stencil designs are reusable."],
  ["Can I mix colours in a bundle?", "Yes. Choose Black, Cream White or Sage Green independently for every camera in your bundle."],
] as const;

export type Review = { id: string; name: string; title: string; quote: string; rating: number };
export const reviews: readonly [Review, ...Review[]] = [
  { id: "sarah", name: "Sarah L.", title: "My Mornings Are So Much Better", rating: 5, quote: "I never thought I'd care about latte art but here I am, making little hearts on my oat milk latte every morning. It's become my favorite part of the routine. The stencils slide in and out so easily." },
  { id: "marcus", name: "Marcus T.", title: "Bought 3 — One for Each Color", rating: 5, quote: "Got the white one first, then came back for the sage and the black. They look incredible on my coffee bar. My friends all want one now. The cocoa powder designs are so sharp and detailed, way better than I expected." },
  { id: "elena", name: "Elena V.", title: "Perfect for My Coffee Shop", rating: 5, quote: "We use DearLatte at our small café and customers light up every time. The 'Thank You' and 'Good Morning' stencils are our go-tos. It adds a personal touch that people actually photograph and post about. Great for business." },
];
