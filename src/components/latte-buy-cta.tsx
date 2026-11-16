"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { useCheckout } from "@/components/checkout-provider";
import { packSummary } from "@/components/latte-data";
import { useOffer } from "@/components/offer-provider";
import { PayMarks } from "@/components/pay-marks";
import { money } from "@/lib/offer";

export function LatteBuyCta({ ctaRef }: { ctaRef: RefObject<HTMLButtonElement | null> }) {
  const offer = useOffer();
  const checkout = useCheckout();

  return (
    <>
      <p className="eta">
        <span className="dot" aria-hidden="true" />
        Ships in 1–2 business days
      </p>
      <button
        ref={ctaRef}
        className="btn cart-cta"
        type="button"
        id="buy-now"
        onClick={checkout.buy}
        disabled={checkout.status === "loading"}
      >
        <span>{checkout.status === "loading" ? "Opening…" : `Buy now — ${money(offer.totalCents)}`}</span>
      </button>
      <p className="box-check">
        <span>{packSummary(offer.tier)}</span>
      </p>
      <div className="payments slim">
        <PayMarks />
      </div>
      <p className="ship-note">Free shipping · 30-day money-back guarantee</p>

      <div className="acc">
        <details>
          <summary>
            <span>Is it a photo printer?</span>
          </summary>
          <div className="body">
            <p>
              No. The Latte Camera makes designs using reusable stencil cards and cocoa or cinnamon. It’s fully
              mechanical, with no app, ink, or charging.
            </p>
          </div>
        </details>
        <details>
          <summary>
            <span>What drinks does it work on?</span>
          </summary>
          <div className="body">
            <p>Use it to decorate the foam on lattes, cappuccinos, and other foamy drinks. Start with a smooth foam surface for the design.</p>
          </div>
        </details>
        <details>
          <summary>
            <span>Shipping &amp; Returns</span>
          </summary>
          <div className="body">
            <p>
              Free shipping on every order. Ships in 1–2 business days. 30-day money-back guarantee.{" "}
              <Link href="/shipping">Shipping details</Link> · <Link href="/refund">Returns</Link>.
            </p>
          </div>
        </details>
      </div>
    </>
  );
}
