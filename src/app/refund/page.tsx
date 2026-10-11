import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Refunds" };

export default function RefundPage() {
  return (
    <PolicyShell title="Refunds" lede="Thirty days to decide the morning was a miss.">
      <p>
        30-day money-back guarantee. If the press is not their thing, write to us within 30 days of delivery and we will refund the order. The window starts the day it arrives. Ships in 2-5 business days.
      </p>
      <h2>The warranty</h2>
      <p>
        1-year warranty on the mechanical press. If the mechanism fails in ordinary use inside that year, we repair or replace it. Stencil cards are paper. Cocoa and cinnamon are food. The warranty covers the press itself.
      </p>
      <h2>How to start</h2>
      <p>
        Use the contact email on this site when one is published. Otherwise use the email on your Shopify order confirmation and include the order number. Shopify is where the payment lives, so the refund returns on that same payment.
      </p>
      <p>The box is one press and 4 reusable stencil cards. A different card design is not a defect.</p>
    </PolicyShell>
  );
}
