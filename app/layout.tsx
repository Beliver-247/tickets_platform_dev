import type { Metadata } from "next";
import { eventConfig } from "@/config/event";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: eventConfig.eventName,
  description: eventConfig.tagline,
  openGraph: {
    title: eventConfig.eventName,
    description: eventConfig.tagline,
    type: "website",
    images: [{ url: "/opengraph-image" }]
  },
  twitter: {
    card: "summary_large_image",
    title: eventConfig.eventName,
    description: eventConfig.tagline,
    images: ["/opengraph-image"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning style={{
    "--primary": eventConfig.theme.primary,
    "--accent": eventConfig.theme.accent
  } as React.CSSProperties}><script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("dj-ticket-theme");document.body.dataset.theme=t==="light"?"light":"dark"}catch(e){document.body.dataset.theme="dark"}` }} />{children}</body></html>;
}
