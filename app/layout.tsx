import type { Metadata } from "next";
import "./store.css";
import ShopifyAnalytics from "./shopify-analytics";

export const metadata: Metadata = {
  title: "The Latte Camera | DearLatte",
  description: "Make café-worthy latte art at home with the DearLatte Latte Camera and 12 reusable stencil designs.",
};
export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><head><ShopifyAnalytics /></head><body>{children}</body></html>;
}
