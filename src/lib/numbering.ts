const BILL_KEY = "kps-bill-counter";
const INV_KEY = "kps-invoice-counter"; // stores { year, seq }

function pad(n: number, w = 6) {
  return n.toString().padStart(w, "0");
}

export function nextBillNumber(): string {
  const cur = parseInt(localStorage.getItem(BILL_KEY) || "0", 10) || 0;
  const next = cur + 1;
  localStorage.setItem(BILL_KEY, String(next));
  return `KPS-B-${pad(next)}`;
}

export function nextInvoiceNumber(): string {
  const year = new Date().getFullYear();
  let seq = 0;
  try {
    const raw = localStorage.getItem(INV_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.year === year) seq = parsed.seq || 0;
    }
  } catch {
    /* ignore */
  }
  seq += 1;
  localStorage.setItem(INV_KEY, JSON.stringify({ year, seq }));
  return `KPS-INV-${year}-${pad(seq)}`;
}

/** Ensure counters are at least at N (used by migration). */
export function ensureBillCounterAtLeast(n: number) {
  const cur = parseInt(localStorage.getItem(BILL_KEY) || "0", 10) || 0;
  if (n > cur) localStorage.setItem(BILL_KEY, String(n));
}

export function ensureInvoiceCounterAtLeast(year: number, n: number) {
  let cur = { year, seq: 0 };
  try {
    const raw = localStorage.getItem(INV_KEY);
    if (raw) cur = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  if (cur.year !== year) cur = { year, seq: 0 };
  if (n > cur.seq) cur.seq = n;
  localStorage.setItem(INV_KEY, JSON.stringify(cur));
}
