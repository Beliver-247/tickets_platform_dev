"use client";

import imageCompression from "browser-image-compression";
import { FormEvent, useState } from "react";
import { eventConfig } from "@/config/event";
import { formatMoney } from "@/lib/format";
import {
  allowedReceiptTypes,
  MAX_RECEIPT_BYTES,
  validateOrderInput,
} from "@/lib/validation";
import { SiteShell } from "@/components/site-shell";

export default function BuyPage() {
  const [qty, setQty] = useState(1),
    [file, setFile] = useState<File | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const [sliitId, setSliitId] = useState(""),
    [email, setEmail] = useState(""),
    [emailEdited, setEmailEdited] = useState(false),
    [bankReference, setBankReference] = useState(""),
    [bankReferenceEdited, setBankReferenceEdited] = useState(false);
  function defaultTransactionAt() {
    const now = new Date(),
      local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
  const [transactionAt, setTransactionAt] = useState(defaultTransactionAt);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget),
      input = {
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        qty,
        bankReference: String(form.get("bankReference")),
        sliitId: String(form.get("sliitId")).toUpperCase().trim(),
        transactionAt: String(form.get("transactionAt")),
      };
    const validationError = validateOrderInput(input);
    if (validationError || !file)
      return setError(validationError ?? "Upload your receipt.");
    if (
      !allowedReceiptTypes.includes(file.type) ||
      file.size > MAX_RECEIPT_BYTES
    )
      return setError("Receipt must be a JPG, PNG, WEBP, or PDF under 5MB.");
    setLoading(true);
    try {
      let upload = file;
      if (file.type.startsWith("image/"))
        upload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1800,
          useWebWorker: true,
        });
      const body = new FormData();
      Object.entries(input).forEach(([key, value]) =>
        body.append(key, String(value)),
      );
      body.append("receipt", upload, file.name);
      const response = await fetch("/api/orders", { method: "POST", body });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Could not submit order.");
      window.location.href = `/confirmation?order=${encodeURIComponent(result.orderId)}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit order.");
      setLoading(false);
    }
  }
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm uppercase tracking-widest text-[var(--accent)]">
          Reserve your spot
        </p>
        <h1 className="mt-2 text-4xl font-black">Buy tickets</h1>
        <p className="mt-3 text-zinc-400">
          Transfer the total first, then upload your receipt.
        </p>
        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-8">
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Bank transfer details
          </p>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
            <p>
              <b className="text-white">Account:</b>{" "}
              {eventConfig.bank.accountName}
            </p>
            <p>
              <b className="text-white">Bank:</b> {eventConfig.bank.bankName}
            </p>
            <p>
              <b className="text-white">Account number:</b>{" "}
              {eventConfig.bank.accountNumber}
            </p>
            <p>
              <b className="text-white">Branch:</b> {eventConfig.bank.branch}
            </p>
          </div>
          <p className="mt-4 border-t border-zinc-800 pt-4 text-sm leading-relaxed text-zinc-400">
            {eventConfig.bank.paymentInstructions}
          </p>
        </section>
        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-8"
        >
          <p className="spam-warning rounded-xl p-4">
            ! Important: after approval, check your spam or junk folder too, for your
            ticket email.
          </p>
          <label className="block text-sm font-bold">
            SLIIT ID
            <input
              name="sliitId"
              value={sliitId}
              onChange={(e) => {
                const nextSliitId = e.target.value.toUpperCase();
                setSliitId(nextSliitId);
                if (!emailEdited)
                  setEmail(nextSliitId ? `${nextSliitId}@my.sliit.lk` : "");
                if (!bankReferenceEdited)
                  setBankReference(nextSliitId ? `DJ-${nextSliitId}` : "");
              }}
              placeholder="IT22110084"
              required
              pattern="[A-Za-z]{2}\d{8}"
              maxLength={10}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"
            />
            <span className="mt-1 block text-xs font-normal text-zinc-500">
              Use your SLIIT student ID (two letters followed by 8 digits).
            </span>
          </label>
          <label className="block text-sm font-bold">
            Name
            <input
              name="name"
              type="text"
              required
              maxLength={120}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm font-bold">
            Email
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmailEdited(true);
                setEmail(e.target.value);
              }}
              placeholder="IT22110084@my.sliit.lk"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"
            />
            <span className="mt-1 block text-xs font-normal text-zinc-500">
              This is pre-filled from your SLIIT ID, but you can change it.
            </span>
          </label>
          <label className="block text-sm font-bold">
            Phone
            <input
              name="phone"
              type="text"
              required
              maxLength={10}
              pattern="\d{10}"
              inputMode="numeric"
              onInvalid={(e) =>
                e.currentTarget.setCustomValidity(
                  "Phone number should be exactly 10 characters.",
                )
              }
              onInput={(e) => e.currentTarget.setCustomValidity("")}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm font-bold">
            Bank reference / transaction number
            <input
              name="bankReference"
              type="text"
              required
              value={bankReference}
              onChange={(e) => {
                setBankReferenceEdited(true);
                setBankReference(e.target.value);
              }}
              placeholder="DJ-IT22110084"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"
            />
            <span className="mt-1 block text-xs font-normal text-zinc-500">
              Pre-filled from your SLIIT ID. Formats like DJ-IT22110084,
              dj-ab22110084, or dj ab22110084 are accepted.
            </span>
          </label>
          <label className="block text-sm font-bold">
            Transaction date and time (Sri Lanka time)
            <input
              name="transactionAt"
              type="datetime-local"
              required
              value={transactionAt}
              onChange={(e) => setTransactionAt(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal outline-none focus:border-[var(--primary)]"
            />
            <span className="mt-1 block text-xs font-normal text-zinc-500">
              Enter when the bank transfer was made, even if you submit this
              form later.
            </span>
          </label>
          <label className="block text-sm font-bold">
            Ticket quantity
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-normal"
            >
              {Array.from(
                { length: eventConfig.maxTicketsPerOrder },
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Receipt (image or PDF, max 5MB)
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full rounded-xl border border-dashed border-zinc-700 p-4 text-sm font-normal text-zinc-400"
            />
          </label>
          <div className="border-t border-zinc-800 pt-5 text-xl font-black">
            Total: {formatMoney(qty * eventConfig.ticketPrice)}
          </div>
          {error && (
            <p className="rounded-xl bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full rounded-full bg-[var(--primary)] px-6 py-3 font-black text-zinc-950 disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      </div>
    </SiteShell>
  );
}
