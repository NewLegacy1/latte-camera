"use client";

import Image from "next/image";
import { moments } from "@/components/latte-data";
import { LatteStoryLower } from "@/components/latte-story-lower";
import { useOffer } from "@/components/offer-provider";
import { PRICE, money, packSaveCents } from "@/lib/offer";

export function LatteStory() {
  const offer = useOffer();
  return (
    <>
        <section className="benefits">
          <div className="wrap">
            <ul>
              <li><span>One-press designs</span></li>
              <li><span>Four reusable cards</span></li>
              <li><span>Cocoa or cinnamon</span></li>
              <li><span>No charging</span></li>
            </ul>
          </div>
        </section>

        <section className="sec" id="how">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">How it works</div>
              <h2>Scoop. Slide. Press.</h2>
              <p>A little cocoa or cinnamon is all it takes to finish your foam.</p>
            </div>
            <div className="clips">
              <figure>
                <Image unoptimized src="/images/scoop-cinnamon.gif" alt="A spoon scooping cinnamon from a jar." width={135} height={240} />
                <figcaption>
                  <b>Add your powder</b>
                  <small>Fill with cocoa or cinnamon.</small>
                </figcaption>
              </figure>
              <figure>
                <Image unoptimized src="/images/slide-card.gif" alt="A stencil card sliding into the Latte Camera." width={135} height={240} />
                <figcaption>
                  <b>Choose your design</b>
                  <small>Slide a reusable stencil card into place.</small>
                </figcaption>
              </figure>
              <figure className="result">
                <Image src="/images/how-result.jpg" alt="Two finished lattes with cocoa designs. Example designs; included cards vary." width={768} height={768} />
                <figcaption>
                  <b>Press and reveal</b>
                  <small>Hold over the foam and press to add your design.</small>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="sec tint" id="moments">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">Every cup</div>
              <h2>A different little moment in every cup.</h2>
              <p>Your first coffee. Something sweet after dinner. A cup made for someone else. Pick a design that suits the moment.</p>
            </div>
            <div className="moments">
              {moments.map((moment) => (
                <figure key={moment.caption}>
                  <div className="ph">
                    <Image src={moment.src} alt={moment.alt} fill sizes="(min-width: 900px) 320px, 80vw" />
                  </div>
                  <figcaption>{moment.caption}</figcaption>
                </figure>
              ))}
            </div>
            <p className="fine-center">Photos show example designs. The four stencil cards in your box vary and cannot be selected individually.</p>
          </div>
        </section>

        <section className="sec" id="box">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">What’s included</div>
              <h2>Your first four designs start here.</h2>
              <p>Every box includes a Latte Camera and four reusable stencil cards, ready for your next coffee.</p>
            </div>
            <div className="box-list">
              <div className="box-row"><span className="num-pill">1</span><span><b>1 Latte Camera</b>A fully mechanical stencil press.</span></div>
              <div className="box-row"><span className="num-pill">4</span><span><b>4 reusable stencil cards</b>Choose a card, make your design, and use it again.</span></div>
            </div>
            <p className="fine-center">Stencil designs vary by box and cannot be selected individually.</p>
          </div>
        </section>

        <section className="sec tint" id="pair">
          <div className="wrap pair">
            <div className="pair-art" aria-hidden="true">
              <Image src="/images/press-black.png" alt="" width={160} height={150} />
              <Image src="/images/press-white.png" alt="" width={160} height={150} />
            </div>
            <div className="sec-head">
              <div className="eyebrow">Keep one</div>
              <h2>You’ll want to keep one.</h2>
              <p>That’s the trouble with finding a good coffee gift.</p>
              <p>Choose the two-pack, keep one for your own kitchen, and give the other to the person you thought of first.</p>
              <p className="pair-price">
                <b>Two Latte Cameras · {money(PRICE.tier[2])}</b>
                <span>{money(5000)} each · Save {money(packSaveCents(2))} compared with two singles</span>
              </p>
              <button
                type="button"
                className="btn inline"
                onClick={() => {
                  offer.setTier(2);
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Choose your pair
              </button>
            </div>
          </div>
        </section>


      <LatteStoryLower />
    </>
  );
}
