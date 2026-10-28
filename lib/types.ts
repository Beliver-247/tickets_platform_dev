export type OrderStatus = "pending" | "approved" | "rejected";
export type PaymentMethod = "bank_transfer" | "payhere";

export type Order = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  qty: number;
  bank_reference: string;
  receipt_path: string;
  status: OrderStatus;
  rejection_reason: string | null;
  ticket_number: string | null;
  checked_in_count: number;
  checked_in_at: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  payment_method: PaymentMethod;
  payment_amount: string | null;
};
