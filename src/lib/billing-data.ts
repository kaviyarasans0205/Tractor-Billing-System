export const PLOWING_TYPES = [
  "ரோட்டேட்டர்",
  "கொக்கி கலப்பி",
  "அஞ்சு கலப்பி",
  "சட்டி கலப்பி",
  "பருத்தி மேலர்",
  "நன்செய்",
  "நெல்",
  "சோளம்",
  "சோளம் அடித்தல்",
] as const;

export type PlowingType = typeof PLOWING_TYPES[number];

export type PaymentMethod = "Cash" | "UPI" | "Bank" | "Other";

export interface BillPayment {
  id: string;
  amount: number;
  date: string; // ISO or Tamil date
  method: PaymentMethod;
  note?: string;
}

export interface BillEntry {
  id: string;
  name: string;
  plowingType: PlowingType;
  hours: number;
  amountPerHour: number;
  varavuAmount?: number;
  totalAmount: number;
  date: string;
  paid: boolean;
  // Extensions (all optional for back-compat)
  customerId?: string;
  billingType?: string;
  billNumber?: string;
  invoiceNumber?: string;
  payments?: BillPayment[];
  createdAt?: number;
}

const STORAGE_KEY = "tractor-billing-data";

export function loadBills(): BillEntry[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBills(bills: BillEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ---------- Payment helpers ----------
export function getPaidAmount(b: BillEntry): number {
  if (b.payments && b.payments.length > 0) {
    return b.payments.reduce((s, p) => s + (p.amount || 0), 0);
  }
  return b.paid ? b.totalAmount : 0;
}

export function getPendingAmount(b: BillEntry): number {
  return Math.max(0, b.totalAmount - getPaidAmount(b));
}

export function getPaymentStatus(b: BillEntry): "paid" | "partial" | "pending" {
  const paid = getPaidAmount(b);
  if (paid <= 0) return "pending";
  if (paid >= b.totalAmount) return "paid";
  return "partial";
}

export function addPaymentToBill(b: BillEntry, p: Omit<BillPayment, "id">): BillEntry {
  const payments = [...(b.payments || []), { ...p, id: generateId() }];
  const totalPaid = payments.reduce((s, x) => s + (x.amount || 0), 0);
  return { ...b, payments, paid: totalPaid >= b.totalAmount };
}

export function getBillingType(b: BillEntry): string {
  return b.billingType || b.plowingType;
}
