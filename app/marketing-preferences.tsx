"use client";

import { useEffect, useState } from "react";
import { marketingPreference, metaEnabled, setMetaPreference, trackMetaPage } from "./meta";

export default function MarketingPreferences() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!metaEnabled) return;
    const preference = localStorage.getItem(marketingPreference);
    if (preference === "yes") trackMetaPage();
    if (preference === null) setOpen(true);
  }, []);
  if (!metaEnabled) return null;
  return <>
    <button type="button" onClick={() => setOpen(true)}>Privacy choices</button>
    {open && <aside className="marketing-preferences" aria-label="Marketing cookies">
      <p>Allow marketing cookies to help Dear Latte measure ads on Meta?</p>
      <div>{[false, true].map(allowed => <button key={String(allowed)} type="button" onClick={() => {
        setMetaPreference(allowed);
        setOpen(false);
      }}>{allowed ? "Allow" : "Decline"}</button>)}</div>
    </aside>}
  </>;
}
