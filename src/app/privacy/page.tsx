import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PolicyShell title="Privacy" lede="What this shop collects, and what it refuses to invent.">
      <p>
        Dear Latte is a headless storefront. This website does not take your card. Payment, order records, and fulfillment live in Shopify checkout.
      </p>
      <h2>What we send Shopify</h2>
      <p>
        When you press Buy now, our server creates a Shopify cart with the pack, the color, any refill kit or frother the offer includes, and the custom message card if you added it. If you wrote a card message, that text rides along as a cart note so the order can be made. Click IDs and campaign parameters from the link you arrived on can ride along too, so the order can be matched to the ad that sent you.
      </p>
      <h2>Meta</h2>
      <p>
        If a Meta pixel and Conversions API token are configured, this site sends PageView, ViewContent, AddToCart, and InitiateCheckout. Each browser event carries an event id that the server sends again with the same id, so Meta can count it once. This website never sends Purchase. The Shopify Meta connection is the only Purchase source.
      </p>
      <p>Those calls can include the Meta browser cookies _fbp and _fbc, the page address, and the IP address and browser string the request already carries. We do not ask you for an account on this site.</p>
      <h2>What stays off this site</h2>
      <p>We do not sell personal information. We do not run an on-site checkout. We do not store card numbers here.</p>
    </PolicyShell>
  );
}
