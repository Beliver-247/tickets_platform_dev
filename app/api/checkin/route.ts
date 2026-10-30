import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { orderId, count = 1, ticketIndex } = await request.json().catch(() => ({})); const admin = createAdminClient(); const { data: order } = await admin.from("orders").select("*").eq("id", orderId).eq("event_id", eventConfig.eventId).eq("status", "approved").maybeSingle();
  if (!order) return Response.json({ error: "Approved order not found." }, { status: 404 });
  const index = ticketIndex === undefined ? undefined : Number(ticketIndex);
  if (index !== undefined) {
    if (!Number.isInteger(index) || index < 1 || index > order.qty) return Response.json({ error: "Invalid ticket number." }, { status: 400 });
    const checkedInTickets = Array.isArray(order.checked_in_tickets) ? order.checked_in_tickets : [];
    if (checkedInTickets.includes(index)) return Response.json({ error: `Ticket ${order.sliit_id} - ${index} has already been checked in.` }, { status: 409 });
    const nextTickets = [...checkedInTickets, index].sort((a, b) => a - b);
    const update = await admin.from("orders").update({ checked_in_tickets: nextTickets, checked_in_count: nextTickets.length, checked_in_at: new Date().toISOString() }).eq("id", orderId);
    if (update.error) return Response.json({ error: "Could not check in ticket." }, { status: 500 });
    return Response.json({ checkedInCount: nextTickets.length, checkedInTickets: nextTickets });
  }
  const requested = Number(count); if (!Number.isInteger(requested) || requested < 1 || order.checked_in_count + requested > order.qty) return Response.json({ error: "Check-in count exceeds the order." }, { status: 400 });
  const next = order.checked_in_count + requested; const update = await admin.from("orders").update({ checked_in_count: next, checked_in_at: new Date().toISOString() }).eq("id", orderId);
  if (update.error) return Response.json({ error: "Could not check in order." }, { status: 500 }); return Response.json({ checkedInCount: next });
}
