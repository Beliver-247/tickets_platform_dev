import { eventConfig } from "@/config/event";

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const allowedReceiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const SLIIT_ID_PATTERN = /^[A-Z]{2}\d{8}$/i;
export const BANK_REFERENCE_PATTERN = /^DJ[-\s]?[A-Z]{2}\d{8}$/i;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidSliitId(sliitId: string) {
  return SLIIT_ID_PATTERN.test(sliitId.trim());
}

export function normalizeBankReference(bankReference: string) {
  const trimmed = bankReference.trim().toUpperCase();
  const match = trimmed.match(/^DJ[-\s]?([A-Z]{2}\d{8})$/);
  return match ? `DJ-${match[1]}` : trimmed;
}

export function validateOrderInput(input: { name: string; email: string; phone: string; qty: number; bankReference: string; sliitId: string }) {
  if (!input.name.trim() || input.name.trim().length > 120) return "Enter a valid full name.";
  if (!isValidEmail(input.email)) return "Enter a valid email address.";
  if (!/^\d{10}$/.test(input.phone.trim())) return "Enter a valid 10-digit phone number.";
  if (!Number.isInteger(input.qty) || input.qty < 1 || input.qty > eventConfig.maxTicketsPerOrder) return "Invalid ticket quantity.";
  if (!isValidSliitId(input.sliitId)) return "Enter a valid SLIIT ID (two letters followed by 8 digits).";
  if (!BANK_REFERENCE_PATTERN.test(input.bankReference.trim())) return "Bank reference must start with DJ and include your 2-letter, 8-digit SLIIT ID.";
  return null;
}
