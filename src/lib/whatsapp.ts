import { BillEntry } from "./billing-data";
import { buildUpiUrl } from "./upi";

export function buildWhatsappShareUrl(opts: {
  mobile?: string;
  personName: string;
  bills: BillEntry[];
}) {
  const total = opts.bills.reduce((s, b) => s + b.totalAmount, 0);
  const paid = opts.bills.filter((b) => b.paid).reduce((s, b) => s + b.totalAmount, 0);
  const pending = Math.max(0, total - paid);
  const payAmount = pending > 0 ? pending : total;
  const upi = buildUpiUrl(payAmount);

  const lines = [
    `*KPS கவர்பணை - பில்*`,
    `பெயர்: ${opts.personName}`,
    `மொத்த பில்கள்: ${opts.bills.length}`,
    `மொத்தம்: ₹${total.toLocaleString("ta-IN")}`,
    `செலுத்தியது: ₹${paid.toLocaleString("ta-IN")}`,
    `நிலுவை: ₹${pending.toLocaleString("ta-IN")}`,
    ``,
    `PhonePe / UPI மூலம் செலுத்த:`,
    upi,
    ``,
    `பெறுநர்: சோலைமுத்து · 9943316827`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  const phone = (opts.mobile || "").replace(/\D/g, "");
  const base = phone ? `https://wa.me/91${phone}` : `https://wa.me/`;
  return `${base}?text=${text}`;
}
