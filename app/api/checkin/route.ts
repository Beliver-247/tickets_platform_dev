import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { orderId, count = 1 } = await request.json().catch(() => ({})); const admin = createAdminClient(); const { data: order } = await admin.from("orders").select("*").eq("id", orderId).eq("event_id", eventConfig.eventId).eq("status", "approved").maybeSingle();
  if (!order) return Response.json({ error: "Approved order not found." }, { status: 404 });
  const requested = Number(count); if (!Number.isInteger(requested) || requested < 1 || order.checked_in_count + requested > order.qty) return Response.json({ error: "Check-in count exceeds the order." }, { status: 400 });
  const next = order.checked_in_count + requested; const update = await admin.from("orders").update({ checked_in_count: next, checked_in_at: new Date().toISOString() }).eq("id", orderId);
  if (update.error) return Response.json({ error: "Could not check in order." }, { status: 500 }); return Response.json({ checkedInCount: next });
}
