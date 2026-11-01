import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidOrderLookup, isValidSliitId } from "@/lib/validation";
const attempts = new Map<string, { count: number; resetAt: number }>();
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now(), current = attempts.get(ip);
  if (current && current.resetAt > now && current.count >= 10) return Response.json({ error: "Too many lookups. Try again later." }, { status: 429 });
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); else current.count++;
  const body = await request.json().catch(() => ({}));
  const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : typeof body?.email === "string" ? body.email.trim() : "";
  if (!isValidOrderLookup(identifier)) return Response.json({ error: "Enter a valid email address or SLIIT ID." }, { status: 400 });
  const query = createAdminClient().from("orders").select("id,qty,status,ticket_number,sliit_id,rejection_reason,checked_in_count,checked_in_tickets,checked_in_at,created_at").eq("event_id", eventConfig.eventId);
  const { data, error } = await (isValidSliitId(identifier)
    ? query.ilike("sliit_id", identifier)
    : query.eq("email", identifier.toLowerCase())).order("created_at", { ascending: false }).limit(10);
  if (error) return Response.json({ error: "Could not look up orders." }, { status: 500 });
  return Response.json({ orders: data ?? [] });
}
