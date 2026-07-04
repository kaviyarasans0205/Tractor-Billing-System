import { loadBills, saveBills, BillEntry } from "./billing-data";
import { ensureCustomer } from "./customers";
import { ensureBillCounterAtLeast, ensureInvoiceCounterAtLeast } from "./numbering";

const FLAG = "kps-migrated-v1";

export function runMigrations() {
  if (localStorage.getItem(FLAG)) return;
  const bills = loadBills();
  let billSeq = 0;
  const invSeqByYear = new Map<number, number>();

  const migrated: BillEntry[] = bills.map((b) => {
    const customer = ensureCustomer(b.name);
    const next = { ...b } as BillEntry;
    if (!next.customerId) next.customerId = customer.id;
    if (!next.billingType) next.billingType = b.plowingType;
    if (!next.billNumber) {
      billSeq += 1;
      next.billNumber = `KPS-B-${billSeq.toString().padStart(6, "0")}`;
    }
    if (!next.invoiceNumber) {
      const year = new Date(b.createdAt || Date.now()).getFullYear();
      const cur = (invSeqByYear.get(year) || 0) + 1;
      invSeqByYear.set(year, cur);
      next.invoiceNumber = `KPS-INV-${year}-${cur.toString().padStart(6, "0")}`;
    }
    if (!next.payments) {
      next.payments = b.paid
        ? [{ id: `mig-${b.id}`, amount: b.totalAmount, date: b.date, method: "Cash" }]
        : [];
    }
    if (!next.createdAt) next.createdAt = Date.now();
    return next;
  });

  saveBills(migrated);
  ensureBillCounterAtLeast(billSeq);
  invSeqByYear.forEach((seq, year) => ensureInvoiceCounterAtLeast(year, seq));
  localStorage.setItem(FLAG, "1");
}
