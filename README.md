# Dear Latte — The Latte Camera

A headless storefront for The Latte Camera, a fully mechanical stencil press. Shopify is the system of record for the catalog, checkout, orders, and fulfillment. This site never charges a card.

The page layout follows the Roofroof product-page pattern: announcement bar, centered wordmark, square gallery, pack cards, an unlock grid, a sticky buy bar, and a dark footer. Colors, type, and the offer stay Dear Latte.

Tagline: A little love in every cup.

## Run it

```bash
npm install
npm run dev -- --port 43123 --hostname 0.0.0.0
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Copy `.env.example` to `.env.local` and fill in Shopify and Meta when you have them. Without those values the page still renders. Buy now returns a clear message instead of inventing a payment.

## The offer

Colors Black, White, and Green are the same price.

| Pack | Price | Included |
| --- | --- | --- |
| Buy 1 | $60.00 (compare-at $99.95) | The press |
| Buy 2, preselected, Most Popular | $100.00 | The gift pair, plus a free cocoa & cinnamon refill kit |
| Buy 3, Best Value — Buy 2 Get 1 Half Off | $150.00 | Free refill kit and a free milk frother wand |

Free shipping on every tier. Dispatched in 1-3 business days. Arrives in about 5-15 days.

Milk Frother Wand is a $14.95 add-on on Buy 1 and Buy 2. Buy 3 already includes it, so the paid add-on hides. Custom Message Card is $19.95: "Put their name on it."

Every box is 1 press and 4 reusable stencil cards. Designs vary.

## Shopify setup

Create these products and publish them to the Storefront sales channel. The Storefront API charges the variant price. It cannot discount a line, so free gifts have to be $0.00 variants or checkout refuses the cart.

- `dear-latte-stencil-press` — options Pack (`Pack 1`, `Pack 2`, `Pack 3`) and Color (`Black`, `White`, `Green`). Prices: Pack 1 $60.00, Pack 2 $100.00, Pack 3 $150.00. Compare-at $99.95 on Pack 1 only. Buy 3 is labeled Buy 2 Get 1 Half Off.
- `cocoa-cinnamon-refill-kit` — one variant at **$0.00**. Added on Buy 2 and Buy 3.
- `milk-frother-wand` — two variants on the same product: **$14.95** (paid add-on) and **$0.00** (Buy 3 gift). Name the gift variant something like `Gift`.
- `custom-message-card` — **$19.95**. The buyer's words are sent as the cart attribute `gift_message`.

Create a Storefront API token with `unauthenticated_read_product_listings` and `unauthenticated_write_checkouts` (or the cart scopes your API version asks for). Put the token in `SHOPIFY_STOREFRONT_TOKEN`. Do not expose it to the browser.

Buy now posts `{ tier, color, addons }` to `/api/checkout`. The server matches the variant, checks the locked price, adds the gift lines, and returns the Shopify checkout URL.

## Meta

The pixel fires PageView, ViewContent, AddToCart, and InitiateCheckout. Each event has an `event_id` that is also sent to `/api/events` for the Conversions API, so Meta can dedupe. Purchase is never fired here. Turn on Shopify's Meta channel so Purchase comes from checkout only.

`_fbp`, `_fbc`, `fbclid`, and `utm_*` are stored as Shopify cart attributes. Example ad link:

```text
/?utm_source=meta&utm_medium=paid&utm_campaign=cbo&utm_content=latte-camera-buy2
```

## Photographs still needed

The page uses brand-board crops plus diagrams for the three steps. Replace the diagrams when these exist. Keep about 8% safe margin inside rounded frames.

| Shot | Size | Notes |
| --- | --- | --- |
| Press on the cup | 2000×2000 | The camera press sitting on a foam top. Not a photo printer. |
| Fill | 1600×1200 | Spooning cocoa or cinnamon into the press. |
| Slide | 1600×1200 | A stencil card sliding in. |
| Press and lift | 1600×1200 | One press, then the design on the foam. |
| Gift unboxing | 1600×2000 | Kraft, tissue, handwritten-style note. |
| Collection stills | 2000×2000 | Love Notes, Birthday Wishes, Holiday Cheer, Morning Mischief. Caption them as the library, not the contents of one box. |
| Open graph | 1200×630 | Wordmark, press, one foamed cup. |

Do not caption any photo as printing a picture, and do not show a set of 12 cards as what ships.
