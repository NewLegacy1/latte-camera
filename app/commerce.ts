import { bundles, colours, type BundleIndex, type CartItem, type Selection } from "./catalog";

const shop = "mnhkb0-af.myshopify.com";
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const handles = [
  "dear-latte-stencil-press",
  process.env.NEXT_PUBLIC_SHOPIFY_DUO_HANDLE || "latte-camera-duo",
  process.env.NEXT_PUBLIC_SHOPIFY_TRIO_HANDLE || "latte-camera-trio",
];

type Money = { amount: string; currencyCode: string };
type Variant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
};
type Product = { variants: { nodes: Variant[]; pageInfo: { hasNextPage: boolean } } };
export type Country = { isoCode: string; name: string; currency: { isoCode: string } };
export type Market = { country: Country; products: (Product | null)[] };

export const shopifyEnabled = Boolean(token);
const apiVersion = "2026-10";

async function request<T>(query: string, variables: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  if (!token) throw new Error("Shopify pricing is unavailable.");
  const response = await fetch("https://" + shop + "/api/" + apiVersion + "/graphql.json", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!response.ok) throw new Error("Shopify is temporarily unavailable.");
  const result: { data?: T; errors?: { message: string }[] } = await response.json();
  if (!result.data || result.errors?.length) throw new Error("Shopify could not load this request.");
  return result.data;
}

const countryFields = "isoCode name currency { isoCode }";

export async function getCountries(signal: AbortSignal): Promise<Country[]> {
  const data = await request<{ localization: { availableCountries: Country[] } }>(
    "query Countries { localization { availableCountries { " + countryFields + " } } }", {}, signal,
  );
  return data.localization.availableCountries;
}

export function preferredCountry(countries: Country[], saved: string | null, languages: readonly string[]) {
  const available = new Set(countries.map(country => country.isoCode));
  if (saved && available.has(saved)) return saved;
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).region;
      if (region && available.has(region)) return region;
    } catch {}
  }
  return available.has("CA") ? "CA" : countries[0]?.isoCode;
}

export async function getMarket(country: string, signal: AbortSignal): Promise<Market> {
  const data = await request<{
    localization: { country: Country }; single: Product | null; duo: Product | null; trio: Product | null;
  }>(
    `query Assortment($country: CountryCode!, $single: String!, $duo: String!, $trio: String!) @inContext(country: $country) {
      localization { country { ${countryFields} } }
      single: product(handle: $single) { ...BundleVariants }
      duo: product(handle: $duo) { ...BundleVariants }
      trio: product(handle: $trio) { ...BundleVariants }
    }
    fragment BundleVariants on Product {
      variants(first: 100) {
        nodes { id availableForSale selectedOptions { name value } price { amount currencyCode } }
        pageInfo { hasNextPage }
      }
    }`,
    { country, single: handles[0], duo: handles[1], trio: handles[2] }, signal,
  );
  if (data.localization.country.isoCode !== country) throw new Error("This shipping country is unavailable.");
  return { country: data.localization.country, products: [data.single, data.duo, data.trio] };
}

const normalized = (value: string) => value.trim().toLowerCase();
function matchesColour(value: string, colour: Selection["colours"][number]) {
  return [colours[colour].shopify, colours[colour].name].some(name => normalized(name) === normalized(value));
}

export function findVariant(market: Market, selection: Selection): Variant | undefined {
  const product = market.products[selection.bundle];
  if (!product || product.variants.pageInfo.hasNextPage) return;
  return product.variants.nodes.find(variant => {
    const options = variant.selectedOptions.filter(option => /colou?r/i.test(option.name));
    return options.length === selection.colours.length &&
      options.every((option, index) => matchesColour(option.value, selection.colours[index])) &&
      variant.price.currencyCode === market.country.currency.isoCode;
  });
}

export function marketPrice(market: Market | null, selection: Selection): number | null {
  if (!market) return bundles[selection.bundle].price;
  const variant = findVariant(market, selection);
  const amount = Number(variant?.price.amount);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

export function cameraComparison(market: Market | null, selection: Selection): number | null {
  const unitPrices = selection.colours.map(colour => marketPrice(market, {bundle: 0, colours: [colour]}));
  if (unitPrices.some(price => price === null)) return null;
  return unitPrices.reduce<number>((total, price) => total + (price ?? 0), 0);
}

export function cartAmount(market: Market | null, items: CartItem[]) {
  let subtotal = 0;
  for (const item of items) {
    const price = marketPrice(market, item);
    if (price === null) return null;
    subtotal += price * item.quantity;
  }
  return subtotal;
}

type CheckoutLine = { quantity: number; merchandise: { id: string } };
type ShopifyCart = {
  checkoutUrl: string;
  lines: { nodes: CheckoutLine[]; pageInfo: { hasNextPage: boolean } };
  cost: { subtotalAmount: Money };
};

export async function goToCheckout(items: CartItem[], market: Market) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    const variant = findVariant(market, item);
    if (!variant?.availableForSale) throw new Error("A camera selection is unavailable. Update your bag and try again.");
    quantities.set(variant.id, (quantities.get(variant.id) ?? 0) + item.quantity);
  }
  if (quantities.size < 1 || quantities.size > 250) throw new Error("Checkout requires between 1 and 250 different items.");
  const country = market.country.isoCode;
  const data = await request<{ cartCreate: { cart: ShopifyCart | null; userErrors: { message: string }[] } }>(
    `mutation CreateCart($input: CartInput!, $country: CountryCode!) @inContext(country: $country) {
      cartCreate(input: $input) {
        userErrors { message }
        cart {
          checkoutUrl
          cost { subtotalAmount { amount currencyCode } }
          lines(first: 250) {
            pageInfo { hasNextPage }
            nodes {
              quantity
              merchandise { ... on ProductVariant { id } }
            }
          }
        }
      }
    }`,
    { country, input: {
      buyerIdentity: {countryCode: country},
      lines: Array.from(quantities, ([merchandiseId, quantity]) => ({merchandiseId, quantity})),
    } },
  );
  const {cart, userErrors} = data.cartCreate;
  if (!cart || userErrors.length || cart.lines.pageInfo.hasNextPage) {
    throw new Error("Shopify could not confirm every item in your bag.");
  }
  const booked = new Map(cart.lines.nodes.map(line => [line.merchandise.id, line.quantity]));
  if (booked.size !== quantities.size || Array.from(quantities).some(([id, count]) => booked.get(id) !== count)) {
    throw new Error("The available selections changed. Update your bag and try again.");
  }
  const subtotal = cart.cost.subtotalAmount;
  if (subtotal.currencyCode !== market.country.currency.isoCode || Math.round(Number(subtotal.amount) * 100) !== cartAmount(market, items)) {
    throw new Error("Checkout returned different pricing. Refresh the storefront and try again.");
  }
  const url = new URL(cart.checkoutUrl);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Checkout returned an unexpected address.");
  }
  window.location.assign(url.href);
}
