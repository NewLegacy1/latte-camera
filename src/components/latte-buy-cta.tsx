"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { useCheckout } from "@/components/checkout-provider";
import { packLabel } from "@/components/latte-data";
import { Mark } from "@/components/latte-marks";
import { useOffer } from "@/components/offer-provider";
import { PayMarks } from "@/components/pay-marks";
import { money, packCompareCents, packSaveCents } from "@/lib/offer";

export function LatteBuyCta({ ctaRef }: { ctaRef: RefObject<HTMLButtonElement | null> }) {
  const offer = useOffer();
  const checkout = useCheckout();
  const cleanCompare = !offer.paidFrother && !offer.messageCard;

  return (
    <>
      <p className="eta">
                <span className="dot" aria-hidden="true" />
                Dispatches in 2–5 business days
              </p>
              <p className="xmas-note">Order by November 20 for guaranteed Christmas delivery.</p>
              <button ref={ctaRef} className="btn cart-cta" type="button" id="buy-now" onClick={checkout.buy} disabled={checkout.status === "loading"}>
                <span>{checkout.status === "loading" ? "Opening…" : "Buy now"}</span>
                <span className="cta-price">
                  {cleanCompare && offer.tier === 1 ? <s>{money(packCompareCents(1))}</s> : null}
                  <b>{money(offer.totalCents)}</b>
                </span>
                <span className="cta-arrow" aria-hidden="true">→</span>
              </button>
              <p className="box-check">
                <Mark name="cards" />
                <span>Your box: {packLabel(offer.tier)} + <b>4 reusable stencil cards</b>{offer.tier >= 2 ? " + gifts" : ""}</span>
              </p>
              {cleanCompare && offer.tier > 1 ? (
                <p className="save-note">You save {money(packSaveCents(offer.tier))} vs buying singles</p>
              ) : null}
              <figure className="buy-quote">
                <div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote>
                  “I never thought I&apos;d care about latte art but here I am, making little hearts on my oat milk latte every morning.”
                </blockquote>
                <figcaption>Sarah L. · verified buyer</figcaption>
              </figure>
              <div className="payments slim">
                <PayMarks />
              </div>
              <p className="ship-note">Free shipping · 30-day money-back guarantee</p>

              <div className="assure">
                <div><Mark name="shield" /><span>30-day money-back guarantee</span></div>
                <div><Mark name="truck" /><span>Free shipping on every order</span></div>
                <div><Mark name="warranty" /><span>1-year warranty on the press</span></div>
              </div>

              <div className="acc">
                <details>
                  <summary><span>Is it a photo printer?</span></summary>
                  <div className="body">
                    <p>No. The Latte Camera makes designs using reusable stencil cards and cocoa or cinnamon. It’s fully mechanical, with no app, ink, or charging.</p>
                  </div>
                </details>
                <details>
                  <summary><span>What drinks does it work on?</span></summary>
                  <div className="body">
                    <p>Use it to decorate the foam on lattes, cappuccinos, and other foamy drinks. Start with a smooth foam surface for the design.</p>
                  </div>
                </details>
                <details>
                  <summary><span>Shipping</span></summary>
                  <div className="body">
                    <p>Shipping is free on every order. Orders dispatch in 2–5 business days. <Link href="/shipping">See our shipping information</Link> for delivery estimates.</p>
                  </div>
                </details>
              </div>
    </>
  );
}
