import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendTicketEmail } from "@/lib/email";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { orderId } = await request.json().catch(() => ({}));
  if (typeof orderId !== "string")
    return Response.json({ error: "Invalid order." }, { status: 400 });
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("event_id", eventConfig.eventId)
    .maybeSingle();
  if (!order)
    return Response.json({ error: "Order not found." }, { status: 404 });
  if (order.status === "approved")
    return Response.json({ warning: "Already approved." });
  if (!order.sliit_id)
    return Response.json(
      { error: "This order has no SLIIT ID. Update it before approval." },
      { status: 400 },
    );
  const { data: previousOrders, error: previousOrdersError } = await admin
    .from("orders")
    .select("qty,ticket_start")
    .eq("event_id", eventConfig.eventId)
    .eq("sliit_id", order.sliit_id)
    .eq("status", "approved");
  if (previousOrdersError)
    return Response.json(
      { error: "Could not assign ticket numbers." },
      { status: 500 },
    );
  const ticketStart = (previousOrders ?? []).reduce(
    (lastTicket, previousOrder) =>
      Math.max(
        lastTicket,
        (previousOrder.ticket_start ?? 1) + previousOrder.qty,
      ),
    1,
  );
  const ticket = order.sliit_id;
  const update = await admin
    .from("orders")
    .update({
      status: "approved",
      ticket_number: ticket,
      ticket_start: ticketStart,
      approved_at: new Date().toISOString(),
      approved_by: auth.user.id,
    })
    .eq("id", orderId);
  if (update.error)
    return Response.json(
      { error: "Could not approve order." },
      { status: 500 },
    );
  try {
    await sendTicketEmail({
      ...order,
      ticket_number: ticket,
      ticket_start: ticketStart,
    });
    return Response.json({ ok: true, ticketNumber: ticket });
  } catch {
    return Response.json({
      ok: true,
      ticketNumber: ticket,
      warning: "Approved, but the email failed. Use Resend email.",
    });
  }
}
