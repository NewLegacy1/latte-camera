import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PolicyShell title="Privacy" lede="What this shop collects, and what it refuses to invent.">
      <p>
        Dear Latte is a headless storefront. This website does not take your card. Payment runs on our secure checkout at checkout.dearlatte.shop (processed by Stripe), and order records and fulfillment live in Shopify.
      </p>
      <h2>What we send checkout</h2>
      <p>
        When you press Buy now, our server opens a checkout with the pack, the color, and any refill kit or frother the offer includes. Click IDs and campaign tags from the link you arrived on, the first page and referring site of your visit, the Meta browser cookies, a random visitor ID this site stores in a cookie, the Shopify visit cookies, your IP address, and your browser string ride along too, so the order can be matched to the ad that sent you.
      </p>
      <h2>Meta</h2>
      <p>
        If a Meta pixel and Conversions API token are configured, this site sends PageView, ViewContent, AddToCart, and InitiateCheckout. Each browser event carries an event id that the server sends again with the same id, so Meta can count it once. The checkout sends InitiateCheckout with that same id, and sends Purchase. This website never sends Purchase.
      </p>
      <p>Those calls can include the Meta browser cookies _fbp and _fbc, a hashed copy of the random visitor ID, the page address, and the IP address and browser string the request already carries. We do not ask you for an account on this site.</p>
      <h2>Shopify</h2>
      <p>Our store runs on Shopify. This site reports page views, adds to cart, and checkout starts to Shopify analytics using the Shopify visit cookies, and only when the Shopify privacy settings allow analytics.</p>
      <h2>Microsoft Clarity</h2>
      <p>We use Microsoft Clarity to see how visitors use the page, through heatmaps and session recordings, so we can fix what gets in the way. Clarity sets cookies and records clicks, scrolling, and page interactions. It does not capture what you type into checkout.</p>
      <h2>What stays off this site</h2>
      <p>We do not sell personal information. We do not run an on-site checkout. We do not store card numbers here.</p>
    </PolicyShell>
  );
}
