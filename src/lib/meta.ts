import "server-only";

const META_EVENTS = ["PageView", "ViewContent", "AddToCart", "InitiateCheckout"] as const;
export type MetaEventName = (typeof META_EVENTS)[number];

export function isMetaEvent(value: unknown): value is MetaEventName {
  return typeof value === "string" && META_EVENTS.some((event) => event === value);
}

type CapiInput = {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  value?: string;
  contentIds?: string[];
  numItems?: number;
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
};

export async function sendCapi(input: CapiInput) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    return { sent: false as const };
  }

  const customData: Record<string, unknown> = { currency: "USD" };
  if (input.value) customData.value = Number(input.value);
  if (input.contentIds?.length) {
    customData.content_ids = input.contentIds;
    customData.content_type = "product";
    customData.contents = input.contentIds.map((id) => ({ id, quantity: 1 }));
  }
  if (input.numItems) customData.num_items = input.numItems;

  const userData: Record<string, string> = {};
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.ip) userData.client_ip_address = input.ip;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    return { sent: false as const };
  }
  return { sent: true as const };
}
