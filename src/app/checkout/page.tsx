import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <PolicyShell title="Checkout lives on our secure checkout page." lede="This page does not take payment.">
      <p>Pick a color and a pack, then the cherry button opens secure checkout by Stripe at checkout.dearlatte.shop.</p>
    </PolicyShell>
  );
}
