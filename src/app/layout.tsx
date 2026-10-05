import type { Metadata, Viewport } from "next";
import { Allura, Montserrat, Playfair_Display } from "next/font/google";
import { MetaBootstrap } from "@/components/meta-bootstrap";
import { ShopifyAnalytics } from "@/components/shopify-analytics";
import { WhopPixel } from "@/components/whop-pixel";
import "./globals.css";
import "./storefront.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allura",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:43123";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Latte Camera — Dear Latte",
    template: "%s — Dear Latte",
  },
  description:
    "A fully mechanical stencil press. Slide in a card, press once, and cocoa dusts a café-style design onto their morning coffee. A little love in every cup.",
  openGraph: {
    title: "The Latte Camera — Dear Latte",
    description: "Your coffee. With a little personality.",
    images: ["/images/hero.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F1E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const shop = process.env.SHOPIFY_STORE_DOMAIN ?? "";

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} ${allura.variable} h-full antialiased`}
    >
      <head>
        <WhopPixel />
      </head>
      <body>
        <a href="#shop" className="sr-only">
          Skip to the press
        </a>
        <MetaBootstrap />
        <ShopifyAnalytics shop={shop} />
        {children}
      </body>
    </html>
  );
}
