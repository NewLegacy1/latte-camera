"use client";

import { useEffect, useState } from "react";
import { marketingPreference, setMetaPreference, trackMetaPage } from "./meta";

export default function MarketingPreferences() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const preference = localStorage.getItem(marketingPreference);
    if (preference === "yes") trackMetaPage();
    if (preference === null) setOpen(true);
  }, []);
  return <>
    <button type="button" onClick={() => setOpen(true)}>Privacy choices</button>
    {open && <aside className="marketing-preferences" aria-label="Marketing cookies">
      <p>Allow analytics and marketing cookies to help Dear Latte measure visits and ads with Shopify and Meta?</p>
      <div>{[false, true].map(allowed => <button key={String(allowed)} type="button" onClick={() => {
        setMetaPreference(allowed);
        setOpen(false);
      }}>{allowed ? "Allow" : "Decline"}</button>)}</div>
    </aside>}
  </>;
}
