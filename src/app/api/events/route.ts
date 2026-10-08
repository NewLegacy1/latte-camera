import { NextResponse } from "next/server";
import { VARIANTS } from "@/lib/offer";
import { isMetaEvent, sendCapi } from "@/lib/meta";

const KNOWN_IDS = new Set<string>([
  ...Object.values(VARIANTS.colors),
  VARIANTS.refillKitGift,
  VARIANTS.frotherGift,
  VARIANTS.frother,
]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  if (record.eventName === "Purchase") {
    return NextResponse.json(
      { ok: false, error: "Purchase is recorded by the Ownlane checkout, not this website." },
      { status: 400 },
    );
  }
  if (!isMetaEvent(record.eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof record.eventId !== "string" || !/^[A-Za-z0-9._:-]{8,80}$/.test(record.eventId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const contents = Array.isArray(record.contents)
    ? record.contents
        .filter(
          (item): item is { id: string; quantity: number } =>
            !!item && typeof item === "object" && KNOWN_IDS.has((item as { id?: unknown }).id as string),
        )
        .slice(0, 6)
        .map((item) => ({ id: item.id, quantity: Math.max(1, Math.min(9, Math.round(Number(item.quantity) || 1))) }))
    : undefined;
  const value =
    typeof record.value === "string" && /^\d+(\.\d{1,2})?$/.test(record.value) ? record.value : undefined;
  const eventSourceUrl =
    typeof record.eventSourceUrl === "string" ? record.eventSourceUrl.slice(0, 2000) : "";
  const fbp = typeof record.fbp === "string" ? record.fbp.slice(0, 200) : undefined;
  const fbc = typeof record.fbc === "string" ? record.fbc.slice(0, 600) : undefined;
  const visitorId =
    typeof record.visitorId === "string" && /^[A-Za-z0-9_-]{8,80}$/.test(record.visitorId) ? record.visitorId : undefined;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || undefined;

  const result = await sendCapi({
    eventName: record.eventName,
    eventId: record.eventId,
    eventSourceUrl,
    value,
    contents,
    fbp,
    fbc,
    visitorId,
    ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true, sent: result.sent });
}
