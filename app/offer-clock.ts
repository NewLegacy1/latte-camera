export const merchantTimeZone = "America/Toronto";

// The November 20 offer runs through the end of the day in Eastern time.
export const saleEndsAt = Date.parse("2026-11-21T00:00:00-05:00");

const calendarDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: merchantTimeZone,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const shippingLabel = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
});

export function nextShipDate(now: Date) {
  const parts = Object.fromEntries(calendarDate.formatToParts(now).map(part => [part.type, part.value]));
  const tomorrow = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + 1));
  return shippingLabel.format(tomorrow);
}

export function saleTimeLeft(now: number) {
  const remaining = Math.max(0, Math.ceil((saleEndsAt - now) / 1000));
  return {
    finished: remaining === 0,
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining / 3600) % 24,
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60,
  };
}
