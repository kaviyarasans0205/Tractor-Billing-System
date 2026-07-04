import { generateId } from "./billing-data";

export interface CustomerInfo {
  id?: string;
  name: string;
  mobile?: string;
  village?: string;
  createdAt?: number;
  updatedAt: number;
}

const KEY = "kps-customers";

export function loadCustomers(): Record<string, CustomerInfo> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomers(data: Record<string, CustomerInfo>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function listCustomers(): CustomerInfo[] {
  return Object.values(loadCustomers()).sort((a, b) => a.name.localeCompare(b.name, "ta"));
}

export function upsertCustomer(info: Omit<CustomerInfo, "updatedAt">): CustomerInfo {
  const all = loadCustomers();
  const existing = all[info.name];
  const merged: CustomerInfo = {
    ...existing,
    ...info,
    id: existing?.id || info.id || generateId(),
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  all[info.name] = merged;
  saveCustomers(all);
  return merged;
}

export function getCustomer(name: string): CustomerInfo | undefined {
  return loadCustomers()[name];
}

export function findCustomerByMobile(mobile: string): CustomerInfo | undefined {
  if (!mobile) return undefined;
  return listCustomers().find((c) => (c.mobile || "").trim() === mobile.trim());
}

export function deleteCustomer(name: string) {
  const all = loadCustomers();
  delete all[name];
  saveCustomers(all);
}

/** Ensure a customer exists by name (+optional mobile). Returns record. */
export function ensureCustomer(name: string, mobile?: string, village?: string): CustomerInfo {
  const trimmed = name.trim();
  const existing = getCustomer(trimmed);
  if (existing) {
    // Enrich mobile/village if newly provided
    if ((mobile && !existing.mobile) || (village && !existing.village)) {
      return upsertCustomer({
        ...existing,
        name: trimmed,
        mobile: existing.mobile || mobile,
        village: existing.village || village,
      });
    }
    return existing;
  }
  return upsertCustomer({ name: trimmed, mobile, village });
}
