"use client";

import imageCompression from "browser-image-compression";
import { FormEvent, useState } from "react";
import { eventConfig } from "@/config/event";
import { formatMoney } from "@/lib/format";
import { allowedReceiptTypes, MAX_RECEIPT_BYTES, validateOrderInput } from "@/lib/validation";
import { SiteShell } from "@/components/site-shell";

export default function BuyPage() {
  const [qty, setQty] = useState(1), [file, setFile] = useState<File | null>(null), [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "payhere">("bank_transfer"), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget), input = { name: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")), qty, bankReference: String(form.get("bankReference") ?? "") };
    if (paymentMethod === "payhere") {
      const validationError = validateOrderInput({ ...input, bankReference: "payhere" });
      if (validationError) return setError(validationError);
      setLoading(true);
      try {
        const response = await fetch("/api/payhere/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Could not start PayHere checkout.");
        const checkout = document.createElement("form"); checkout.method = "POST"; checkout.action = result.checkoutUrl;
        Object.entries(result.fields).forEach(([key, value]) => { const field = document.createElement("input"); field.type = "hidden"; field.name = key; field.value = String(value); checkout.appendChild(field); });
        document.body.appendChild(checkout); checkout.submit();
      } catch (e) { setError(e instanceof Error ? e.message : "Could not start PayHere checkout."); setLoading(false); }
      return;
    }
    const validationError = validateOrderInput(input);
    if (validationError || !file) return setError(validationError ?? "Upload your receipt.");
    if (!allowedReceiptTypes.includes(file.type) || file.size > MAX_RECEIPT_BYTES) return setError("Receipt must be a JPG, PNG, WEBP, or PDF under 5MB.");
    setLoading(true);
    try {
      let upload = file;
      if (file.type.startsWith("image/")) upload = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1800, useWebWorker: true });
      const body = new FormData(); Object.entries(input).forEach(([key, value]) => body.append(key, String(value))); body.append("receipt", upload, file.name);
      const response = await fetch("/api/orders", { method: "POST", body });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Could not submit order.");
      window.location.href = `/confirmation?order=${encodeURIComponent(result.orderId)}`;
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit order."); setLoading(false); }
  }
  return <SiteShell><div className="mx-auto max-w-2xl px-5 py-12"><p className="text-sm uppercase tracking-widest text-[var(--accent)]">Reserve your spot</p><h1 className="mt-2 text-4xl font-black">Buy tickets</h1><p className="mt-3 text-zinc-400">Transfer the total first, then upload your receipt.</p>
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-8">
      <p className="text-sm uppercase tracking-widest text-zinc-500">Bank transfer details</p>
      <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p><b className="text-white">Account:</b> {eventConfig.bank.accountName}</p>
        <p><b className="text-white">Bank:</b> {eventConfig.bank.bankName}</p>
        <p><b className="text-white">Account number:</b> {eventConfig.bank.accountNumber}</p>
        <p><b className="text-white">Branch:</b> {eventConfig.bank.branch}</p>
      </div>
      <p className="mt-4 border-t border-zinc-800 pt-4 text-sm leading-relaxed text-zinc-400">{eventConfig.bank.paymentInstructions}</p>
    </section>
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-8">
      {["name", "email", "phone", ...(paymentMethod === "bank_transfer" ? ["bankReference"] : [])].map((name) => <label key={name} className="block text-sm font-bold capitalize">{name === "bankReference" ? "Bank reference / transaction number" : name}<input name={name} type={name === "email" ? "email" : "text"} required maxLength={name === "phone" ? 10 : undefined} pattern={name === "phone" ? "\\d{10}" : undefined} inputMode={name === "phone" ? "numeric" : undefined} onInvalid={name === "phone" ? e => e.currentTarget.setCustomValidity("Phone number should be exactly 10 characters.") : undefined} onInput={name === "phone" ? e => e.currentTarget.setCustomValidity("") : undefined} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]" /></label>)}
      <fieldset className="space-y-3"><legend className="text-sm font-bold">Payment method</legend><label className="flex items-center gap-3 rounded-xl border border-zinc-700 p-4 font-normal"><input type="radio" name="paymentMethod" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} /> Bank transfer and receipt upload</label><label className="flex items-center gap-3 rounded-xl border border-zinc-700 p-4 font-normal"><input type="radio" name="paymentMethod" checked={paymentMethod === "payhere"} onChange={() => setPaymentMethod("payhere")} /> Pay securely with PayHere (sandbox)</label></fieldset>
      <label className="block text-sm font-bold">Ticket quantity<select value={qty} onChange={e => setQty(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal">{Array.from({ length: eventConfig.maxTicketsPerOrder }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
      {paymentMethod === "bank_transfer" && <label className="block text-sm font-bold">Receipt (image or PDF, max 5MB)<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" required onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-dashed border-zinc-700 p-4 text-sm font-normal text-zinc-400" /></label>}
      <div className="border-t border-zinc-800 pt-5 text-xl font-black">Total: {formatMoney(qty * eventConfig.ticketPrice)}</div>
      {error && <p className="rounded-xl bg-red-950 p-3 text-sm text-red-300">{error}</p>}
      <button disabled={loading} className="w-full rounded-full bg-[var(--primary)] px-6 py-3 font-black text-zinc-950 disabled:opacity-50">{loading ? "Submitting…" : paymentMethod === "payhere" ? "Continue to PayHere" : "Submit for verification"}</button>
    </form></div></SiteShell>;
}
