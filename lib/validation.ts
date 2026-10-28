import { eventConfig } from "@/config/event";

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const allowedReceiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateOrderInput(input: { name: string; email: string; phone: string; qty: number; bankReference: string }) {
  if (!input.name.trim() || input.name.trim().length > 120) return "Enter a valid full name.";
  if (!isValidEmail(input.email)) return "Enter a valid email address.";
  if (!/^\d{10}$/.test(input.phone.trim())) return "Enter a valid 10-digit phone number.";
  if (!Number.isInteger(input.qty) || input.qty < 1 || input.qty > eventConfig.maxTicketsPerOrder) return "Invalid ticket quantity.";
  if (!input.bankReference.trim() || input.bankReference.trim().length > 100) return "Enter your bank reference.";
  return null;
}
