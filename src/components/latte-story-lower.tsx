"use client";

import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/latte-marks";

export function LatteStoryLower() {
  return (
    <>
        <section className="sec" id="gift">
          <div className="wrap gift-split">
            <div className="gift-visual">
              <Image src="/images/shot-gift.jpg" alt="A couple lifting the Latte Camera out of a gift box. Example designs; included cards vary." width={900} height={900} />
            </div>
            <div className="sec-head left">
              <div className="eyebrow">Gifting</div>
              <h2>For the person who already has the coffee setup.</h2>
              <p>The machine. The grinder. The favorite mug.</p>
              <p>Give them something new to do with all three.</p>
              <p>The Latte Camera adds a little creativity to the coffee they already love. Picture them opening it—then offering to make everyone a latte.</p>
              <a className="btn inline" href="#shop">Choose a gift</a>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="guarantee quiet">
              <h2>Make room for a little morning joy.</h2>
              <p>
                Your order comes with a 30-day money-back guarantee, free shipping, and a one-year warranty on the press.{" "}
                <Link href="/refund">Read the return terms</Link>.
              </p>
              <a className="btn inline light" href="#shop">Choose your Latte Camera</a>
            </div>
          </div>
        </section>

        <section className="sec" id="faq">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">FAQ</div>
              <h2>A few things before your first press.</h2>
            </div>
            <div className="acc faq">
              <details open>
                <summary><span>Is it a photo printer?</span></summary>
                <div className="body"><p>No. The Latte Camera makes designs using reusable stencil cards and cocoa or cinnamon. It’s fully mechanical, with no app, ink, or charging.</p></div>
              </details>
              <details>
                <summary><span>Are cocoa and cinnamon included?</span></summary>
                <div className="body">
                  <p>
                    The One for you pack is the Latte Camera and four stencil cards. The cocoa & cinnamon refill kit is included free with One to keep. One to give. and The gifting set. Powder is not packed inside the camera itself.
                  </p>
                </div>
              </details>
              <details>
                <summary><span>Can I choose my stencil designs?</span></summary>
                <div className="body"><p>Each box includes 4 reusable stencil cards. Designs vary by box and cannot be selected individually. Photos on this page show example designs.</p></div>
              </details>
              <details>
                <summary><span>Can I choose different colors in a multipack?</span></summary>
                <div className="body"><p>Every camera in your pack ships in the color you select above. Choose Black, White, or Green before checkout.</p></div>
              </details>
              <details>
                <summary><span>Does it need a battery?</span></summary>
                <div className="body"><p>No. No battery, no electronics, nothing to charge.</p></div>
              </details>
              <details>
                <summary><span>What drinks does it work on?</span></summary>
                <div className="body"><p>Lattes, cappuccinos, and other foamy drinks with a smooth foam top. A flat coffee has no canvas.</p></div>
              </details>
              <details>
                <summary><span>How do I clean the press and cards?</span></summary>
                <div className="body"><p>Follow the care card in your box. In short: brush or wipe away leftover powder, and keep the press and cards dry—do not soak them or run them through a dishwasher.</p></div>
              </details>
              <details>
                <summary><span>What does the one-year warranty cover?</span></summary>
                <div className="body"><p>The Latte Camera press is covered for manufacturing defects for one year from delivery. See your order email for how to start a warranty request.</p></div>
              </details>
              <details>
                <summary><span>How long does shipping take?</span></summary>
                <div className="body"><p>Free on every order. Dispatches in 2–5 business days. <Link href="/shipping">Shipping information</Link> has delivery estimates.</p></div>
              </details>
            </div>
          </div>
        </section>


    </>
  );
}
