"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { payableCents, type PressColor, type Tier } from "@/lib/offer";

type OfferState = {
  tier: Tier;
  setTier: (tier: Tier) => void;
  color: PressColor;
  setColor: (color: PressColor) => void;
  frother: boolean;
  setFrother: (value: boolean) => void;
  messageCard: boolean;
  setMessageCard: (value: boolean) => void;
  giftMessage: string;
  setGiftMessage: (value: string) => void;
  totalCents: number;
  paidFrother: boolean;
};

const OfferContext = createContext<OfferState | null>(null);

export function OfferProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>(2);
  const [color, setColor] = useState<PressColor>("Black");
  const [frother, setFrother] = useState(false);
  const [messageCard, setMessageCard] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const paidFrother = tier !== 3 && frother;
  const totalCents = payableCents(tier, { frother: paidFrother, messageCard });

  const value = useMemo(
    () => ({
      tier,
      setTier,
      color,
      setColor,
      frother,
      setFrother,
      messageCard,
      setMessageCard,
      giftMessage,
      setGiftMessage,
      totalCents,
      paidFrother,
    }),
    [tier, color, frother, messageCard, giftMessage, totalCents, paidFrother],
  );

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

export function useOffer() {
  const value = useContext(OfferContext);
  if (!value) {
    throw new Error("useOffer must be used inside OfferProvider");
  }
  return value;
}
