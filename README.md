# DearLatte storefront

Use Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000. The static production build runs with `npm run build` and writes to `out/`. Serve that directory with any static web host.

- Edit preview prices, gifts, gallery data, and policy copy in `app/catalog.ts`. The offline preview uses CAD. The hosted build can load Shopify Markets pricing for the shopper's selected shipping country.
- Copy `.env.example` to `.env.local` and set the public Storefront API token. Publish the Duo and Trio products to the Headless sales channel so Shopify can supply their variant IDs and prices. Keep all private credentials out of the storefront.
- The current campaign ends at midnight Eastern after November 20, 2026. The dispatch line rolls over at Toronto midnight. Adjust the campaign date in `app/offer-clock.ts` for future offers.



- The ZIP also includes a standalone HTML preview. Open it in a browser to try the product configurator and bag without installation.

## Shopify checkout

The storefront creates a Shopify cart with the selected market, bundle variants, colours, and quantities, then opens the checkout URL returned by Shopify. Shopify controls payment, taxes, delivery rates, and order creation.

Before launch, check the Single, Duo, and Trio through Shopify checkout. Confirm both bundle products include the promised gift components and that Shopify applies free standard shipping to the Duo and Trio in each offered market.
