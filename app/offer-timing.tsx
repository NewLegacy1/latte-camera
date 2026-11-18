"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { nextShipDate, saleTimeLeft } from "./offer-clock";

const segments = [
  ["days", "D"], ["hours", "H"], ["minutes", "M"], ["seconds", "S"],
] as const;

export function SaleBanner() {
  const [now, setNow] = useState<number>();
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const clock = window.setInterval(tick, 1000);
    return () => window.clearInterval(clock);
  }, []);
  const countdown = now === undefined ? null : saleTimeLeft(now);
  if (countdown?.finished) {
    return <div className="announcement"><Heart aria-hidden="true" size={11} fill="currentColor"/> Make every coffee a little more special</div>;
  }
  return <div className="sale-banner">
    <a className="sale-message" href="#shop"><span className="sale-spark" aria-hidden="true">✦</span><strong>Early Black Friday Sale</strong></a>
    <div className="sale-countdown" role="timer" aria-live="off" aria-label="Time remaining until November 20 ends Eastern time">
      {segments.map(([key, label]) => <span className="sale-time" key={key}><b>{countdown ? String(countdown[key]).padStart(2, "0") : "–"}</b><small>{label}</small></span>)}
    </div>
  </div>;
}

export function NextDispatch() {
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => setDate(nextShipDate(new Date()));
    tick();
    const clock = window.setInterval(tick, 30000);
    return () => window.clearInterval(clock);
  }, []);
  return <div className="next-dispatch"><span className="dispatch-dot" aria-hidden="true"/>{date && <span>Order now, ships <strong>{date}</strong></span>}</div>;
}
