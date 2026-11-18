"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Coffee, Gift, LockKeyhole, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, Star, Truck, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { bundles, colours, defaultColours, faq, gallery, gifts, info, money, readCart, reviews, selectionKey, type Review, type BundleIndex, type CartItem, type Colour, type Selection } from "./catalog";
import MarketingPreferences from "./marketing-preferences";
import { marketingPreference, trackMeta } from "./meta";
import { cameraComparison, cartAmount, findVariant, goToCheckout, marketPrice, type Market } from "./commerce";
import { useShopifyMarket } from "./use-shopify-market";
import { NextDispatch, SaleBanner } from "./offer-timing";

const responsivePhotos = ["hero", "press", "steps", "family", "cups", "kit", "gift", "morning", "holiday-camera", "stencil-demo", "cinnamon-demo", "holiday-cups"];

function Photo({name, alt, className = "", priority = false, art = false}: {name: string; alt: string; className?: string; priority?: boolean; art?: boolean}) {
  if (responsivePhotos.includes(name)) {
    const base = "/media/" + name;
    if (art) return <Image src={base + "-thumb.webp"} alt={alt} width={200} height={200}/>;
    return <picture className="responsive-photo">
      <source media="(max-width: 759px)" srcSet={base + "-mobile.webp"}/>
      <Image className={className} src={base + ".webp"} alt={alt} width={1240} height={1240}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined}/>
    </picture>;
  }
  const src = "/media/" + name + ".webp";
  if (name === "logo") return <Image src={src} alt={alt} width={640} height={147} unoptimized/>;
  return <Image className={className} src={src} alt={alt} width={art ? 420 : 1200} height={art ? 420 : 1200}
    preload={priority} sizes={art ? "180px" : "(max-width: 760px) 100vw, 56vw"} />;
}

function DemoPhoto({name, alt, demo}: {name: string; alt: string; demo?: string}) {
  const media = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [playRequested, setPlayRequested] = useState(false);
  const playing = inView && (reducedMotion === false || playRequested);

  useEffect(() => {
    if (!demo || !media.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, {threshold: 0.25});
    observer.observe(media.current);
    return () => observer.disconnect();
  }, [demo]);

  return <div className="step-media" ref={media}>
    {playing && demo ? <Image src={"/media/" + demo + ".gif"} alt={alt} width={135} height={240} unoptimized/> : <Photo name={name} alt={alt}/>}
    {demo && reducedMotion && !playRequested && <button type="button" onClick={() => setPlayRequested(true)}>Play demo</button>}
  </div>;
}

function BundleArt({finish}: {finish: readonly Colour[]}) {
  return <span className={"bundle-art art-" + finish.length} aria-hidden="true">
    {finish.map((colour, index) => <Photo key={index} name={colour} alt="" art />)}
  </span>;
}

function Disclosure({title, children}: {title: string; children: ReactNode}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className={"disclosure" + (open ? " disclosure-open" : "")}>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {title}<span className="disclosure-icon">{open ? <Minus size={15}/> : <Plus size={15}/>}</span>
    </button>
    <div className="disclosure-body" id={id} aria-hidden={!open}><div><p>{children}</p></div></div>
  </div>;
}

function Overlay({type, title, close, children}: {type: "cart" | "menu" | "search"; title: string; close: () => void; children: ReactNode}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return <dialog ref={dialog} className={"overlay overlay-" + type} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="dialog-content">
      <div className="dialog-header"><h2 id={titleId}>{title}</h2><button className="icon-btn" aria-label="Close" onClick={close}><X size={23}/></button></div>
      {children}
    </div>
  </dialog>;
}

function Gallery() {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  function jump(index: number) {
    const element = rail.current;
    if (!element) return;
    element.scrollTo({left: element.clientWidth * index, behavior: reduced ? "instant" : "smooth"});
    setActive(index);
  }
  return <section className="gallery" aria-label="Latte Camera product photos">
    <div className="gallery-frame">
      <div className="gallery-rail" ref={rail}
        onScroll={event => {
          const element = event.currentTarget;
          setActive(Math.round(element.scrollLeft / element.clientWidth));
        }}
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            jump(Math.min(gallery.length - 1, Math.max(0, active + (event.key === "ArrowRight" ? 1 : -1))));
          }
        }}>
        {gallery.map((frame, index) => <div className="gallery-slide" key={frame.image}>
          <Photo name={frame.image} alt={frame.alt} priority={index === 0} />
        </div>)}
      </div>
      <button className="gallery-prev icon-btn" aria-label="Previous product image" onClick={() => jump(active - 1)} disabled={active === 0}><ChevronLeft size={20}/></button>
      <button className="gallery-next icon-btn" aria-label="Next product image" onClick={() => jump(active + 1)} disabled={active === gallery.length - 1}><ChevronRight size={20}/></button>
    </div>
    <div className="gallery-thumbs">
      {gallery.map((frame, index) => <button key={frame.image} aria-label={"Show " + frame.label} aria-pressed={active === index} onClick={() => jump(index)}>
        <Photo name={frame.image} alt="" art />
      </button>)}
    </div>
    <div className="gallery-detail">
      <Photo name="cinnamon-demo" alt="Spoonful of cinnamon added to a Latte Camera in a home kitchen"/>
      <Photo name="kit" alt="The Latte Camera alongside reusable stencil cards"/>
    </div>
  </section>;
}

function Reveal({children, className = ""}: {children: ReactNode; className?: string}) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? undefined : {y: [8, 0]}}
    viewport={{once: true, amount: 0.2}} transition={{duration: 0.48, ease: "easeOut"}}>{children}</motion.div>;
}

const links = [
  { label: "Shop", href: "#shop", search: "latte camera black cream white sage green frother bundles" },
  { label: "How It Works", href: "#how-it-works", search: "press fill reveal cocoa cinnamon stencil demonstration" },
  { label: "Our Story", href: "#our-story", search: "gifts gift coffee lovers brand packaging" },
  { label: "Latte Art", href: "#latte-art", search: "latte art design holiday photos" },
  { label: "Reviews", href: "#reviews", search: "stars testimonials coffee stories" },
  { label: "FAQs", href: "#faqs", search: "questions shipping returns batteries product details" },
];

function ReviewStars({rating}: {rating: number}) {
  return <span className="review-stars" role="img" aria-label={rating + " out of 5 stars"}>
    {Array.from({length: rating}, (_, i) => <Star key={i} size={13} fill="currentColor" aria-hidden="true"/>)}
  </span>;
}

function ReviewCard({review, featured = false}: {review: Review; featured?: boolean}) {
  return <figure className={"coffee-review" + (featured ? " featured-review" : "")}>
    <div className="review-heading">
      <ReviewStars rating={review.rating}/>
      <strong>{review.title}</strong>
    </div>
    <blockquote>“{review.quote}”</blockquote>
    <figcaption><span className="review-initial" aria-hidden="true">{review.name[0]}</span>{review.name}
      {featured && <a href="#reviews">Read all reviews <ArrowRight size={13}/></a>}
    </figcaption>
  </figure>;
}

function GiftPanel({bundle}: {bundle: (typeof bundles)[BundleIndex]}) {
  const giftKeys = ["refill", "frother"] as const;
  return <fieldset className="gift-panel">
    <legend><Gift size={14} aria-hidden="true"/> Bundle gifts</legend>
    <div className="gift-tiles">
      {giftKeys.map((key, index) => {
        const unlocked = bundle.gifts.some(gift => gift === key);
        return <div className={"gift-tile" + (unlocked ? "" : " gift-locked")} key={key}>
          {index > 0 && <span className="gift-plus" aria-hidden="true"><Plus size={12}/></span>}
          <div className="gift-photo">
            <Photo name={gifts[key].image} alt="" art/>
            <span className="gift-lock" aria-hidden="true"><LockKeyhole size={18}/></span>
          </div>
          <div className="gift-caption">
            <strong>{gifts[key].name}</strong>
            <span>{unlocked ? "Free gift" : key === "refill" ? "Unlock with 2 cameras" : "Unlock with 3 cameras"}</span>
          </div>
        </div>;
      })}
    </div>
    <div className={"gift-shipping" + (bundle.freeShipping ? "" : " gift-shipping-locked")}>
      {bundle.freeShipping ? <Truck size={15} aria-hidden="true"/> : <LockKeyhole size={15} aria-hidden="true"/>}
      {bundle.freeShipping ? "Free standard shipping included" : "Free shipping unlocks with 2 cameras"}
    </div>
  </fieldset>;
}

function Bag({cart, close, selectDuo, adjustCameras, removeItem, market, online, upgradeColour}: {
  cart: CartItem[]; close: () => void; selectDuo: () => void; upgradeColour: Colour;
  adjustCameras: (key: string, change: -1 | 1) => void;
  removeItem: (key: string) => void;
  market: Market | null; online: boolean;
}) {
  const [message, setMessage] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const currency = market?.country.currency.isoCode ?? "CAD";
  const subtotal = online && !market ? null : cartAmount(market, cart);
  const separately = cart.map(item => cameraComparison(market, item));
  const comparison = separately.some(amount => amount === null) ? null : separately.reduce<number>((sum, amount, index) => sum + (amount ?? 0) * cart[index].quantity, 0);
  const savings = comparison !== null && subtotal !== null ? Math.max(0, comparison - subtotal) : 0;
  const shippingIncluded = cart.some(item => bundles[item.bundle].freeShipping);
  const single = shippingIncluded ? undefined : cart.find(item => item.bundle === 0);
  const duo: Selection | null = single ? { bundle: 1, colours: [...single.colours, upgradeColour] } : null;
  const singlePrice = single && (!online || market) ? marketPrice(market, single) : null;
  const duoPrice = duo && (!online || market) ? marketPrice(market, duo) : null;
  const upgradeAvailable = single && duo && singlePrice !== null && duoPrice !== null && duoPrice >= singlePrice && (!market || findVariant(market, duo)?.availableForSale);

  async function checkout() {
    if (!market) {
      setMessage(online ? "Shopify pricing is unavailable. Refresh and try again." : "Checkout is unavailable in this offline preview.");
      return;
    }
    setCheckingOut(true);
    setMessage("");
    try { await goToCheckout(cart, market); } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be opened.");
      setCheckingOut(false);
    }
  }

  if (!cart.length) return <div className="bag"><div className="empty-bag">
    <ShoppingBag size={36} strokeWidth={1.2}/>
    <h3>Your bag is empty.</h3>
    <button className="cta" onClick={close}>Shop the Latte Camera <ArrowRight size={17}/></button>
  </div></div>;

  return <div className="bag">
    <div className={"bag-shipping" + (shippingIncluded ? " shipping-earned" : "")}>
      <div className="bag-shipping-icon"><Truck size={20} aria-hidden="true"/></div>
      <div><strong>{shippingIncluded ? "Free standard shipping unlocked" : "Free shipping with the Duo or Trio"}</strong>
        <div className="bag-progress" aria-hidden="true"><span/></div>
      </div>
      {shippingIncluded ? <Check size={16} aria-hidden="true"/> : <button type="button" onClick={selectDuo}>See Duo <ArrowRight size={13}/></button>}
    </div>
    <ul className="cart-items">
      {cart.map(item => {
        const key = selectionKey(item);
        const bundle = bundles[item.bundle];
        const price = online && !market ? null : marketPrice(market, item);
        const original = cameraComparison(market, item);
        return <li key={key} className="cart-order">
          <div className="cart-item">
            <div className="cart-art"><BundleArt finish={item.colours}/></div>
            <div className="cart-details">
              <strong>The Latte Camera x {bundle.count * item.quantity}</strong>
              <p>{item.colours.map(colour => colours[colour].name).join(" · ")}</p>
              <div className="cart-edit">
                <div className="quantity" aria-label="Camera quantity">
                  <button disabled={checkingOut} onClick={() => adjustCameras(key, -1)} aria-label="Remove one camera"><Minus size={15}/></button>
                  <span>{bundle.count * item.quantity}</span>
                  <button disabled={checkingOut || bundle.count === 3} onClick={() => adjustCameras(key, 1)} aria-label="Add one camera" title={bundle.count === 3 ? "Largest bundle selected" : undefined}><Plus size={15}/></button>
                </div>
                <button className="text-button" disabled={checkingOut} onClick={() => removeItem(key)}>Remove</button>
              </div>
            </div>
            <div className="cart-line-price">
              <b>{price === null ? "Unavailable" : money(price * item.quantity, true, currency)}</b>
              {price !== null && original !== null && original > price && <s>{money(original * item.quantity, true, currency)}</s>}
            </div>
          </div>
          {bundle.gifts.length > 0 && <div className="cart-gifts">
            <div className="cart-gift-title"><Gift size={13} aria-hidden="true"/> Included with your bundle</div>
            {bundle.gifts.map(gift => <div className="cart-gift" key={gift}>
              <Photo name={gifts[gift].image} alt="" art/>
              <strong>{item.quantity > 1 ? item.quantity + " × " : ""}{gifts[gift].name}</strong><b>FREE</b>
            </div>)}
          </div>}
        </li>;
      })}
    </ul>
    <div className="cart-footer">
      {upgradeAvailable && <div className="cart-duo-upgrade">
        <div><strong>Unlock free shipping with the Duo</strong><span>Add a {colours[upgradeColour].name} camera + a free cocoa & cinnamon refill kit.</span></div>
        <button type="button" disabled={checkingOut} onClick={() => adjustCameras(selectionKey(single), 1)}>
          Upgrade to Duo · +{money(duoPrice - singlePrice, true, currency)} <ArrowRight size={15} aria-hidden="true"/>
        </button>
      </div>}
      <div className="cart-subtotal">
        <div><span>Subtotal</span>{savings > 0 && <small>You save {money(savings, true, currency)}</small>}</div>
        <strong>{subtotal === null ? "Unavailable" : money(subtotal, false, currency)}</strong>
      </div>
      <button className="cta" onClick={checkout} disabled={checkingOut || subtotal === null}>
        <LockKeyhole size={17} aria-hidden="true"/>{checkingOut ? "Opening checkout…" : "Review Order"}<ArrowRight size={18} aria-hidden="true"/>
      </button>
      <p role="status">{message || (market ? "Taxes and delivery confirmed at checkout" : online ? "" : "Checkout preview")}</p>
    </div>
  </div>;
}

function SearchCatalog({close}: {close: () => void}) {
  const [term, setTerm] = useState("");
  const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = links.filter(link => words.every(word => (link.label + " " + link.search).toLowerCase().includes(word)));
  return <div className="search-content">
    <label className="search-field"><Search size={19}/><input type="search" value={term} onChange={event => setTerm(event.target.value)} autoFocus placeholder="Try “stencils” or “bundles”" aria-label="Search the storefront"/></label>
    <div className="dialog-links">
      {filtered.map(link => <a key={link.href} href={link.href} onClick={close}>{link.label}<ArrowRight size={17}/></a>)}
      {filtered.length === 0 && <p>No matching pages. Try “camera” or “cocoa”.</p>}
    </div>
  </div>;
}

export default function Storefront() {
  const [bundle, setBundle] = useState<BundleIndex>(1);
  const [finishes, setFinishes] = useState<Colour[]>(defaultColours);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [overlay, setOverlay] = useState<"cart" | "menu" | "search" | null>(null);
  const [sticky, setSticky] = useState(false);
  const [added, setAdded] = useState(false);
  const purchasePanel = useRef<HTMLElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const feedback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const selected = bundles[bundle];
  const { countries, country, market, error, online, changeCountry } = useShopifyMarket();
  const currency = market?.country.currency.isoCode ?? "CAD";
  const selection: Selection = { bundle, colours: finishes.slice(0, selected.count) };
  const total = online && !market ? null : marketPrice(market, selection);
  const buyable = total !== null && (!market || Boolean(findVariant(market, selection)?.availableForSale));
  const bagCount = cart.reduce((sum, row) => sum + bundles[row.bundle].count * row.quantity, 0);

  useEffect(() => {
    try { setCart(readCart(localStorage.getItem("dearlatte-cart-v2"))); } catch {}
    setHydrated(true);
    return () => { if (feedback.current) clearTimeout(feedback.current); };
  }, []);
  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem("dearlatte-cart-v2", JSON.stringify(cart)); } catch {}
    }
  }, [cart, hydrated]);
  useEffect(() => {
    const button = addButton.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setSticky(!entry.isIntersecting && entry.boundingClientRect.bottom < 0));
    observer.observe(button);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const panel = purchasePanel.current;
    if (!panel) return;
    const observer = new ResizeObserver(() => panel.style.setProperty("--panel-height", panel.offsetHeight + "px"));
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const viewedProduct = useRef(false);
  const variantId = market && findVariant(market, selection)?.id.split("/").pop();
  useEffect(() => {
    function viewProduct() {
      if (viewedProduct.current || !variantId || total === null || localStorage.getItem(marketingPreference) !== "yes") return;
      viewedProduct.current = true;
      trackMeta("ViewContent", { content_ids: [variantId], content_type: "product", value: total / 100, currency });
    }
    viewProduct();
    window.addEventListener(marketingPreference, viewProduct);
    return () => window.removeEventListener(marketingPreference, viewProduct);
  }, [variantId, total, currency]);

  function addToBag() {
    if (!buyable) return;
    const key = selectionKey(selection);
    setCart(items => items.some(item => selectionKey(item) === key)
      ? items.map(item => selectionKey(item) === key ? {...item, quantity: item.quantity + 1} : item)
      : [...items, {...selection, quantity: 1}]);
    if (variantId && total !== null) trackMeta("AddToCart", { content_ids: [variantId], content_type: "product", value: total / 100, currency, num_items: 1 });
    setAdded(true);
    setOverlay("cart");
    if (feedback.current) clearTimeout(feedback.current);
    feedback.current = setTimeout(() => setAdded(false), 1100);
  }
  function adjustCameras(key: string, change: -1 | 1) {
    setCart(items => {
      const item = items.find(row => selectionKey(row) === key);
      if (!item) return items;
      const count = bundles[item.bundle].count + change;
      if (count > 3) return items;
      const remaining = items.flatMap(row => selectionKey(row) !== key
        ? [row] : row.quantity > 1 ? [{...row, quantity: row.quantity - 1}] : []);
      if (!count) return remaining;
      const next: CartItem = {
        bundle: (count - 1) as BundleIndex,
        colours: change < 0 ? item.colours.slice(0, count) : [...item.colours, finishes[count - 1]],
        quantity: 1,
      };
      if (market && !findVariant(market, next)?.availableForSale) return items;
      const nextKey = selectionKey(next);
      return remaining.some(row => selectionKey(row) === nextKey)
        ? remaining.map(row => selectionKey(row) === nextKey ? {...row, quantity: row.quantity + 1} : row)
        : [...remaining, next];
    });
  }
  const close = () => setOverlay(null);

  return <>
    <a className="skip" href="#shop">Skip to product</a>
    <SaleBanner/>
    <header className="site-header">
      <div className="nav-inner">
        <button className="icon-btn nav-menu" onClick={() => setOverlay("menu")} aria-label="Open menu"><Menu size={23}/></button>
        <a className="wordmark" href="#top" aria-label="DearLatte home"><Photo name="logo" alt="DearLatte" art/></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links.slice(0, 4).map(link => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
        <div className="nav-actions">
          <button className="icon-btn desktop-menu" onClick={() => setOverlay("menu")} aria-label="Open menu"><Menu size={21}/></button>
          <button className="icon-btn" aria-label="Search" onClick={() => setOverlay("search")}><Search size={21}/></button>
          <button className="icon-btn nav-bag" aria-label={"Shopping bag, " + bagCount + " cameras"} onClick={() => setOverlay("cart")}><ShoppingBag size={21}/><span aria-hidden="true">{bagCount}</span></button>
        </div>
      </div>
    </header>
    <main id="top">
      <div className="product-shell">
        <Gallery/>
        <section ref={purchasePanel} className="purchase" id="shop" aria-labelledby="product-name">
          <div className="social-proof">
            <span className="proof-stars" aria-hidden="true">{Array.from({length:5}, (_, i) => <Star key={i} size={14} fill="currentColor"/>)}</span>
            <span>Loved by <strong>1400+ coffee enthusiasts</strong></span>
          </div>
          <h1 id="product-name">The Latte Camera</h1>
          <p className="intro"><strong>For the coffee lover who already has everything.</strong> Give them a retro camera that turns a pinch of cocoa or cinnamon into latte art in seconds.</p>
          <ul className="benefits">
            <li><Coffee size={15}/> No barista skills</li>
            <li><Camera size={15}/> 12 reusable designs</li>
            <li><Sparkles size={15}/> Ready in seconds</li>
          </ul>
          <div className="section-heading" id="bundles"><h2>Bundle &amp; Save</h2><span>Mix and match colours</span></div>
          <div className="bundle-grid" role="group" aria-label="Choose a camera bundle">
            {bundles.map((option, i) => {
              const price = online && !market ? null : marketPrice(market, {bundle: i as BundleIndex, colours: finishes.slice(0, option.count)});
              return <button type="button" key={option.count} className="bundle-card" aria-pressed={bundle === i} onClick={() => setBundle(i as BundleIndex)}>
              {"popular" in option && <span className="popular">Most Popular</span>}
              <BundleArt finish={option.finishes}/>
              <span className="bundle-name">{option.name}</span>
              <strong>{price === null ? "—" : money(price, true, currency)}</strong>
              <small>{option.count === 1 ? "12 stencils included" : option.count === 2 ? "Free shipping + 1 gift" : "Free shipping + 2 gifts"}</small>
            </button>;
            })}
          </div>
          <div className="section-heading config-heading"><h2>Choose Your Colours</h2></div>
          <div className="config-list">
            {selection.colours.map((colour, index) => <div className="config" key={index}>
              <div className="config-heading-row"><strong>Camera {index + 1}</strong><span>{colours[colour].name}</span></div>
              <div className="swatches" role="group" aria-label={"Colour for camera " + (index + 1)}>
                {(Object.keys(colours) as Colour[]).map(option => <button type="button" key={option} aria-pressed={colour === option}
                  onClick={() => setFinishes(current => current.map((value, i) => i === index ? option : value))}>
                  <span className="swatch" style={{backgroundColor: colours[option].swatch}}>{colour === option && <Check size={13} color={option === "black" ? "white" : "#35240f"}/>}</span>
                  <span>{colours[option].name}</span>
                </button>)}
              </div>
            </div>)}
          </div>
          <GiftPanel bundle={selected}/>
          <p className="stencil-inclusion"><Check size={15} aria-hidden="true"/> <strong>12 reusable stencil cards included</strong></p>
          <button className="cta main-buy" ref={addButton} onClick={addToBag} disabled={!buyable}>
            <span>{added ? "Added to Bag" : buyable ? "Add to Cart" : "Unavailable"}</span>{total !== null && <span>{money(total, false, currency)}</span>}{added ? <Check size={20}/> : <ArrowRight size={20}/>}
          </button>
          <NextDispatch/>
          <ReviewCard review={reviews[0]} featured/>
          <a className="policy-link" href="#details">See shipping &amp; returns <ArrowDown size={13}/></a>
          <div className="disclosures product-disclosures" id="details">{info.map(([title, description]) => <Disclosure key={title} title={title}>{description}</Disclosure>)}</div>
        </section>
      </div>

      <div className="editorial">
        <section id="how-it-works" className="story-block magic">
          <Reveal className="story-image"><Photo name="holiday-cups" alt="Fresh lattes with a cocoa Christmas tree and holiday lettering"/></Reveal>
          <Reveal className="story-copy">
            <span className="eyebrow">The two-second trick</span>
            <h2>A Little Magic<br/> in Every Cup.</h2>
            <p>The same coffee you already love, with one extra moment to look forward to. Pick a stencil, press over the foam, and lift to see what you made.</p>
            <a className="editorial-link" href="#steps">See the three steps <ArrowDown size={16}/></a>
          </Reveal>
        </section>

        <section id="steps" className="steps-section content-width">
          <div className="section-title"><h2>Fill. Press. Reveal.</h2></div>
          <div className="steps-grid">
            {[
              ["01", "Fill", "Add cocoa or cinnamon powder.", "cinnamon-demo", "Cinnamon being added to the Latte Camera", "cinnamon-motion"],
              ["02", "Press", "Slide in a stencil. Hold the camera over your latte and press.", "stencil-demo", "A stencil being inserted into the Latte Camera", "stencil-motion"],
              ["03", "Reveal", "Lift the camera and see your design on the foam.", "reveal", "A finished cocoa star on cappuccino foam"],
            ].map(([number, title, description, image, alt, demo]) => <Reveal className="step" key={number}>
              <DemoPhoto name={image} alt={alt} demo={demo}/><div className="step-copy"><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>
            </Reveal>)}
          </div>
        </section>

        <section className="story-block stencils" id="latte-art">
          <Reveal className="story-image"><Photo name="press" alt="The Latte Camera dusting a cocoa star onto a latte"/></Reveal>
          <Reveal className="story-copy">
            <span className="eyebrow">12 reusable stencils included</span>
            <h2>Twelve Ways to<br/> Make Someone’s Day.</h2>
            <p>Make a heart for someone you love, a star for a good morning, or a whole tray of different cups for brunch.</p>
            <details className="stencil-preview">
              <summary>See the holiday stencil examples</summary>
              <figure><Photo name="holiday" alt="Twelve sample holiday stencil illustrations"/><figcaption>Holiday set shown as an example.</figcaption></figure>
            </details>
            <a className="editorial-link" href="#shop">Choose your camera <ArrowRight size={16}/></a>
          </Reveal>
        </section>

        <section id="our-story" className="story-block gifting">
          <Reveal className="story-image"><Photo name="gift" alt="The Sage Green Latte Camera in tissue and a kraft gift box"/><span className="image-note">Gift styling shown</span></Reveal>
          <Reveal className="story-copy">
            <h2>They Have the Whole<br/> Coffee Setup.</h2>
            <p>They have a favourite mug, a go-to roast, and an opinion on grinders. Give them the surprise of pressing a button and lifting the camera to find a cocoa heart on their morning latte. With 12 reusable stencils included, they can pick a different design for the next cup.</p>
            <a className="editorial-link" href="#shop">Build a gift bundle <ArrowRight size={16}/></a>
          </Reveal>
        </section>

        <section className="customer-reviews content-width" id="reviews" aria-labelledby="reviews-title">
          <div className="section-title"><h2 id="reviews-title">Coffee Tastes Better Together.</h2></div>
          <div className="review-grid">
            {reviews.map(review => <ReviewCard key={review.id} review={review}/>)}
          </div>
        </section>

        <section id="faqs" className="faq-section content-width">
          <div className="section-title"><h2>Good to Know.</h2></div>
          <div className="disclosures">{faq.map(([title, description]) => <Disclosure key={title} title={title}>{description}</Disclosure>)}</div>
        </section>

        <section className="final-cta">
          <Photo name="morning" alt="A star-dusted cup of coffee in the morning sun"/>
          <div><h2>Give Them a Little<br/> Coffee Magic.</h2><a className="cta" href="#shop">Choose Their Colour <ArrowRight size={18}/></a></div>
        </section>
      </div>
    </main>
    <footer className="site-footer">
      <a className="wordmark" href="#top" aria-label="DearLatte home"><Photo name="logo" alt="DearLatte" art/></a>
      <nav aria-label="Footer navigation">{links.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
      <MarketingPreferences />
      <small>© DearLatte</small>
    </footer>
    {sticky && buyable && total !== null && <div className="sticky-buy"><div><b>The Latte Camera</b><span>{selected.name}</span></div><button className="cta" onClick={addToBag}>Add to Cart <span>{money(total, false, currency)}</span></button></div>}
    {overlay === "cart" && <Overlay type="cart" title={"Your Bag (" + bagCount + ")"} close={close}><Bag cart={cart} upgradeColour={finishes[1]} adjustCameras={adjustCameras} removeItem={key => setCart(items => items.filter(item => selectionKey(item) !== key))} close={close} market={market} online={online} selectDuo={() => {
      setBundle(1);
      close();
      requestAnimationFrame(() => document.getElementById("bundles")?.scrollIntoView({behavior: reduced ? "instant" : "smooth", block: "start"}));
    }}/></Overlay>}
    {overlay === "menu" && <Overlay type="menu" title="Menu" close={close}><nav className="dialog-links" aria-label="Mobile navigation">{links.map(link => <a key={link.href} href={link.href} onClick={close}>{link.label}<ArrowRight size={17}/></a>)}</nav><div className="menu-market">{countries.length ? <label>Ship to<select aria-label="Shipping country and currency" value={country} onChange={event => changeCountry(event.target.value)}>{countries.map(option => <option key={option.isoCode} value={option.isoCode}>{option.name} · {option.currency.isoCode}</option>)}</select></label> : online && <p role="status">{error ? "Market pricing unavailable" : "Finding your market…"}</p>}</div></Overlay>}
    {overlay === "search" && <Overlay type="search" title="Search" close={close}><SearchCatalog close={close}/></Overlay>}
  </>;
}
