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
              <h2>Café-quality latte art in seconds.</h2>
              <p>Five quick steps from stencil to foam.</p>
            </div>
            <ol className="how-steps">
              <li><b>Step 1</b><span>Slide a stencil card into the bottom slot.</span></li>
              <li><b>Step 2</b><span>Place DearLatte on top of your cup — it sits right on the rim.</span></li>
              <li><b>Step 3</b><span>Press the gold button on top.</span></li>
              <li><b>Step 4</b><span>DearLatte drops powder (cinnamon, cocoa, matcha — your choice) through the stencil onto the foam.</span></li>
              <li><b>Step 5</b><span>Lift and enjoy your café-quality latte art in seconds.</span></li>
            </ol>
            <div className="clips">
              <figure>
                <Image unoptimized src="/images/scoop-cinnamon.gif" alt="A spoon scooping cinnamon from a jar." width={135} height={240} />
                <figcaption>
                  <b>Add your powder</b>
                  <small>Cocoa, cinnamon, or matcha.</small>
                </figcaption>
              </figure>
              <figure>
                <Image unoptimized src="/images/slide-card.gif" alt="A stencil card sliding into the Latte Camera." width={135} height={240} />
                <figcaption>
                  <b>Slide your stencil</b>
                  <small>Card goes in the bottom slot.</small>
                </figcaption>
              </figure>
              <figure className="result">
                <Image src="/images/how-result.jpg" alt="Two finished lattes with cocoa designs. Example designs; included cards vary." width={768} height={768} />
                <figcaption>
                  <b>Press and reveal</b>
                  <small>Hold on the rim and press the gold button.</small>
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
              <p>Every box is ready for your next coffee.</p>
            </div>
            <div className="box-list">
              <div className="box-row"><span className="num-pill">1×</span><span><b>DearLatte Latte Art Printer</b>A fully mechanical stencil press.</span></div>
              <div className="box-row"><span className="num-pill">1×</span><span><b>Stencil Starter Pack (4 Stencils)</b>Reusable cards — designs vary by box.</span></div>
            </div>
            <p className="fine-center">Stencil designs vary by box and cannot be selected individually.</p>
          </div>
        </section>

        <section className="sec tint" id="shipping">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">Shipping & Returns</div>
              <h2>Free shipping. Easy returns.</h2>
              <p>Dispatches in 2–5 business days. 30-day money-back guarantee on every order.</p>
            </div>
          </div>
        </section>

        <section className="sec" id="pair">
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
