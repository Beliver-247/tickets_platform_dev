import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
export default function ConfirmationPage() { return <SiteShell><div className="mx-auto max-w-xl px-5 py-24 text-center"><div className="text-6xl">✓</div><h1 className="mt-6 text-4xl font-black">Request received</h1><p className="mt-4 text-zinc-400">We'll verify your payment and email your ticket. Check your spam folder.</p><Link className="mt-8 inline-block text-[var(--primary)] underline" href="/status">Check order status</Link></div></SiteShell>; }
