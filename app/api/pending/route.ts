import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { orderId } = await request.json().catch(() => ({}));
  if (typeof orderId !== "string")
    return Response.json({ error: "Invalid order." }, { status: 400 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("event_id", eventConfig.eventId)
    .maybeSingle();
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });

  const update = await admin
    .from("orders")
    .update({
      status: "pending",
      rejection_reason: null,
      ticket_number: null,
      ticket_start: 1,
      approved_at: null,
      approved_by: null,
    })
    .eq("id", orderId)
    .eq("event_id", eventConfig.eventId);
  if (update.error)
    return Response.json({ error: "Could not move order to pending." }, { status: 500 });
  return Response.json({ ok: true });
}
