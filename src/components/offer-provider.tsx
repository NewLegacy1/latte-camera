"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { payableCents, unitColorsForTier, type PressColor, type Tier } from "@/lib/offer";

type OfferState = {
  tier: Tier;
  setTier: (tier: Tier) => void;
  /** Primary / first camera color — drives the gallery preview. */
  color: PressColor;
  setColor: (color: PressColor) => void;
  /** One color per camera in the selected pack. */
  unitColors: PressColor[];
  setUnitColor: (index: number, color: PressColor) => void;
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
  const [tier, setTierState] = useState<Tier>(2);
  const [unitColors, setUnitColors] = useState<PressColor[]>(["Black", "Black"]);
  const [frother, setFrother] = useState(false);
  const [messageCard, setMessageCard] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const color = unitColors[0] ?? "Black";
  const paidFrother = tier !== 3 && frother;
  const totalCents = payableCents(tier, { frother: paidFrother, messageCard });

  const setTier = useCallback((next: Tier) => {
    setTierState(next);
    setUnitColors((prev) => unitColorsForTier(next, prev));
    // Three-pack already includes a free frother — drop any paid add-on.
    if (next === 3) setFrother(false);
  }, []);

  const setColor = useCallback((next: PressColor) => {
    setUnitColors((prev) => prev.map(() => next));
  }, []);

  const setUnitColor = useCallback((index: number, next: PressColor) => {
    setUnitColors((prev) => {
      const copy = [...prev];
      if (index < 0 || index >= copy.length) return prev;
      copy[index] = next;
      return copy;
    });
  }, []);

  const value = useMemo(
    () => ({
      tier,
      setTier,
      color,
      setColor,
      unitColors,
      setUnitColor,
      frother,
      setFrother,
      messageCard,
      setMessageCard,
      giftMessage,
      setGiftMessage,
      totalCents,
      paidFrother,
    }),
    [
      tier,
      setTier,
      color,
      setColor,
      unitColors,
      setUnitColor,
      frother,
      messageCard,
      giftMessage,
      totalCents,
      paidFrother,
    ],
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
