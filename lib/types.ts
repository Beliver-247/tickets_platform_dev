export type OrderStatus = "pending" | "approved" | "rejected";

export type Order = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  qty: number;
  bank_reference: string;
  sliit_id: string | null;
  receipt_path: string;
  status: OrderStatus;
  rejection_reason: string | null;
  ticket_number: string | null;
  ticket_start: number;
  checked_in_count: number;
  checked_in_tickets: number[];
  checked_in_at: string | null;
  created_at: string;
  transaction_at: string;
  approved_at: string | null;
  approved_by: string | null;
};
