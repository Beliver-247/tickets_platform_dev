import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveOrder } from "@/lib/order-approval";
import { payHereNotificationHash } from "@/lib/payhere";

export async function POST(request: Request) {
  const form = await request.formData();
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const values = Object.fromEntries(form.entries());
  const orderId = String(values.order_id ?? "");
  const statusCode = String(values.status_code ?? "");
  const amount = String(values.payhere_amount ?? "");
  const currency = String(values.payhere_currency ?? "");
  const receivedHash = String(values.md5sig ?? "").toUpperCase();
  if (!merchantId || !merchantSecret || !orderId || !receivedHash) return new Response("Invalid notification.", { status: 400 });
  const expectedHash = payHereNotificationHash(merchantId, orderId, amount, currency, statusCode, merchantSecret);
  if (receivedHash !== expectedHash) return new Response("Invalid notification.", { status: 400 });
  if (statusCode !== "2") return new Response("Notification received.");
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id,name,email,qty,status,payment_method,payment_amount").eq("id", orderId).eq("event_id", eventConfig.eventId).maybeSingle();
  if (!order || order.payment_method !== "payhere" || order.status === "approved") return new Response("Notification received.");
  if (order.payment_amount !== amount || currency !== eventConfig.currency) return new Response("Amount mismatch.", { status: 400 });
  try {
    await approveOrder(admin, order, null);
  } catch (error) {
    console.error("PayHere order approval failed.", error);
    return new Response("Could not process notification.", { status: 500 });
  }
  return new Response("Notification received.");
}
