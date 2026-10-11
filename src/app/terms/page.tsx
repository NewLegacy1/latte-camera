import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <PolicyShell title="Terms" lede="The press is mechanical. The prices on the page are the prices.">
      <p>
        The Latte Camera is a fully mechanical stencil press. It is not a photo printer. It does not print photos. There is no battery and nothing to upload.
      </p>
      <h2>What you are buying</h2>
      <p>
        Each press ships with 4 reusable stencil cards. Designs vary, and the buyer does not choose which four. We do not promise 12 cards or a specific drawing in the box. Colors are Black, White, and Green at the same price.
      </p>
      <p>
        Buy 1 is $60.00 (compare-at $99.95). Buy 2 is $100.00 and includes a free cocoa and cinnamon refill kit. Buy 3 is $150.00, Buy 2 Get 1 Half Off, and includes a free refill kit and a free milk frother wand. The milk frother wand is $14.95 when added to Buy 1 or Buy 2. Free shipping on every tier. We do not offer other discounts on this site.
      </p>
      <h2>Checkout</h2>
      <p>
        The buy button opens secure checkout by Stripe. The purchase contract, tax, and payment are completed there. Ships in 2-5 business days. The 30-day money-back guarantee and 1-year warranty are described on the refund page.
      </p>
      <p>Use the press on foam. Cocoa and cinnamon are food dusts. Keep them dry, and keep the press away from a sink full of water.</p>
    </PolicyShell>
  );
}
