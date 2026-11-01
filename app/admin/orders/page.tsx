"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ThemeToggle } from "@/components/theme-toggle";
export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]),
    [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [transactionDate, setTransactionDate] = useState(""),
    [fromDate, setFromDate] = useState(""),
    [toDate, setToDate] = useState(""),
    [sliitSearch, setSliitSearch] = useState(""),
    [transactionTime, setTransactionTime] = useState(""),
    [filtersOpen, setFiltersOpen] = useState(false),
    [transactionSort, setTransactionSort] = useState<"newest" | "oldest">(
      "newest",
    );
  async function load() {
    const r = await fetch("/api/admin/orders");
    const d = await r.json();
    if (r.ok) setOrders(d.orders);
    else setError(d.error ?? "Could not load orders.");
  }
  useEffect(() => {
    load();
  }, []);
  async function action(path: string, id: string, reason?: string) {
    setBusy(id);
    const r = await fetch(`/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, reason }),
    });
    const d = await r.json();
    if (!r.ok) setError(d.error);
    else if (d.warning) setError(d.warning);
    await load();
    setBusy("");
  }
  async function receipt(id: string) {
    const r = await fetch(`/api/admin/receipt?orderId=${id}`);
    const d = await r.json();
    if (r.ok) window.open(d.url, "_blank");
    else setError(d.error);
  }
  const visible = orders
      .filter((o) => {
        if (o.status !== tab) return false;
        if (
          sliitSearch &&
          !o.sliit_id?.toLowerCase().includes(sliitSearch.toLowerCase().trim())
        )
          return false;
        const date = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Colombo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(o.transaction_at));
        if (transactionDate && date !== transactionDate) return false;
        if (!transactionDate && fromDate && date < fromDate) return false;
        if (!transactionDate && toDate && date > toDate) return false;
        if (
          transactionTime &&
          new Date(o.transaction_at).getTime() !==
            new Date(`${transactionTime}:00+05:30`).getTime()
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        const difference =
          new Date(a.transaction_at).getTime() -
          new Date(b.transaction_at).getTime();
        return transactionSort === "newest" ? -difference : difference;
      }),
    referenceCounts = orders.reduce<Record<string, number>>(
      (counts, order) => ({
        ...counts,
        [order.bank_reference.toLowerCase()]:
          (counts[order.bank_reference.toLowerCase()] ?? 0) + 1,
      }),
      {},
    );
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black">Orders</h1>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <ThemeToggle />
            <a
              href="/admin/checkin"
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
            >
              Check-in
            </a>
            <button
              onClick={() =>
                createClient()
                  .auth.signOut()
                  .then(() => (location.href = "/admin/login"))
              }
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="mt-7 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["pending", "approved", "rejected"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-2 text-sm capitalize ${tab === item ? "bg-[var(--primary)] text-zinc-950" : "bg-zinc-800"}`}
              >
                {item} ({orders.filter((o) => o.status === item).length})
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm font-semibold sm:w-fit"
            >
              <span>{filtersOpen ? "Hide filters" : "Show filters"}</span>
              <span className="ml-3 text-lg leading-none" aria-hidden="true">
                {filtersOpen ? "⌃" : "☰"}
              </span>
            </button>
            <label className="flex w-full flex-col gap-1 text-sm font-semibold sm:w-56">
              Sort by transaction time
              <select
                value={transactionSort}
                onChange={(e) =>
                  setTransactionSort(
                    e.target.value === "oldest" ? "oldest" : "newest",
                  )
                }
                className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
            <label className="flex w-full flex-col gap-1 text-sm font-semibold sm:w-64">
              Transaction date and time
              <input
                type="datetime-local"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                className="date-filter-input w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2"
              />
            </label>
            <button
              onClick={() => {
                setTransactionDate("");
                setFromDate("");
                setToDate("");
                setTransactionTime("");
                setTransactionSort("newest");
                setSliitSearch("");
              }}
              className="w-full rounded-full bg-zinc-800 px-4 py-2 text-sm sm:w-fit"
            >
              Clear filters
            </button>
          </div>
          {filtersOpen && (
            <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">
                Search by SLIIT ID
                <input
                  type="search"
                  value={sliitSearch}
                  onChange={(e) => setSliitSearch(e.target.value)}
                  placeholder="e.g. IT22110084"
                  className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Day
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="date-filter-input w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                From
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled={Boolean(transactionDate)}
                  className="date-filter-input w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 disabled:opacity-50"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                To
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={Boolean(transactionDate)}
                  className="date-filter-input w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 disabled:opacity-50"
                />
              </label>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-red-950 p-3 text-red-300">{error}</p>
        )}
        <div className="mt-5 grid gap-3">
          {visible.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-bold">{order.name}</h2>
                  <p className="text-sm text-zinc-400">
                    {order.email} · {order.phone} · {order.qty} ticket(s)
                  </p>
                  {order.sliit_id && (
                    <p className="text-sm text-zinc-300">
                      SLIIT ID: <b>{order.sliit_id}</b>
                    </p>
                  )}
                  <p className="mt-2 text-sm">
                    Ref: <b>{order.bank_reference}</b>{" "}
                    {referenceCounts[order.bank_reference.toLowerCase()] >
                      1 && (
                      <span className="text-yellow-300">
                        Duplicate reference warning
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Transaction: {formatDate(order.transaction_at)} · Submitted:{" "}
                    {formatDate(order.created_at)}
                  </p>
                  {tab === "rejected" && order.rejection_reason && (
                    <p className="mt-3 rounded-xl bg-red-950 p-3 text-sm text-red-300">
                      Rejection reason: {order.rejection_reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <button
                    onClick={() => receipt(order.id)}
                    className="admin-action admin-action-receipt rounded-full px-3 py-2 text-sm"
                  >
                    Receipt
                  </button>
                  {(tab === "pending" || tab === "rejected") && (
                    <button
                      disabled={busy === order.id}
                      onClick={() => action("approve", order.id)}
                      className="admin-action admin-action-approve rounded-full px-3 py-2 text-sm font-bold"
                    >
                      Approve
                    </button>
                  )}
                  {tab !== "rejected" && (
                    <button
                      disabled={busy === order.id}
                      onClick={() =>
                        action(
                          "reject",
                          order.id,
                          prompt("Reason (optional):") ??
                            "Payment could not be verified.",
                        )
                      }
                      className="admin-action admin-action-reject rounded-full px-3 py-2 text-sm"
                    >
                      Reject
                    </button>
                  )}
                  {tab !== "pending" && (
                    <button
                      disabled={busy === order.id}
                      onClick={() => action("pending", order.id)}
                      className="admin-action admin-action-receipt rounded-full px-3 py-2 text-sm"
                    >
                      Move to pending
                    </button>
                  )}
                  {tab === "approved" && (
                    <button
                      onClick={() => action("resend", order.id)}
                      className="admin-action admin-action-receipt rounded-full px-3 py-2 text-sm"
                    >
                      Resend email
                    </button>
                  )}
                </div>
              </div>
              {order.ticket_number && (
                <p className="mt-3 font-black text-[var(--primary)]">
                  {order.ticket_number}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
