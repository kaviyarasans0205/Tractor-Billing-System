export const DEFAULT_BILLING_TYPES = [
  "உழவு",
  "ரோட்டேட்டர்",
  "கொக்கி கலப்பி",
  "விதைப்பு",
  "அறுவடை",
  "போக்குவரத்து",
  "மற்றவை",
];

const KEY = "kps-billing-types";

export function loadCustomBillingTypes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomBillingType(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = loadCustomBillingTypes();
  if (DEFAULT_BILLING_TYPES.includes(trimmed) || existing.includes(trimmed)) return;
  existing.push(trimmed);
  localStorage.setItem(KEY, JSON.stringify(existing));
}

export function getAllBillingTypes(): string[] {
  const custom = loadCustomBillingTypes();
  return [...DEFAULT_BILLING_TYPES, ...custom.filter((c) => !DEFAULT_BILLING_TYPES.includes(c))];
}
