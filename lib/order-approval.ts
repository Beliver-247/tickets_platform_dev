import { eventConfig } from "@/config/event";
import { sendTicketEmail } from "@/lib/email";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function ticketNumber(admin: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const candidate = `${eventConfig.ticketPrefix}${suffix}`;
    const { data } = await admin.from("orders").select("id").eq("ticket_number", candidate).maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("Could not generate a unique ticket number.");
}

export async function approveOrder(admin: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>, order: { id: string; email: string; name: string; qty: number }, approvedBy: string | null) {
  const ticket = await ticketNumber(admin);
  const update = await admin.from("orders").update({ status: "approved", ticket_number: ticket, approved_at: new Date().toISOString(), approved_by: approvedBy }).eq("id", order.id).eq("status", "pending");
  if (update.error) throw new Error("Could not approve order.");
  try {
    await sendTicketEmail({ ...order, ticket_number: ticket });
    return { ticketNumber: ticket };
  } catch {
    return { ticketNumber: ticket, warning: "Approved, but the email failed. Use Resend email." };
  }
}
