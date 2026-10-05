import { CheckoutProvider } from "@/components/checkout-provider";
import { LattePage } from "@/components/latte-page";
import { OfferProvider } from "@/components/offer-provider";
import { ViewContent } from "@/components/view-content";
import { PRICE, dollars } from "@/lib/offer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:43123";

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Latte Camera",
  brand: { "@type": "Brand", name: "Dear Latte" },
  sku: "dear-latte-stencil-press",
  description:
    "A fully mechanical stencil press shaped like a retro camera. Add cocoa or cinnamon, slide in a stencil card, and press once. The design dusts onto foam. It does not print photos. Each box includes 1 press and 4 reusable stencil cards. Designs vary.",
  image: [
    `${siteUrl}/images/hero.jpg`,
    `${siteUrl}/images/shot-press.jpg`,
    `${siteUrl}/images/shot-designs.jpg`,
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
    url: siteUrl,
  })),
};

export default function HomePage() {
  return (
    <OfferProvider>
      <CheckoutProvider>
        <ViewContent />
        <LattePage />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      </CheckoutProvider>
    </OfferProvider>
  );
}
