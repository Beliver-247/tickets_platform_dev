import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
export async function POST(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const { query } = await request.json().catch(() => ({})); if (typeof query !== "string" || query.trim().length < 2) return Response.json({ error: "Enter a ticket, name, or email." }, { status: 400 });
  const normalized = query.toUpperCase().replace(/[\s-]/g, ""); const admin = createAdminClient(); const { data, error } = await admin.from("orders").select("id,name,email,qty,status,ticket_number,checked_in_count,checked_in_at").eq("event_id", eventConfig.eventId).or(`email.ilike.%${query.trim()}%,name.ilike.%${query.trim()}%`).limit(10);
  if (error) return Response.json({ error: "Could not search." }, { status: 500 });
  const ticketMatches = (await admin.from("orders").select("id,name,email,qty,status,ticket_number,checked_in_count,checked_in_at").eq("event_id", eventConfig.eventId).not("ticket_number", "is", null)).data?.filter(o => o.ticket_number?.toUpperCase().replace(/[\s-]/g, "") === normalized) ?? [];
  return Response.json({ orders: [...ticketMatches, ...(data ?? []).filter(o => !ticketMatches.some(t => t.id === o.id))] });
}
