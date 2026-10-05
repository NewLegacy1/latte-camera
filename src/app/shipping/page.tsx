import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <PolicyShell
      title="Shipping"
      lede="Free on every order. Here is the real window."
    >
      <p>Free shipping on every tier. Buy 1, Buy 2, and Buy 3 all ship free. There is no paid rush tier on this site.</p>
      <h2>When it ships</h2>
      <p>Ships in 2-3 days after checkout is paid.</p>
    </PolicyShell>
  );
}
