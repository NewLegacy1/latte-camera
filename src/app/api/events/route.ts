import { NextResponse } from "next/server";
import { HANDLES } from "@/lib/offer";
import { isMetaEvent, sendCapi } from "@/lib/meta";

const KNOWN_IDS = new Set<string>(Object.values(HANDLES));

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

  const contentIds = Array.isArray(record.contentIds)
    ? record.contentIds.filter((id): id is string => typeof id === "string" && KNOWN_IDS.has(id)).slice(0, 6)
    : undefined;
  const value =
    typeof record.value === "string" && /^\d+(\.\d{1,2})?$/.test(record.value) ? record.value : undefined;
  const numItems =
    typeof record.numItems === "number" && record.numItems > 0 && record.numItems < 10
      ? Math.round(record.numItems)
      : undefined;
  const eventSourceUrl =
    typeof record.eventSourceUrl === "string" ? record.eventSourceUrl.slice(0, 2000) : "";
  const fbp = typeof record.fbp === "string" ? record.fbp.slice(0, 200) : undefined;
  const fbc = typeof record.fbc === "string" ? record.fbc.slice(0, 200) : undefined;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || undefined;

  const result = await sendCapi({
    eventName: record.eventName,
    eventId: record.eventId,
    eventSourceUrl,
    value,
    contentIds,
    numItems,
    fbp,
    fbc,
    ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true, sent: result.sent });
}
