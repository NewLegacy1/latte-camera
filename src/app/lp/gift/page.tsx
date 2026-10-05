import type { Metadata } from "next";
import { CheckoutProvider } from "@/components/checkout-provider";
import { LattePage } from "@/components/latte-page";
import { OfferProvider } from "@/components/offer-provider";
import { ViewContent } from "@/components/view-content";
import { PRICE, dollars } from "@/lib/offer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:43123";

export const metadata: Metadata = {
  title: "The gift for the coffee lover who has everything",
  description:
    "Turn their morning latte into a little surprise. Add cocoa or cinnamon, slide in a stencil, and press to decorate the foam. No barista skills needed.",
  openGraph: {
    title: "For the coffee lover who has everything",
    description: "Your coffee. With a little personality.",
    images: ["/images/hero.jpg"],
  },
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Latte Camera",
  brand: { "@type": "Brand", name: "Dear Latte" },
  sku: "dear-latte-stencil-press",
  description:
    "A mechanical stencil press for the coffee lover who has everything. Add cocoa or cinnamon, slide in a stencil, and press to decorate the foam. It does not print photos. Each box includes 1 press and 4 reusable stencil cards. Designs vary.",
  image: [
    `${siteUrl}/images/hero.jpg`,
    `${siteUrl}/images/shot-press.jpg`,
    `${siteUrl}/images/shot-gift.jpg`,
  ],
  offers: [
    { name: "Buy 1", price: dollars(PRICE.tier[1]) },
    { name: "Buy 2", price: dollars(PRICE.tier[2]) },
    { name: "Buy 3", price: dollars(PRICE.tier[3]) },
  ].map((offer) => ({
    "@type": "Offer",
    name: offer.name,
    price: offer.price,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/lp/gift`,
  })),
};

export default function GiftLandingPage() {
  return (
    <OfferProvider>
      <CheckoutProvider>
        <ViewContent />
        <LattePage angle="gift" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      </CheckoutProvider>
    </OfferProvider>
  );
}
