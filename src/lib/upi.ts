export const PAYEE_VPA = "9943316827@ybl";
export const PAYEE_NAME = "Solaimuthu";
export const PAYEE_MOBILE = "9943316827";

export function buildUpiUrl(amount: number, ref?: string, note = "KPS Bill Payment") {
  const tr = ref || `KPS${Date.now()}`;
  return (
    `upi://pay?pa=${encodeURIComponent(PAYEE_VPA)}` +
    `&pn=${encodeURIComponent(PAYEE_NAME)}` +
    (amount > 0 ? `&am=${amount.toFixed(2)}` : "") +
    `&cu=INR` +
    `&tr=${encodeURIComponent(tr)}` +
    `&tn=${encodeURIComponent(note)}`
  );
}
