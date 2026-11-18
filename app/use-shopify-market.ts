"use client";

import { useEffect, useState } from "react";
import { getCountries, getMarket, preferredCountry, shopifyEnabled, type Country, type Market } from "./commerce";

const key = "dearlatte-shipping-country";

export function useShopifyMarket() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState("");
  const [market, setMarket] = useState<Market | null>(null);
  const [error, setError] = useState(false);
  const online = shopifyEnabled && (typeof window === "undefined" || window.location.protocol !== "file:");

  useEffect(() => {
    if (!online) return;
    const controller = new AbortController();
    getCountries(controller.signal).then(options => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(key); } catch {}
      const selected = preferredCountry(options, saved, navigator.languages);
      if (!selected) throw new Error("No shipping markets are available.");
      setCountries(options);
      setCountry(selected);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [online]);

  useEffect(() => {
    if (!country) return;
    const controller = new AbortController();
    getMarket(country, controller.signal).then(setMarket).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [country]);

  function changeCountry(value: string) {
    if (value === country) return;
    setError(false);
    setMarket(null);
    setCountry(value);
    try { localStorage.setItem(key, value); } catch {}
  }

  return { countries, country, market, error, online, changeCountry };
}
