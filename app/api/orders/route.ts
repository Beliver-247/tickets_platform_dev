import { NextRequest } from "next/server";
import { eventConfig } from "@/config/event";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedReceiptTypes, MAX_RECEIPT_BYTES, validateOrderInput } from "@/lib/validation";

function normalizeBankReference(bankReference: string) {
  const trimmed = bankReference.trim().toUpperCase();
  const match = trimmed.match(/^DJ[-\s]?([A-Z]{2}\d{8})$/);
  return match ? `DJ-${match[1]}` : trimmed;
}

export async function POST(request: NextRequest) {
  if (!eventConfig.salesOpen) return Response.json({ error: "Sales are closed." }, { status: 400 });
  const form = await request.formData(), file = form.get("receipt");
  const input = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? "").toLowerCase().trim(),
    phone: String(form.get("phone") ?? ""),
    qty: Number(form.get("qty")),
    bankReference: normalizeBankReference(String(form.get("bankReference") ?? "")),
    sliitId: String(form.get("sliitId") ?? "").toUpperCase().trim()
  };
  const error = validateOrderInput(input);
  if (error || !(file instanceof File)) return Response.json({ error: error ?? "Receipt is required." }, { status: 400 });
  if (!allowedReceiptTypes.includes(file.type) || file.size > MAX_RECEIPT_BYTES) return Response.json({ error: "Invalid receipt file." }, { status: 400 });
  const supabase = createAdminClient();
  if (eventConfig.totalCapacity) {
    const { data } = await supabase.from("orders").select("qty").eq("event_id", eventConfig.eventId).in("status", ["pending", "approved"]);
    if ((data ?? []).reduce((sum, row) => sum + row.qty, 0) + input.qty > eventConfig.totalCapacity) return Response.json({ error: "Not enough tickets remain." }, { status: 409 });
  }
  const path = `${eventConfig.eventId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const upload = await supabase.storage.from("receipts").upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) {
    console.error("Receipt upload failed.", upload.error);
    return Response.json({
      error: upload.error.message === "Bucket not found"
        ? "Receipt storage is not configured. Run the Supabase migration."
        : "Could not upload receipt."
    }, { status: 500 });
  }
  const insert = await supabase.from("orders").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    qty: input.qty,
    bank_reference: input.bankReference,
    sliit_id: input.sliitId,
    event_id: eventConfig.eventId,
    receipt_path: path,
    status: "pending"
  }).select("id").single();
  if (insert.error) {
    console.error("Order insert failed.", insert.error);
    await supabase.storage.from("receipts").remove([path]);
    return Response.json({
      error: insert.error.code === "23505"
        ? "That bank reference has already been submitted."
        : insert.error.code === "PGRST205" || insert.error.code === "PGRST204"
          ? "The database is not configured. Run the Supabase migration."
          : "Could not create order."
    }, { status: 400 });
  }
  return Response.json({ orderId: insert.data.id });
}
