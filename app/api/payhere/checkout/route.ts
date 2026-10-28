import { NextRequest } from "next/server";
import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { payHereCheckoutUrl, payHereHash } from "@/lib/payhere";
import { validateOrderInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!eventConfig.salesOpen) return Response.json({ error: "Sales are closed." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const input = {
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email.toLowerCase().trim() : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    qty: Number(body.qty)
  };
  const error = validateOrderInput({ ...input, bankReference: "payhere" });
  if (error) return Response.json({ error }, { status: 400 });
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const notifyUrl = process.env.PAYHERE_NOTIFY_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!merchantId || !merchantSecret || !notifyUrl || !siteUrl) return Response.json({ error: "PayHere is not configured." }, { status: 503 });
  if (eventConfig.totalCapacity) {
    const { data } = await createAdminClient().from("orders").select("qty").eq("event_id", eventConfig.eventId).in("status", ["pending", "approved"]);
    if ((data ?? []).reduce((sum, row) => sum + row.qty, 0) + input.qty > eventConfig.totalCapacity) return Response.json({ error: "Not enough tickets remain." }, { status: 409 });
  }
  const amount = (eventConfig.ticketPrice * input.qty).toFixed(2);
  const insert = await createAdminClient().from("orders").insert({
    name: input.name, email: input.email, phone: input.phone, qty: input.qty,
    bank_reference: `PAYHERE-${crypto.randomUUID()}`, event_id: eventConfig.eventId,
    receipt_path: null, status: "pending", payment_method: "payhere", payment_amount: amount
  }).select("id").single();
  if (insert.error) return Response.json({ error: "Could not create order." }, { status: 500 });
  const orderId = insert.data.id;
  return Response.json({
    checkoutUrl: payHereCheckoutUrl,
    fields: {
      merchant_id: merchantId, return_url: `${siteUrl}/confirmation?order=${orderId}`,
      cancel_url: `${siteUrl}/buy?payment=cancelled`, notify_url: notifyUrl,
      order_id: orderId, items: `${eventConfig.eventName} ticket(s)`,
      currency: eventConfig.currency, amount,
      first_name: input.name.split(" ")[0], last_name: input.name.split(" ").slice(1).join(" ") || input.name,
      email: input.email, phone: input.phone,
      address: "Sri Lanka", city: "Sri Lanka", country: "Sri Lanka",
      hash: payHereHash(merchantId, orderId, amount, eventConfig.currency, merchantSecret)
    }
  });
}
