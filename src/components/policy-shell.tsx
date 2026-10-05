import Link from "next/link";
import { Logo, StoreFooter } from "@/components/store-chrome";

export function PolicyShell({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="policy-page">
      <div className="announce">Free shipping on every order · 30-day money-back guarantee</div>
      <header className="bar">
        <Link href="/#shop" aria-label="Dear Latte home">
          <Logo />
        </Link>
      </header>
      <main className="card">
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        <div className="copy">{children}</div>
        <p className="back">
          <Link className="btn inline" href="/#shop">
            Back to the press
          </Link>
        </p>
      </main>
      <StoreFooter />
    </div>
  );
}
