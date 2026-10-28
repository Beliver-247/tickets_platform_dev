"use client";

import { useEffect, useState } from "react";
import { eventConfig } from "@/config/event";

export function CapacityNotice() {
  const [soldOut, setSoldOut] = useState(false);
  useEffect(() => { if (!eventConfig.totalCapacity) return; fetch("/api/capacity").then(r => r.ok ? r.json() : null).then(data => data && setSoldOut(data.soldOut)).catch(() => undefined); }, []);
  if (!soldOut) return null;
  return <div className="mx-auto max-w-6xl px-5 py-5 text-center font-bold text-[var(--accent)]">Sold out</div>;
}
