"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCheckout } from "@/components/checkout-provider";
import { useOffer } from "@/components/offer-provider";
import { PayMarks } from "@/components/pay-marks";
import { Logo, StoreFooter } from "@/components/store-chrome";
import { PRICE, SWATCH, colors, money, type PressColor, type Tier } from "@/lib/offer";

const slides: { src: string; alt: string }[] = [
  {
    src: "/images/hero.jpg",
    alt: "The white Latte Camera beside a latte with a cocoa Christmas tree on the foam. A little love in every cup.",
  },
  {
    src: "/images/shot-press.jpg",
    alt: "A hand pressing the Latte Camera over a latte, dusting a cocoa Christmas tree onto the foam.",
  },
  {
    src: "/images/shot-designs.jpg",
    alt: "Four lattes with cocoa designs — a tree, Santa, a heart, and a star — beside matching stencil cards. Example designs; the cards in the box vary.",
  },
  {
    src: "/images/shot-cards.jpg",
    alt: "The white Latte Camera beside four reusable stencil cards. Example designs; the four cards in the box vary.",
  },
  {
    src: "/images/shot-steps.jpg",
    alt: "Three frames: a stencil card sliding in, the press dusting a tree onto foam, and the finished latte.",
  },
  {
    src: "/images/shot-serve.jpg",
    alt: "The Latte Camera on a holiday table with three designed lattes, while friends take a photo.",
  },
  {
    src: "/images/mornings.jpg",
    alt: "A couple toasting lattes, one with a cocoa tree and one with a heart, beside the Latte Camera. Make mornings your thing.",
  },
  {
    src: "/images/shot-gift.jpg",
    alt: "A couple lifting the Latte Camera out of a gift box. The lattes show example designs; included cards vary.",
  },
  {
    src: "/images/shot-before.jpg",
    alt: "Two lattes side by side, one plain and one with a cocoa Christmas tree, with the Latte Camera in front.",
  },
];

const packs: {
  tier: Tier;
  name: string;
  badge?: string;
  dark?: boolean;
  bonuses: { title: string; note?: string; valued?: boolean }[];
}[] = [
  { tier: 1, name: "Buy 1", bonuses: [] },
  {
    tier: 2,
    name: "Buy 2",
    badge: "Most Popular",
    bonuses: [
      {
        title: "FREE cocoa & cinnamon refill kit",
        note: "The gift pair: one for them, one for you.",
      },
    ],
  },
  {
    tier: 3,
    name: "Buy 3",
    badge: "Best Value — Buy 2 Get 1 Half Off",
    dark: true,
    bonuses: [
      { title: "FREE cocoa & cinnamon refill kit" },
      { title: "FREE milk frother wand", valued: true },
    ],
  },
];

function perPress(tier: Tier) {
  return Math.round(PRICE.tier[tier] / tier);
}

type MarkName = "lens" | "drop" | "gift" | "cards" | "check" | "power" | "jar" | "wand" | "lock" | "left" | "right" | "bag" | "shield" | "truck" | "warranty";

function Mark({ name }: { name: MarkName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "lens":
      return (
        <svg {...common}>
          <path d="M4 8h4l1.5-2h5L16 8h4v10H4z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3c2.5 3.2 5 5.4 5 8.2a5 5 0 0 1-10 0C7 8.4 9.5 6.2 12 3z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="12" rx="1.5" />
          <path d="M3 12h18M12 8v12M12 8c-2-3-5-3-5 0h5M12 8c2-3 5-3 5 0h-5" />
        </svg>
      );
    case "cards":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="12" height="16" rx="1.5" />
          <path d="M5 7v13h11" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.4 2.4 4.6-5" />
        </svg>
      );
    case "power":
      return (
        <svg {...common}>
          <path d="M12 3v6" />
          <path d="M8 5.5a7 7 0 1 0 8 0" />
        </svg>
      );
    case "jar":
      return (
        <svg {...common}>
          <path d="M8 10h8l-1 9H9z" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2M8 13h8" />
        </svg>
      );
    case "wand":
      return (
        <svg {...common}>
          <path d="M12 3v8" />
          <circle cx="12" cy="14.5" r="3.2" />
          <path d="M9.2 16.5 8 20M12 17.7V21M14.8 16.5 16 20" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="6" y="11" width="12" height="8" rx="1.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "left":
      return (
        <svg {...common}>
          <path d="M15 6 9 12l6 6" />
        </svg>
      );
    case "right":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l-1 12H7z" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 4 3 6.2 7 8 4-1.8 7-4 7-8V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" />
          <circle cx="7" cy="17.5" r="1.5" />
          <circle cx="17" cy="17.5" r="1.5" />
        </svg>
      );
    case "warranty":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 1.5" />
        </svg>
      );
    default: {
      const exhaustive: never = name;
      return exhaustive;
    }
  }
}

function PackArt({ tier, color }: { tier: Tier; color: PressColor }) {
  const src = `/images/press-${color.toLowerCase()}.png`;
  return (
    <span className={`pack-art n${tier}`} aria-hidden="true">
      {Array.from({ length: tier }, (_, index) => (
        <Image key={index} src={src} alt="" width={96} height={92} />
      ))}
    </span>
  );
}

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
  const refillOn = offer.tier >= 2;
  const frotherOn = offer.tier === 3;
  const cutout = `/images/press-${offer.color.toLowerCase()}.png`;
  const shown = colorShot
    ? {
        src: `/images/press-${colorShot.toLowerCase()}.png`,
        alt: `The Latte Camera in ${colorShot}. A mechanical stencil press with a gold lens ring, a silver dial, and a card slot.`,
      }
    : current;
  const showColor = (name: PressColor) => {
    offer.setColor(name);
    setColorShot(name);
  };

  return (
    <div className="store">
      <div className="announce">
        <span className="ann-full">Free shipping on every order · 30-day money-back guarantee</span>
        <span className="ann-short">Free shipping · 30-day guarantee</span>
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

            <div className="info">
              <div className="eyebrow">The Latte Camera</div>
              {angle === "gift" ? (
                <>
                  <p className="brand-line">Your coffee. With a little personality.</p>
                  <h1>For the coffee lover who has everything.</h1>
                  <p className="pitch">
                    Turn their morning latte into a little surprise. Add cocoa or cinnamon, slide in a stencil, and press to decorate the foam — no barista skills needed.
                  </p>
                </>
              ) : (
                <>
                  <h1>Your coffee. With a little personality.</h1>
                  <p className="pitch">
                    Add cocoa or cinnamon, slide in a stencil, and press once. A café-style design lands on the foam — no barista skills needed.
                  </p>
                </>
              )}
              <ul className="callouts">
                <li><Mark name="lens" />Latte art in one press</li>
                <li><Mark name="check" />No barista skills needed</li>
                <li><Mark name="cards" />Reusable stencil cards</li>
                <li><Mark name="power" />No batteries or charging</li>
              </ul>

              <div className="choose">Color<span>Same price</span></div>
              <div className="swatches" role="group" aria-label="Press color">
                {colors.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={offer.color === name}
                    onClick={() => showColor(name)}
                  >
                    <i style={{ background: SWATCH[name] }} />
                    {name}
                  </button>
                ))}
              </div>

              <div className="choose">Choose a pack<span>Free shipping</span></div>
              <div className="packs" role="radiogroup" aria-label="Pack">
                {packs.map((pack) => {
                  const selected = offer.tier === pack.tier;
                  return (
                    <button
                      key={pack.tier}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`pack${selected ? " on" : ""}${pack.badge ? " has-badge" : ""}`}
                      onClick={() => offer.setTier(pack.tier)}
                    >
                      {pack.badge ? <span className={`badge${pack.dark ? " dark" : ""}`}>{pack.badge}</span> : null}
                      <span className="pack-main">
                        <PackArt tier={pack.tier} color={offer.color} />
                        <span className="nm">
                          <strong>{pack.name}</strong>
                          <span className="each">{money(perPress(pack.tier))} per press</span>
                        </span>
                        <span className="pr">
                          <b>{money(PRICE.tier[pack.tier])}</b>
                          {pack.tier === 1 ? <s>{money(PRICE.compareTier1)}</s> : null}
                        </span>
                      </span>
                      {selected && pack.bonuses.length > 0 ? (
                        <span className="pack-extra">
                          {pack.bonuses.map((bonus) => (
                            <span className="bonus" key={bonus.title}>
                              <Mark name="check" />
                              <span>
                                <b>
                                  {bonus.title}
                                  {bonus.valued ? ` (${money(PRICE.frother)} value)` : ""}
                                </b>
                                {bonus.note ? <small>{bonus.note}</small> : null}
                              </span>
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="gifts">
                <strong>Gifts unlocked</strong>
                <div className="gift-row">
                  {(
                    [
                      { name: "ship" as const, icon: "truck" as const, label: "FREE Shipping", on: true, value: null },
                      { name: "refill" as const, icon: "jar" as const, label: "FREE Refill kit", on: refillOn, value: null },
                      { name: "frother" as const, icon: "wand" as const, label: "FREE Frother wand", on: frotherOn, value: PRICE.frother },
                    ] as const
                  ).map((gift, index) => (
                    <span className="gift-slot" key={gift.name}>
                      {index > 0 ? <span className="plus" aria-hidden="true">+</span> : null}
                      <span className={`gift-item${gift.on ? "" : " locked"}`}>
                        <span className="ic"><Mark name={gift.icon} /></span>
                        <span className="gift-copy" key={gift.on ? "open" : "shut"}>
                          {gift.on ? (
                            <>
                              {gift.value ? <s>{money(gift.value)}</s> : null}
                              <b>{gift.label}</b>
                            </>
                          ) : (
                            <small><Mark name="lock" /> Locked</small>
                          )}
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {offer.tier === 3 ? null : (
                <div className={`addon${offer.frother ? " on" : ""}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={offer.frother}
                      onChange={(event) => offer.setFrother(event.target.checked)}
                    />
                    <span>
                      <b>Milk Frother Wand · {money(PRICE.frother)}</b>
                      <small>No foam, no canvas. The frother that makes the perfect surface for your design.</small>
                    </span>
                  </label>
                </div>
              )}

              <p className="eta">
                <span className="dot" aria-hidden="true" />
                Order today · Ships in 2-5 business days
              </p>
              <button ref={ctaRef} className="btn cart-cta" type="button" id="buy-now" onClick={checkout.buy} disabled={checkout.status === "loading"}>
                <span>{checkout.status === "loading" ? "Opening…" : "Buy now"}</span>
                <span className="cta-price">
                  {offer.tier === 1 && !offer.paidFrother && !offer.messageCard ? <s>{money(PRICE.compareTier1)}</s> : null}
                  <b>{money(offer.totalCents)}</b>
                </span>
                <span className="cta-arrow" aria-hidden="true">→</span>
              </button>
              <p className="ship-note">Secure checkout by Stripe</p>

              <div className="assure">
                <div><Mark name="shield" /><span>30-day guarantee<small>Money back</small></span></div>
                <div><Mark name="truck" /><span>Free shipping<small>Every tier</small></span></div>
                <div><Mark name="warranty" /><span>1-year warranty<small>On the press</small></span></div>
              </div>

              <div className="payments">
                <span className="lbl">Secure checkout</span>
                <PayMarks />
              </div>

              <div className="acc">
                <details>
                  <summary><span>Is it a photo printer?</span></summary>
                  <div className="body">
                    <p>No. The Latte Camera is a fully mechanical stencil press. It does not print photos. There is nothing to upload, and nothing to charge.</p>
                  </div>
                </details>
                <details>
                  <summary><span>What drinks does it work on?</span></summary>
                  <div className="body">
                    <p>Lattes, cappuccinos, hot chocolate, matcha — anything with a smooth foam top.</p>
                  </div>
                </details>
                <details>
                  <summary><span>Shipping</span></summary>
                  <div className="body">
                    <p>Free shipping on every order. Ships in 2-5 business days. <Link href="/shipping">Shipping policy</Link></p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits">
          <div className="wrap">
            <ul>
              <li><span className="ic">1</span><span>One press<small>Latte art</small></span></li>
              <li><span className="ic">✓</span><span>No barista skills<small>Press and done</small></span></li>
              <li><span className="ic">4</span><span>Reusable cards<small>Slide them back in</small></span></li>
              <li><span className="ic">○</span><span>No batteries<small>Nothing to charge</small></span></li>
            </ul>
          </div>
        </section>

        <section className="sec" id="how">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">How it works</div>
              <h2>Scoop, slide, press.</h2>
              <p>Cinnamon or cocoa. One stencil card. One press on the foam.</p>
            </div>
            <div className="clips">
              <figure>
                <Image unoptimized src="/images/scoop-cinnamon.gif" alt="A spoon scooping cinnamon from a jar." width={135} height={240} />
                <figcaption>Scoop the cinnamon</figcaption>
              </figure>
              <figure>
                <Image unoptimized src="/images/slide-card.gif" alt="A stencil card sliding into the Latte Camera." width={135} height={240} />
                <figcaption>Slide in a card</figcaption>
              </figure>
              <figure className="result">
                <Image src="/images/how-result.jpg" alt="Two finished lattes, one dusted HO HO and one dusted with a Christmas tree. Example designs; included cards vary." width={768} height={768} />
                <figcaption>On the foam</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="sec tint" id="box">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">What’s included</div>
              <h2>One press. Four cards you can use again.</h2>
              <p>Every box is 1 Latte Camera and 4 reusable stencil cards. Designs vary, and you don’t choose which four.</p>
            </div>
            <div className="box-list">
              <div className="box-row"><span className="num-pill">1</span><span><b>1 Latte Camera</b>Fully mechanical. Nothing to charge.</span></div>
              <div className="box-row"><span className="num-pill">4</span><span><b>4 reusable stencil cards</b>Slide one in, press, and use it again.</span></div>
            </div>
          </div>
        </section>

        <section className="sec" id="gift">
          <div className="wrap">
            <div className="sec-head">
              <p className="script">For you,</p>
              <h2>For the person who has every coffee gadget already</h2>
              <p>Not another mug for the drawer. Same coffee, with a little personality on the foam.</p>
              <p>Add cocoa or cinnamon, slide in a card, and press. Their next latte looks like they meant it.</p>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="guarantee">
              <div className="seal"><span>30-day</span><b>100%</b><span>Money back</span></div>
              <h2>Try the morning for 30 days.</h2>
              <p>30-day money-back guarantee. Free shipping every tier. 1-year warranty on the press.</p>
              <a className="btn inline light" href="#shop">Back to the packs</a>
            </div>
          </div>
        </section>

        <section className="sec tint" id="faq">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">FAQ</div>
              <h2>Straight answers, before you wrap the box.</h2>
            </div>
            <div className="acc faq">
              <details open>
                <summary><span>Is it a photo printer?</span></summary>
                <div className="body"><p>No. It is a fully mechanical stencil press. It does not print photos.</p></div>
              </details>
              <details>
                <summary><span>How many cards are in the box?</span></summary>
                <div className="body"><p>Each box includes 4 reusable stencil cards. Designs vary, and you don’t choose which four.</p></div>
              </details>
              <details>
                <summary><span>Does it need a battery?</span></summary>
                <div className="body"><p>No. No battery, no electronics, nothing to charge.</p></div>
              </details>
              <details>
                <summary><span>What drinks does it work on?</span></summary>
                <div className="body"><p>Lattes, cappuccinos, hot chocolate, matcha — anything with a smooth foam top. A flat coffee has no canvas.</p></div>
              </details>
              <details>
                <summary><span>How long does shipping take?</span></summary>
                <div className="body"><p>Free on every order. Ships in 2-5 business days.</p></div>
              </details>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />

      <div className={`sticky${sticky ? " show" : ""}`} aria-hidden={!sticky}>
        <div className="row">
          <Image className="press" src={cutout} alt="" width={104} height={100} />
          <button type="button" className="btn" onClick={checkout.buy} disabled={checkout.status === "loading"} tabIndex={sticky ? 0 : -1}>
            <span>{checkout.status === "loading" ? "Opening…" : "Buy now"}</span>
            <span className="cta-price">
              <b>{money(offer.totalCents)}</b>
            </span>
            <span className="cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className={`toast${checkout.error ? " show" : ""}`} role="status">{checkout.error}</div>
    </div>
  );
}
