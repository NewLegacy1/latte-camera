import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <PolicyShell title="Accessibility" lede="The morning shop should work without a hunt.">
      <p>
        We build The Latte Camera page so it can be read, tabbed, and bought on a phone. Text and buttons meet ordinary contrast. The buy button is a real button. Color choices are labeled with words, not only a swatch. Questions open from the keyboard.
      </p>
      <p>
        If a barrier stops you, write through the contact page and name the page and the step. We will answer and fix what we can. Checkout itself is the Shopify page, and their accessibility statement covers that hop.
      </p>
    </PolicyShell>
  );
}
