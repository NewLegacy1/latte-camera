"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCheckout } from "@/components/checkout-provider";
import { LatteBuyPanel } from "@/components/latte-buy-panel";
import { brandMarks, readCountdown, slides, type Countdown } from "@/components/latte-data";
import { Mark } from "@/components/latte-marks";
import { LatteStory } from "@/components/latte-story";
import { useOffer } from "@/components/offer-provider";
import { Logo, StoreFooter } from "@/components/store-chrome";
import { money, type PressColor } from "@/lib/offer";

export function LattePage({ angle = "home" }: { angle?: "home" | "gift" }) {
  const offer = useOffer();
  const checkout = useCheckout();
  const [slide, setSlide] = useState(0);
  const [colorShot, setColorShot] = useState<PressColor | null>(null);
  const [sticky, setSticky] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>(() => readCountdown());
  const ctaRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setCountdown(readCountdown());
    const id = window.setInterval(() => setCountdown(readCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const cta = ctaRef.current;
    const hero = heroRef.current;
    if (!cta || !hero) return;
    let pastHero = false;
    let ctaVisible = true;
    const sync = () => setSticky(pastHero && !ctaVisible);
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sync();
    });
    const ctaObserver = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      ctaVisible = entry.isIntersecting;
      sync();
    });
    heroObserver.observe(hero);
    ctaObserver.observe(cta);
    return () => {
      heroObserver.disconnect();
      ctaObserver.disconnect();
    };
  }, []);

  const show = (index: number) => {
    setColorShot(null);
    setSlide((index + slides.length) % slides.length);
  };

  useEffect(() => {
    const active = document.querySelector('.store .thumbs button[aria-current="true"]');
    const scroller = active?.parentElement;
    if (!(active instanceof HTMLElement) || !scroller) return;
    const left = active.offsetLeft - (scroller.clientWidth - active.clientWidth) / 2;
    scroller.scrollTo({ left, behavior: "smooth" });
  }, [slide, colorShot]);

  const current = slides[slide] ?? slides[0];
  const cutout = `/images/press-${offer.color.toLowerCase()}.png`;
  const shown = colorShot
    ? {
        src: `/images/press-${colorShot.toLowerCase()}.png`,
        alt: `The Latte Camera in ${colorShot}. A mechanical stencil press with a gold lens ring, a silver dial, and a card slot.`,
      }
    : current;
  const showColor = (name: PressColor) => {
    setColorShot(name);
  };

  return (
    <div className="store">
      <div className={`sale-bar${countdown.live ? "" : " ended"}`} role="status">
        <div className="sale-copy">
          <strong>Early Black Friday Sale</strong>
          <span className="sale-sub">Ends November 20 · Free shipping every order</span>
        </div>
        {countdown.live ? (
          <div className="sale-clock" aria-label="Sale countdown">
            {(
              [
                ["Days", countdown.days],
                ["Hrs", countdown.hrs],
                ["Min", countdown.min],
                ["Sec", countdown.sec],
              ] as const
            ).map(([label, value]) => (
              <span className="tick" key={label}>
                <b>{value}</b>
                <small>{label}</small>
              </span>
            ))}
          </div>
        ) : (
          <span className="sale-ended">Sale ended — free shipping still on</span>
        )}
      </div>
      <header className="header">
        <div className="wrap">
          <a className="logo" href="#top" aria-label="Dear Latte home">
            <Logo />
          </a>
          <a className="icon-btn" href="#shop" aria-label="Choose a pack">
            <Mark name="bag" />
          </a>
        </div>
      </header>

      <div className="logo-rail" aria-hidden="true">
        <div className="logo-track">
          {[0, 1].map((loop) => (
            <div className="logo-loop" key={loop}>
              {brandMarks.map((brand) => (
                <span className={`brand-mark ${brand.name.toLowerCase()}`} key={`${loop}-${brand.name}`}>
                  {brand.mark}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main id="top">
        <section className="pdp" id="shop">
          <div className="wrap">
            <div className="gallery">
              <div
                className="ph main-img no-tags"
                ref={heroRef}
                onTouchStart={(event) => {
                  touchX.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (touchX.current == null) return;
                  const dx = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
                  touchX.current = null;
                  if (Math.abs(dx) > 40) show(slide + (dx < 0 ? 1 : -1));
                }}
              >
                <Image key={shown.src} className={`shot${colorShot ? " contain" : ""}`} src={shown.src} alt={shown.alt} fill priority={slide === 0 && !colorShot} sizes="(min-width: 900px) 560px, 100vw" />
                <em className="tag">Mechanical stencil press</em>
                <button type="button" className="g-nav prev" aria-label="Previous photo" onClick={() => show(slide - 1)}>
                  <Mark name="left" />
                </button>
                <button type="button" className="g-nav next" aria-label="Next photo" onClick={() => show(slide + 1)}>
                  <Mark name="right" />
                </button>
              </div>
              <div className="thumbs">
                {slides.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    aria-label={item.alt}
                    aria-current={!colorShot && index === slide}
                    onClick={() => show(index)}
                  >
                    <div className="ph">
                      <Image className="shot" src={item.src} alt="" fill sizes="80px" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <LatteBuyPanel angle={angle} ctaRef={ctaRef} onShowColor={showColor} />
          </div>
        </section>

        <LatteStory />
      </main>

      <StoreFooter />

      <div className={`sticky${sticky ? " show" : ""}`} aria-hidden={!sticky}>
        <div className="row">
          <Image className="press" src={cutout} alt="" width={104} height={100} />
          <div className="sticky-copy">
            <strong>The Latte Camera</strong>
            <span>{offer.tier === 1 ? "Buy 1" : offer.tier === 2 ? "Buy 2" : "Buy 3"} · {money(offer.totalCents)}</span>
          </div>
          <button type="button" className="btn" onClick={checkout.buy} disabled={checkout.status === "loading"} tabIndex={sticky ? 0 : -1}>
            <span>{checkout.status === "loading" ? "Opening…" : "Buy now"}</span>
            <span className="cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className={`toast${checkout.error ? " show" : ""}`} role="status">{checkout.error}</div>
    </div>
  );
}
