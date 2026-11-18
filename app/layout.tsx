import type { Metadata } from "next";
import "./store.css";

export const metadata: Metadata = {
  title: "The Latte Camera | DearLatte",
  description: "Make café-worthy latte art at home with the DearLatte Latte Camera and 12 reusable stencil designs.",
};
export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
