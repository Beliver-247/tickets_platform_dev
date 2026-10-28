import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
export async function GET(request: Request) {
  const auth = await requireAdmin(); if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("orderId"); const admin = createAdminClient(); const { data } = await admin.from("orders").select("receipt_path").eq("id", id).eq("event_id", eventConfig.eventId).maybeSingle();
  if (!data) return Response.json({ error: "Receipt not found." }, { status: 404 }); const signed = await admin.storage.from("receipts").createSignedUrl(data.receipt_path, 300);
  if (signed.error) return Response.json({ error: "Could not open receipt." }, { status: 500 }); return Response.json({ url: signed.data.signedUrl });
}
