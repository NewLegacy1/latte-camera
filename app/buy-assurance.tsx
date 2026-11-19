"use client";

import { useEffect, useState } from "react";

function flagEmoji(code: string) {
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  return String.fromCodePoint(...[...upper].map(letter => 0x1f1e6 + letter.charCodeAt(0) - 65));
}

const shipByLabel = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function shipBy() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return shipByLabel.format(date);
}

const reviewers = [
  { src: "/media/reviewer-1.jpg", alt: "A Dear Latte customer" },
  { src: "/media/reviewer-2.jpg", alt: "A Dear Latte customer" },
  { src: "/media/reviewer-3.jpg", alt: "A Dear Latte customer" },
];

export default function BuyAssurance({ country }: { country: string }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => setDate(shipBy());
    tick();
    const clock = window.setInterval(tick, 30000);
    return () => window.clearInterval(clock);
  }, []);
  const code = (/^[A-Za-z]{2}$/.test(country) ? country : "US").toUpperCase();
  return <div className="buy-assurance">
    <div className="assurance-shipping">
      <span className="assurance-ships"><span className="dispatch-dot" aria-hidden="true"/>{date && <>Ships by <strong>{date}</strong></>}</span>
      <span className="assurance-fast">{flagEmoji(code)} Fast <strong>{code}</strong> Shipping</span>
    </div>
    <div className="assurance-proof">
      <span className="assurance-avatars" aria-hidden="true">
        {reviewers.map(reviewer => <img key={reviewer.src} src={reviewer.src} alt="" width={36} height={36} loading="lazy"/>)}
      </span>
      <span className="assurance-proof-copy">
        <strong>Loved by 1400+ coffee enthusiasts</strong>
        <span>who turn an ordinary morning coffee into a little moment worth looking forward to.</span>
      </span>
    </div>
  </div>;
}
