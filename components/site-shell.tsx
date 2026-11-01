import Link from "next/link";
import { eventConfig } from "@/config/event";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-foreground)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5">
        <Link href="/" className="min-w-0 truncate font-black tracking-tight">
          {eventConfig.eventName}
        </Link>
        <nav className="flex shrink-0 items-center gap-3 text-sm text-[var(--theme-muted)]">
          <Link href="/status">Check order</Link>
          <ThemeToggle />
        </nav>
      </header>
      {children}
      <footer className="mx-auto max-w-6xl px-5 py-12 text-sm text-[var(--theme-muted)]">
        Need help? {eventConfig.contact.supportEmail} ·{" "}
        {eventConfig.contact.supportContacts.map((contact, index) => (
          <span key={contact.phone}>
            {index > 0 && " · "}
            <a
              href={`tel:${contact.phone}`}
              className="text-[var(--primary)] underline-offset-2 hover:underline"
            >
              {contact.name}: {contact.phone}
            </a>
          </span>
        ))}
      </footer>
    </main>
  );
}

export function ButtonLink({
  href,
  children,
  muted = false,
}: {
  href: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 font-bold transition ${muted ? "bg-zinc-800 text-[var(--theme-foreground)]" : "bg-[var(--primary)] text-zinc-950 hover:opacity-90"}`}
    >
      {children}
    </Link>
  );
}
