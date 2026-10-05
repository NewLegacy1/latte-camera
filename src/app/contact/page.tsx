import type { Metadata } from "next";
import { PolicyShell } from "@/components/policy-shell";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <PolicyShell title="Contact" lede="A real reply starts with your order number.">
      {email ? (
        <p>
          Write to <a href={`mailto:${email}`}>{email}</a>. Include the Shopify order number if you already bought.
        </p>
      ) : (
        <p>
          Use the email on your Shopify order confirmation. That note is the thread we can match to a parcel. This preview does not publish a placeholder inbox.
        </p>
      )}
      <p>For shipping times, start with the shipping page: ships in 2-3 days, free on every order.</p>
      <p>For a return, the 30-day money-back guarantee is on the refund page, along with the 1-year warranty on the press.</p>
    </PolicyShell>
  );
}
