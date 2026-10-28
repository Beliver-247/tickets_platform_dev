import { eventConfig } from "@/config/event";
import { formatDate, formatMoney } from "@/lib/format";
import { SiteShell, ButtonLink } from "@/components/site-shell";
import { PurchaseCta } from "@/components/purchase-cta";
import { CapacityNotice } from "@/components/capacity-notice";

export default function Home() {
  return <SiteShell><section className="noise border-b border-zinc-800">
    <div className="mx-auto grid max-w-6xl min-w-0 gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] lg:items-start lg:py-28">
      <div className="min-w-0">
        <p className="mb-5 text-sm font-bold uppercase tracking-[.3em] text-[var(--accent)]">{eventConfig.tagline}</p>
        <h1 className="max-w-4xl break-words text-[clamp(3rem,8vw,7.5rem)] font-black uppercase leading-[.92] tracking-[-.05em]" style={{ overflowWrap: "anywhere" }}>{eventConfig.eventName}</h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400">{formatDate(eventConfig.date)} · Doors {eventConfig.doorsOpenTime}<br />{eventConfig.venueName}, {eventConfig.venueAddress}</p>
        <div className="mt-8 flex flex-wrap gap-3"><PurchaseCta /><ButtonLink href="/status" muted>Check an order</ButtonLink></div>
      </div>
      <div className="min-w-0 self-start rounded-3xl border border-zinc-700 bg-zinc-900/95 p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-widest text-zinc-500">Bank transfer only</p>
        <h2 className="mt-4 text-3xl font-black">{formatMoney(eventConfig.ticketPrice)} <span className="text-base font-normal text-zinc-500">per ticket</span></h2>
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-300"><p><b className="text-white">Account:</b> {eventConfig.bank.accountName}</p><p><b className="text-white">Bank:</b> {eventConfig.bank.bankName}</p><p><b className="text-white">Number:</b> {eventConfig.bank.accountNumber}</p><p><b className="text-white">Branch:</b> {eventConfig.bank.branch}</p><p className="break-words border-t border-zinc-800 pt-4" style={{ overflowWrap: "anywhere" }}>{eventConfig.bank.paymentInstructions}</p></div>
      </div>
    </div>
  </section><CapacityNotice /></SiteShell>;
}
