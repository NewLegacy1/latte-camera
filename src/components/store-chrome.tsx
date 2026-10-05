import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false, lockup = false }: { light?: boolean; lockup?: boolean }) {
  const src = lockup
    ? light
      ? "/images/logo-lockup-light.png"
      : "/images/logo-lockup.png"
    : light
      ? "/images/logo-wordmark-light.png"
      : "/images/logo-wordmark.png";

  return (
    <Image
      className={lockup ? "logo-lockup" : "logo-wordmark"}
      src={src}
      alt=""
      width={lockup ? 834 : 834}
      height={lockup ? 200 : 158}
      priority={!lockup}
    />
  );
}

const links = [
  ["/#shop", "Shop"],
  ["/shipping", "Shipping"],
  ["/refund", "Refunds"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/accessibility", "Accessibility"],
] as const;

export function StoreFooter() {
  return (
    <footer className="site">
      <div className="wrap inner">
        <Logo light lockup />
        <nav>
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <p className="fine">
          The Latte Camera is a fully mechanical stencil press. Each box includes 1 press and 4 reusable stencil cards. Designs vary. Secure checkout by Stripe.
        </p>
        <p className="fine">© {new Date().getFullYear()} Dear Latte</p>
      </div>
    </footer>
  );
}
