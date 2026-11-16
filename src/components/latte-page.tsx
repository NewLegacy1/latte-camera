"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCheckout } from "@/components/checkout-provider";
import { LatteBuyPanel } from "@/components/latte-buy-panel";
import { brandMarks, packShortName, slides } from "@/components/latte-data";
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
  const ctaRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setSticky(!entry.isIntersecting);
    });
    observer.observe(cta);
    return () => observer.disconnect();
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
      <div className="sale-bar simple" role="status">
        <strong>Early Black Friday</strong>
        <span>Free shipping on every order</span>
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
                <Image
                  key={shown.src}
                  className={`shot${colorShot ? " contain" : ""}`}
                  src={shown.src}
                  alt={shown.alt}
                  fill
                  priority={slide === 0 && !colorShot}
                  sizes="(min-width: 900px) 560px, 100vw"
                />
                <button type="button" className="g-nav prev" aria-label="Previous photo" onClick={() => show(slide - 1)}>
                  <Mark name="left" />
                </button>
                <button type="button" className="g-nav next" aria-label="Next photo" onClick={() => show(slide + 1)}>
                  <Mark name="right" />
                </button>
              </div>
              <div className="gallery-logo-rail" aria-hidden="true">
                <div className="logo-track">
                  {[0, 1].map((loop) => (
                    <div className="logo-loop" key={loop}>
                      {brandMarks.map((brand) => (
                        // eslint-disable-next-line @next/next/no-img-element -- grey brand strip
                        <img
                          className="brand-logo"
                          key={`${loop}-${brand.name}`}
                          src={brand.src}
                          alt=""
                          height={22}
                        />
                      ))}
                    </div>
                  ))}
                </div>
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
        <div className="row slim">
          <div className="sticky-copy">
            <strong>{packShortName(offer.tier)}</strong>
            <span>{money(offer.totalCents)}</span>
          </div>
          <button type="button" className="btn" onClick={checkout.buy} disabled={checkout.status === "loading"} tabIndex={sticky ? 0 : -1}>
            <span>{checkout.status === "loading" ? "Opening…" : "Buy now"}</span>
          </button>
        </div>
      </div>
      <div className={`toast${checkout.error ? " show" : ""}`} role="status">
        {checkout.error}
      </div>
    </div>
  );
}
