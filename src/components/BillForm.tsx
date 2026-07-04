import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillEntry, generateId, PLOWING_TYPES, PlowingType } from "@/lib/billing-data";
import { Plus, Trash2 } from "lucide-react";
import { CustomerCombobox } from "./CustomerCombobox";
import { BillingTypeCombobox } from "./BillingTypeCombobox";
import { ensureCustomer } from "@/lib/customers";
import { nextBillNumber, nextInvoiceNumber } from "@/lib/numbering";

interface BillFormProps {
  onAdd: (bill: BillEntry) => void;
}

interface BillRow {
  key: string;
  billingType: string;
  plowingType: PlowingType | "";
  hours: string;
  minutes: string;
  amountPerHour: string;
  varavuAmount: string;
}

const emptyRow = (): BillRow => ({
  key: generateId(),
  billingType: "",
  plowingType: "",
  hours: "",
  minutes: "",
  amountPerHour: "",
  varavuAmount: "",
});

function toTamilDate(d: Date) {
  return d.toLocaleDateString("ta-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BillForm({ onAdd }: BillFormProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<BillRow[]>([emptyRow()]);

  const getGrossTotal = (row: BillRow) => {
    const totalHours = (parseFloat(row.hours) || 0) + (parseFloat(row.minutes) || 0) / 60;
    return totalHours * (parseFloat(row.amountPerHour) || 0);
  };

  const getTotal = (row: BillRow) => {
    const gross = getGrossTotal(row);
    const varavu = parseFloat(row.varavuAmount) || 0;
    return gross - varavu;
  };

  const getTotalHours = (row: BillRow) =>
    (parseFloat(row.hours) || 0) + (parseFloat(row.minutes) || 0) / 60;

  const updateRow = (index: number, field: keyof BillRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (index: number) => {
    if (rows.length > 1) setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validRows = rows.filter(
      (r) => r.plowingType && (r.hours || r.minutes) && r.amountPerHour,
    );
    if (validRows.length === 0) return;

    const customer = ensureCustomer(name.trim(), mobile.trim() || undefined);
    const date = toTamilDate(new Date(billDate));

    validRows.forEach((row) => {
      onAdd({
        id: generateId(),
        name: customer.name,
        plowingType: row.plowingType as PlowingType,
        hours: getTotalHours(row),
        amountPerHour: parseFloat(row.amountPerHour) || 0,
        varavuAmount: parseFloat(row.varavuAmount) || 0,
        totalAmount: getTotal(row),
        date,
        paid: false,
        customerId: customer.id,
        billingType: row.billingType || row.plowingType,
        billNumber: nextBillNumber(),
        invoiceNumber: nextInvoiceNumber(),
        payments: [],
        createdAt: Date.now(),
      });
    });

    setName("");
    setMobile("");
    setCustomerId(undefined);
    setBillDate(new Date().toISOString().slice(0, 10));
    setRows([emptyRow()]);
  };

  const grandTotal = rows.reduce((s, r) => s + getTotal(r), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          புதிய பில் சேர்க்க
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>வாடிக்கையாளர்</Label>
            <CustomerCombobox
              name={name}
              mobile={mobile}
              onChangeName={setName}
              onChangeMobile={setMobile}
              onSelect={(c) => {
                setName(c.name);
                setMobile(c.mobile);
                setCustomerId(c.id);
              }}
            />
          </div>
          <div className="w-full max-w-[220px] space-y-2">
            <Label>தேதி</Label>
            <Input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={row.key}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8 items-end rounded-lg border bg-muted/20 p-3"
              >
                <div className="space-y-1 lg:col-span-2">
                  <Label className="text-xs">பில்லிங் வகை</Label>
                  <BillingTypeCombobox
                    value={row.billingType}
                    onChange={(v) => updateRow(idx, "billingType", v)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">உழவு வகை</Label>
                  <Select
                    value={row.plowingType}
                    onValueChange={(v) => updateRow(idx, "plowingType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="வகை தேர்வு" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLOWING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">மணி</Label>
                  <Input type="number" min="0" value={row.hours}
                    onChange={(e) => updateRow(idx, "hours", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">நிமிடம்</Label>
                  <Input type="number" min="0" max="59" value={row.minutes}
                    onChange={(e) => updateRow(idx, "minutes", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">மணி ₹</Label>
                  <Input type="number" step="1" value={row.amountPerHour}
                    onChange={(e) => updateRow(idx, "amountPerHour", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">வரவு ₹</Label>
                  <Input type="number" step="1" value={row.varavuAmount}
                    onChange={(e) => updateRow(idx, "varavuAmount", e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex h-10 flex-1 items-center rounded-md border bg-background px-3 font-bold text-foreground">
                    ₹{getTotal(row).toLocaleString("ta-IN")}
                  </div>
                  {rows.length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => removeRow(idx)}
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 h-4 w-4" />
              வரிசை சேர்க்க
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">
                மொத்த தொகை:{" "}
                <span className="text-lg text-primary">
                  ₹{grandTotal.toLocaleString("ta-IN")}
                </span>
              </span>
              <Button type="submit">சேர்க்க</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
