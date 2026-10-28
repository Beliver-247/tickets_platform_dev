import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendTicketEmail } from "@/lib/email";
export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { orderId } = await request.json().catch(() => ({})); const { data: order } = await createAdminClient().from("orders").select("*").eq("id", orderId).eq("event_id", eventConfig.eventId).eq("status", "approved").maybeSingle();
  if (!order) return Response.json({ error: "Approved order not found." }, { status: 404 });
  try { await sendTicketEmail(order); return Response.json({ ok: true }); } catch { return Response.json({ error: "Email delivery failed." }, { status: 502 }); }
}
