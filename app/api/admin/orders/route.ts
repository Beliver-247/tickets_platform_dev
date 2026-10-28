import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
export async function GET() {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { data, error } = await createAdminClient().from("orders").select("*").eq("event_id", eventConfig.eventId).order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Could not load orders." }, { status: 500 }); return Response.json({ orders: data ?? [] });
}
