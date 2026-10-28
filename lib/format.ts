import { eventConfig } from "@/config/event";

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: eventConfig.currency }).format(amount);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}
