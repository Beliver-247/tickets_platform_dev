"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function AdminLogin() {
  const router = useRouter(), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setLoading(true); const form = new FormData(e.currentTarget); const { error } = await createClient().auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) }); if (error) setError("Invalid credentials or account not authorized."); else router.push("/admin/orders"); setLoading(false); }
  return <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-zinc-100"><form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-7"><h1 className="text-3xl font-black">Admin login</h1><input name="email" type="email" required placeholder="Email" className="w-full rounded-xl bg-zinc-950 px-4 py-3" /><input name="password" type="password" required placeholder="Password" className="w-full rounded-xl bg-zinc-950 px-4 py-3" />{error && <p className="text-sm text-red-300">{error}</p>}<button disabled={loading} className="w-full rounded-full bg-[var(--primary)] py-3 font-black text-zinc-950">{loading ? "Signing in…" : "Sign in"}</button></form></main>;
}
