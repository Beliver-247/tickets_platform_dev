import Link from "next/link";
import { eventConfig } from "@/config/event";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-zinc-950 text-zinc-100">
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5">
      <Link href="/" className="min-w-0 truncate font-black tracking-tight">{eventConfig.eventName}</Link>
      <nav className="flex shrink-0 gap-4 text-sm text-zinc-400"><Link href="/status">Check order</Link></nav>
    </header>
    {children}
    <footer className="mx-auto max-w-6xl px-5 py-12 text-sm text-zinc-500">Need help? {eventConfig.contact.supportEmail} · {eventConfig.contact.supportPhone}</footer>
  </main>;
}

export function ButtonLink({ href, children, muted = false }: { href: string; children: React.ReactNode; muted?: boolean }) {
  return <Link href={href} className={`inline-flex items-center justify-center rounded-full px-6 py-3 font-bold transition ${muted ? "bg-zinc-800" : "bg-[var(--primary)] hover:opacity-90"}`} style={{ color: muted ? "#d4d4d8" : "#09090b" }}>{children}</Link>;
}
