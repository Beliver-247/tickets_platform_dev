"use client";

import { useEffect, useState } from "react";
import { eventConfig } from "@/config/event";
import { formatMoney } from "@/lib/format";
import { ButtonLink } from "@/components/site-shell";

export function PurchaseCta() {
  const [soldOut, setSoldOut] = useState(false);
  useEffect(() => {
    if (!eventConfig.totalCapacity) return;
    fetch("/api/capacity").then(response => response.ok ? response.json() : null).then(data => data && setSoldOut(data.soldOut)).catch(() => undefined);
  }, []);
  if (!eventConfig.salesOpen) return <span className="rounded-full bg-zinc-800 px-6 py-3 font-bold text-zinc-100">Sales closed</span>;
  if (soldOut) return <span className="rounded-full bg-zinc-800 px-6 py-3 font-bold text-[var(--accent)]">Sold out</span>;
  return <ButtonLink href="/buy">Buy ticket · {formatMoney(eventConfig.ticketPrice)}</ButtonLink>;
}
