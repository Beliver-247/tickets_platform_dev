import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendTicketEmail } from "@/lib/email";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
async function ticketNumber(admin: ReturnType<typeof createAdminClient>) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const candidate = `${eventConfig.ticketPrefix}${suffix}`;
    const { data } = await admin.from("orders").select("id").eq("ticket_number", candidate).maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("Could not generate a unique ticket number.");
}
export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { orderId } = await request.json().catch(() => ({})); if (typeof orderId !== "string") return Response.json({ error: "Invalid order." }, { status: 400 });
  const admin = createAdminClient(); const { data: order } = await admin.from("orders").select("*").eq("id", orderId).eq("event_id", eventConfig.eventId).maybeSingle();
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 }); if (order.status === "approved") return Response.json({ warning: "Already approved." });
  const ticket = await ticketNumber(admin); const update = await admin.from("orders").update({ status: "approved", ticket_number: ticket, approved_at: new Date().toISOString(), approved_by: auth.user.id }).eq("id", orderId);
  if (update.error) return Response.json({ error: "Could not approve order." }, { status: 500 });
  try { await sendTicketEmail({ ...order, ticket_number: ticket }); return Response.json({ ok: true, ticketNumber: ticket }); } catch { return Response.json({ ok: true, ticketNumber: ticket, warning: "Approved, but the email failed. Use Resend email." }); }
}
