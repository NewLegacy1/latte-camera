"use client";

import type { RefObject } from "react";
import { LatteBuyCta } from "@/components/latte-buy-cta";
import { packs } from "@/components/latte-data";
import { Mark, PackArt } from "@/components/latte-marks";
import { useOffer } from "@/components/offer-provider";
import { PRICE, colors, money, packCompareCents, packSaveCents, type PressColor } from "@/lib/offer";

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
  const refillOn = offer.tier >= 2;
  const frotherOn = offer.tier === 3;
  const giftsTitle = offer.tier === 1 ? "Included with your pack" : "Gifts unlocked";

  return (
            <div className="info">
              <div className="trust-eyebrow" aria-label="Loved by 1400+ coffee enthusiasts">
                <span className="trust-stars" aria-hidden="true">★★★★★</span>
                <span>Loved by 1400+ Coffee Enthusiasts</span>
              </div>
              {angle === "gift" ? (
                <>
                  <h1>For the person who already has the coffee setup.</h1>
                  <p className="pitch">
                    The machine. The grinder. The favorite mug. Give them something new to do with all three — add cocoa or cinnamon, slide in a stencil card, and press to finish the foam with a little art.
                  </p>
                </>
              ) : (
                <>
                  <h1>
                    The Latte Camera<span className="tm" aria-label="trademark">™</span> + 4 Stencil Set
                  </h1>
                  <p className="pitch">
                    Turn a foamy coffee into something worth bringing to the table. Add cocoa or cinnamon, slide in a stencil card, and press to finish your drink with a little art.
                  </p>
                  <p className="pitch soft">One press. About two seconds. Your favorite cup.</p>
                </>
              )}
              <ul className="callouts">
                <li><Mark name="lens" />Designs in one press</li>
                <li><Mark name="cards" />4 reusable stencil cards included</li>
                <li><Mark name="drop" />Works with cocoa or cinnamon</li>
                <li><Mark name="power" />Fully mechanical—no charging</li>
              </ul>
              <p className="cards-pill" role="note">
                <Mark name="cards" />
                <span>Every pack includes <b>4 reusable stencil cards</b> — designs vary by box</span>
              </p>

              <div className="choose">Choose a pack<span>Free shipping</span></div>
              <div className="packs" role="radiogroup" aria-label="Pack">
                {packs.map((pack) => {
                  const selected = offer.tier === pack.tier;
                  const cameras = pack.tier === 1 ? "1 Latte Camera" : `${pack.tier} Latte Cameras`;
                  return (
                    <div
                      key={pack.tier}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      className={`pack${selected ? " on" : ""}${pack.badge ? " has-badge" : ""}`}
                      onClick={() => offer.setTier(pack.tier)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          offer.setTier(pack.tier);
                        }
                      }}
                    >
                      {pack.badge ? <span className={`badge${pack.dark ? " dark" : ""}`}>{pack.badge}</span> : null}
                      <div className="pack-main">
                        <PackArt tier={pack.tier} color={offer.color} />
                        <span className="nm">
                          <strong>{pack.name}</strong>
                          <span className="each">
                            {money(PRICE.tier[pack.tier])} · {pack.tier === 1 ? "1 Latte Camera" : `${money(Math.round(PRICE.tier[pack.tier] / pack.tier))} each`}
                          </span>
                          <span className="support">{pack.support}</span>
                          <span className="pack-cards">+ 4 reusable stencil cards with every camera</span>
                        </span>
                        <span className="pr">
                          <b>{money(PRICE.tier[pack.tier])}</b>
                          {pack.tier === 1 ? <s>{money(packCompareCents(1))}</s> : <em className="save">Save {money(packSaveCents(pack.tier))}</em>}
                        </span>
                      </div>
                      <div className="pack-includes">
                        <Mark name="check" />
                        <span>
                          <b>{cameras}</b>
                          <small>Each includes 4 reusable stencil cards</small>
                        </span>
                      </div>
                      {pack.bonuses.length > 0 ? (
                        <div className="pack-extra">
                          {pack.bonuses.map((bonus) => (
                            <span className="bonus" key={bonus.title}>
                              <Mark name="check" />
                              <span>
                                <b>{bonus.title}</b>
                                {bonus.note ? <small>{bonus.note}</small> : null}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {selected ? (
                        <div
                          className="pack-colors"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <div className="pack-color-label">Color</div>
                          {Array.from({ length: pack.tier }, (_, index) => {
                            const unitColor = offer.unitColors[index] ?? offer.color;
                            return (
                              <label className="pack-color-row" key={`${pack.tier}-${index}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element -- tiny color preview thumb */}
                                <img
                                  className="pack-color-thumb"
                                  src={`/images/press-${unitColor.toLowerCase()}.png`}
                                  alt=""
                                  width={44}
                                  height={44}
                                />
                                <select
                                  aria-label={`Camera ${index + 1} color`}
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
                              </label>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className={`gifts${offer.tier > 1 ? " open" : ""}`}>
                <strong>{giftsTitle}</strong>
                <p className="gifts-lead">
                  {offer.tier === 3
                    ? "Your three-pack includes"
                    : offer.tier === 2
                      ? "Your two-pack includes"
                      : "Add a multi-pack to unlock the refill kit and frother."}
                </p>
                <div className="gift-row">
                  <span className={`gift-card${refillOn ? "" : " locked"}`}>
                    <span className="gift-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element -- gift still */}
                      <img src={"/images/gift-refill.jpg"} alt="Dear Latte cocoa and cinnamon refill pouches" />
                      {!refillOn ? <span className="gift-lock"><Mark name="lock" /> Locked</span> : null}
                    </span>
                    <span className="gift-meta">
                      <b>Cocoa & cinnamon refill kit</b>
                      <small>{refillOn ? "Included free" : "Unlocks with Buy 2+"}</small>
                    </span>
                  </span>
                  <span className={`gift-card${frotherOn ? "" : " locked"}`}>
                    <span className="gift-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element -- gift still */}
                      <img src={"/images/gift-frother.jpg"} alt="Handheld milk frother wand" />
                      {!frotherOn ? <span className="gift-lock"><Mark name="lock" /> Locked</span> : null}
                    </span>
                    <span className="gift-meta">
                      <b>Milk frother wand</b>
                      <small>{frotherOn ? `Included free · ${money(PRICE.frother)} value` : "Unlocks with the gifting set"}</small>
                    </span>
                  </span>
                  <span className="gift-card on-ship">
                    <span className="gift-photo ship">
                      <Mark name="truck" />
                    </span>
                    <span className="gift-meta">
                      <b>Free shipping</b>
                      <small>On your entire order</small>
                    </span>
                  </span>
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

              <LatteBuyCta ctaRef={ctaRef} />
            </div>
  );
}
