"use client";

const pixelId = process.env.NEXT_PUBLIC_DEARLATTE_META_PIXEL_ID;
export const metaEnabled = Boolean(pixelId && /^\d+$/.test(pixelId));
type EventName = "PageView" | "ViewContent" | "AddToCart";
type EventData = { content_ids?: string[]; value?: number; currency?: string; num_items?: number; content_type?: "product" };
type Pixel = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push?: Pixel; loaded?: boolean; version?: string };
const browser = () => window as Window & { fbq?: Pixel; _fbq?: Pixel };
let initialized = false;
let viewed = false;

export function trackMeta(name: EventName, data: EventData = {}) {
  if (!metaEnabled) return;
  const target = browser();
  if (!initialized) {
    if (!target.fbq) {
      const pixel = ((...args: unknown[]) => {
        if (pixel.callMethod) pixel.callMethod(...args);
        else pixel.queue.push(args);
      }) as Pixel;
      pixel.queue = [];
      pixel.push = pixel;
      pixel.loaded = true;
      pixel.version = "2.0";
      target.fbq = target._fbq = pixel;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.append(script);
    }
    target.fbq("init", pixelId);
    initialized = true;
  }
  const id = crypto.randomUUID();
  target.fbq?.("trackSingle", pixelId, name, data, { eventID: id });
  const payload = JSON.stringify({ name, id, data, path: location.pathname });
  const body = new Blob([payload], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/meta-events/", body)) {
    void fetch("/api/meta-events/", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

export function trackMetaPage() {
  if (viewed) return;
  viewed = true;
  trackMeta("PageView");
}
