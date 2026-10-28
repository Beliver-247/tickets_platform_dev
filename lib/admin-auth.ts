import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const admin = createAdminClient();
  const { data } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { user, admin };
}
