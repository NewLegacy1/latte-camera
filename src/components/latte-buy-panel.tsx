"use client";

import type { RefObject } from "react";
import { LatteBuyCta } from "@/components/latte-buy-cta";
import { packs } from "@/components/latte-data";
import { useOffer } from "@/components/offer-provider";
import { PRICE, SWATCH, colors, money, packSaveCents, type PressColor } from "@/lib/offer";

export function LatteBuyPanel({
  angle,
  ctaRef,
  onShowColor,
}: {
  angle: "home" | "gift";
  ctaRef: RefObject<HTMLButtonElement | null>;
  onShowColor: (name: PressColor) => void;
}) {
  const offer = useOffer();

  return (
    <div className="info">
      <div className="trust-eyebrow" aria-label="Loved by 1400+ coffee enthusiasts">
        <span className="trust-stars" aria-hidden="true">★★★★★</span>
        <span>Loved by 1400+ Coffee Enthusiasts</span>
      </div>
      {angle === "gift" ? (
        <>
          <div className="eyebrow">The Latte Camera</div>
          <h1>For the person who already has the coffee setup.</h1>
          <p className="pitch">
            The machine. The grinder. The favorite mug. Give them something new to do with all three.
          </p>
        </>
      ) : (
        <>
          <h1>
            The Latte Camera<span className="tm" aria-label="trademark">™</span>
            {" + 4 Stencil Set"}
          </h1>
          <p className="pitch">Add cocoa or cinnamon, slide in a stencil card, and press to decorate the foam.</p>
        </>
      )}

      <ul className="benefit-grid" aria-label="Product benefits">
        <li>Designs in one press</li>
        <li>4 reusable cards per camera</li>
        <li>Cocoa or cinnamon</li>
        <li>No batteries or charging</li>
      </ul>

      <div className="choose">Choose your color</div>
      <div className="swatches" role="group" aria-label="Press color">
        {colors.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={offer.color === name}
            onClick={() => {
              offer.setColor(name);
              onShowColor(name);
            }}
          >
            <i style={{ background: SWATCH[name] }} />
            {name}
          </button>
        ))}
      </div>

      <div className="choose">
        Choose your set
        <span>Free shipping on every order</span>
      </div>
      <div className="packs compact" role="radiogroup" aria-label="Pack">
        {packs.map((pack) => {
          const selected = offer.tier === pack.tier;
          const each = Math.round(PRICE.tier[pack.tier] / pack.tier);
          return (
            <div key={pack.tier} className={`pack-option${selected ? " on" : ""}`}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className={`pack compact${selected ? " on" : ""}${pack.badge ? " has-badge" : ""}`}
                onClick={() => offer.setTier(pack.tier)}
              >
                {pack.badge ? <span className="badge">{pack.badge}</span> : null}
                {/* eslint-disable-next-line @next/next/no-img-element -- compact pack thumb */}
                <img
                  className="pack-thumb"
                  src={`/images/press-${offer.color.toLowerCase()}.png`}
                  alt=""
                  width={48}
                  height={48}
                />
                <span className="nm">
                  <strong>{pack.name}</strong>
                  <span className="each">{pack.line}</span>
                  {pack.tier > 1 ? (
                    <span className="support">
                      {money(each)} each · Save {money(packSaveCents(pack.tier))}
                    </span>
                  ) : null}
                  {pack.include ? <span className="pack-include">{pack.include}</span> : null}
                </span>
                <span className="pr">
                  <b>{money(PRICE.tier[pack.tier])}</b>
                </span>
              </button>

              {selected && pack.tier > 1 ? (
                <div className="pack-colors" aria-label={`Color for each camera in ${pack.name}`}>
                  <div className="pack-color-label">Color</div>
                  {offer.unitColors.map((unitColor, index) => (
                    <div className="pack-color-row" key={`unit-${pack.tier}-${index}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- per-unit color preview */}
                      <img
                        className="pack-color-thumb"
                        src={`/images/press-${unitColor.toLowerCase()}.png`}
                        alt=""
                        width={44}
                        height={44}
                      />
                      <label className="sr-only" htmlFor={`unit-color-${pack.tier}-${index}`}>
                        Camera {index + 1} color
                      </label>
                      <select
                        id={`unit-color-${pack.tier}-${index}`}
                        value={unitColor}
                        onChange={(event) => {
                          const next = event.target.value as PressColor;
                          offer.setUnitColor(index, next);
                          onShowColor(next);
                        }}
                      >
                        {colors.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {offer.tier > 1 ? (
        <div className="included-set">
          <strong>Included with your set</strong>
          <ul>
            <li>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/gift-refill.jpg" alt="" width={44} height={44} />
              <span>
                <b>Cocoa & cinnamon refill kit</b>
                <small>Included free</small>
              </span>
            </li>
            {offer.tier === 3 ? (
              <li>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/gift-frother.jpg" alt="" width={44} height={44} />
                <span>
                  <b>Milk frother</b>
                  <small>Included free</small>
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {offer.tier === 3 ? null : (
        <label className={`addon-slim${offer.frother ? " on" : ""}`}>
          <input
            type="checkbox"
            checked={offer.frother}
            onChange={(event) => offer.setFrother(event.target.checked)}
          />
          <span>Add a milk frother · {money(PRICE.frother)}</span>
        </label>
      )}

      <LatteBuyCta ctaRef={ctaRef} />
    </div>
  );
}
