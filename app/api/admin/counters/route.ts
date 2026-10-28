import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
export async function GET() {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { data } = await createAdminClient().from("orders").select("qty,checked_in_count").eq("event_id", eventConfig.eventId).eq("status", "approved");
  const approved = (data ?? []).reduce((sum, row) => sum + row.qty, 0), checkedIn = (data ?? []).reduce((sum, row) => sum + row.checked_in_count, 0);
  return Response.json({ approved, checkedIn, remaining: Math.max(0, approved - checkedIn) });
}
