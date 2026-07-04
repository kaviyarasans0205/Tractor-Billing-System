import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllBillingTypes } from "@/lib/billing-types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface Filters {
  q: string;
  billingType: string; // "" = all
  status: "all" | "paid" | "partial" | "pending";
  from: string;
  to: string;
}

export const emptyFilters: Filters = {
  q: "",
  billingType: "",
  status: "all",
  from: "",
  to: "",
};

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
}

export function BillFilters({ value, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
  const types = getAllBillingTypes();

  return (
    <div className="grid gap-3 rounded-lg border bg-card/50 p-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1 lg:col-span-2">
        <Label className="text-xs">தேடு (பெயர்/மொபைல்/பில்#/இன்வாய்ஸ்#)</Label>
        <Input value={value.q} onChange={(e) => set({ q: e.target.value })} placeholder="தேடு..." />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">பில்லிங் வகை</Label>
        <Select value={value.billingType || "all"} onValueChange={(v) => set({ billingType: v === "all" ? "" : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">அனைத்தும்</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">நிலை</Label>
        <Select value={value.status} onValueChange={(v) => set({ status: v as Filters["status"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">அனைத்தும்</SelectItem>
            <SelectItem value="paid">செலுத்தியது</SelectItem>
            <SelectItem value="partial">பகுதி</SelectItem>
            <SelectItem value="pending">நிலுவை</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:col-span-1">
        <div className="space-y-1">
          <Label className="text-xs">முதல்</Label>
          <Input type="date" value={value.from} onChange={(e) => set({ from: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">வரை</Label>
          <Input type="date" value={value.to} onChange={(e) => set({ to: e.target.value })} />
        </div>
      </div>
      <div className="flex items-end lg:col-span-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(emptyFilters)}
          className="ml-auto text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" /> Filter அழி
        </Button>
      </div>
    </div>
  );
}

/** Apply filters over a bill list. Uses customer directory for mobile match. */
export function applyFilters(
  bills: import("@/lib/billing-data").BillEntry[],
  filters: Filters,
  customers: Record<string, { mobile?: string }>,
) {
  const { q, billingType, status, from, to } = filters;
  const ql = q.trim().toLowerCase();

  const parseDate = (s: string) => {
    // The stored date is Tamil formatted. Prefer createdAt fallback.
    return null as unknown; // date-range check below uses createdAt when available
  };
  const fromT = from ? new Date(from).getTime() : -Infinity;
  const toT = to ? new Date(to).getTime() + 86_400_000 : Infinity;

  return bills.filter((b) => {
    if (billingType && (b.billingType || b.plowingType) !== billingType) return false;

    const status_ =
      b.payments && b.payments.length
        ? b.payments.reduce((s, p) => s + p.amount, 0) >= b.totalAmount
          ? "paid"
          : "partial"
        : b.paid
          ? "paid"
          : "pending";
    if (status !== "all" && status_ !== status) return false;

    if (from || to) {
      const t = b.createdAt || 0;
      if (t < fromT || t > toT) return false;
    }

    if (ql) {
      const mobile = customers[b.name]?.mobile || "";
      const hay = [
        b.name,
        mobile,
        b.billNumber || "",
        b.invoiceNumber || "",
        b.billingType || b.plowingType,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(ql)) return false;
    }
    return true;
  });
}
