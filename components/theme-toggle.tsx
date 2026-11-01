"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dj-ticket-theme";

export function ThemeToggle() {
  const [light, setLight] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const isLight = saved ? saved === "light" : true;
    document.body.dataset.theme = isLight ? "light" : "dark";
    setLight(isLight);
  }, []);

  function toggle() {
    const nextLight = !light;
    document.body.dataset.theme = nextLight ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, nextLight ? "light" : "dark");
    setLight(nextLight);
  }

  return <button type="button" onClick={toggle} aria-label={`Switch to ${light ? "dark" : "light"} mode`} className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-foreground)]">
    {light ? "☾ Dark" : "☀ Light"}
  </button>;
}
