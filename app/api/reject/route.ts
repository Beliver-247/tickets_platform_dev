import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendRejectionEmail } from "@/lib/email";
export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { orderId, reason = "Payment could not be verified." } = await request.json().catch(() => ({}));
  const admin = createAdminClient(); const { data: order } = await admin.from("orders").select("name,email").eq("id", orderId).eq("event_id", eventConfig.eventId).maybeSingle();
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  const update = await admin.from("orders").update({ status: "rejected", rejection_reason: String(reason).slice(0, 500) }).eq("id", orderId);
  if (update.error) return Response.json({ error: "Could not reject order." }, { status: 500 });
  try { await sendRejectionEmail(order, String(reason)); return Response.json({ ok: true }); } catch { return Response.json({ ok: true, warning: "Rejected, but notification email failed." }); }
}
