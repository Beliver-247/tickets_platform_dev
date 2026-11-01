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

export function isValidOrderLookup(value: string) {
  return isValidEmail(value) || isValidSliitId(value);
}

export function normalizeBankReference(bankReference: string) {
  const trimmed = bankReference.trim().toUpperCase();
  const match = trimmed.match(/^DJ[-\s]?([A-Z]{2}\d{8})$/);
  return match ? `DJ-${match[1]}` : trimmed;
}

export function parseTransactionAt(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return null;
  const [date, time] = trimmed.split("T");
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(parsed).replace(", ", "T");
  return formatted === `${date}T${time}` ? parsed : null;
}

export function validateOrderInput(input: { name: string; email: string; phone: string; qty: number; bankReference: string; sliitId: string; transactionAt: string }) {
  if (!input.name.trim() || input.name.trim().length > 120) return "Enter a valid full name.";
  if (!isValidEmail(input.email)) return "Enter a valid email address.";
  if (!/^\d{10}$/.test(input.phone.trim())) return "Enter a valid 10-digit phone number.";
  if (!Number.isInteger(input.qty) || input.qty < 1 || input.qty > eventConfig.maxTicketsPerOrder) return "Invalid ticket quantity.";
  if (!isValidSliitId(input.sliitId)) return "Enter a valid SLIIT ID (two letters followed by 8 digits).";
  if (!BANK_REFERENCE_PATTERN.test(input.bankReference.trim())) return "Bank reference must start with DJ and include your 2-letter, 8-digit SLIIT ID.";
  const transactionAt = parseTransactionAt(input.transactionAt);
  if (!transactionAt) return "Enter a valid transaction date and time.";
  if (transactionAt.getTime() > Date.now()) return "Transaction time cannot be in the future.";
  return null;
}
