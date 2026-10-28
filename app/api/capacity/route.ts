import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET() {
  if (!eventConfig.totalCapacity) return Response.json({ soldOut: false });
  const { data } = await createAdminClient().from("orders").select("qty").eq("event_id", eventConfig.eventId).in("status", ["pending", "approved"]);
  const used = (data ?? []).reduce((sum, row) => sum + row.qty, 0);
  return Response.json({ soldOut: used >= eventConfig.totalCapacity, used, capacity: eventConfig.totalCapacity });
}
