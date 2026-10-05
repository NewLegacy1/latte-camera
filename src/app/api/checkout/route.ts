import { NextResponse } from "next/server";
import { CheckoutError, createCheckout, parseCheckoutBody } from "@/lib/shopify";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Missing order details." }, { status: 400 });
  }

  try {
    const checkout = await createCheckout(parseCheckoutBody(body));
    return NextResponse.json(checkout);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Checkout didn't open. Try the button again." }, { status: 500 });
  }
}
