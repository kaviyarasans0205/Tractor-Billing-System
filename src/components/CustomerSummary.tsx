import { Card, CardContent } from "@/components/ui/card";
import { BillEntry, getPaidAmount, getPendingAmount } from "@/lib/billing-data";
import { FileText, IndianRupee, CheckCircle, AlertCircle, Calendar } from "lucide-react";

interface Props {
  bills: BillEntry[];
}

export function CustomerSummary({ bills }: Props) {
  const total = bills.reduce((s, b) => s + b.totalAmount, 0);
  const paid = bills.reduce((s, b) => s + getPaidAmount(b), 0);
  const pending = bills.reduce((s, b) => s + getPendingAmount(b), 0);
  const lastTs = bills.reduce((m, b) => Math.max(m, b.createdAt || 0), 0);
  const lastDate = lastTs
    ? new Date(lastTs).toLocaleDateString("ta-IN", { day: "numeric", month: "short", year: "numeric" })
    : bills[0]?.date || "—";

  const items = [
    { label: "மொத்த பில்கள்", value: bills.length, icon: FileText, color: "text-primary" },
    { label: "மொத்த தொகை", value: `₹${total.toLocaleString("ta-IN")}`, icon: IndianRupee, color: "text-foreground" },
    { label: "செலுத்தியது", value: `₹${paid.toLocaleString("ta-IN")}`, icon: CheckCircle, color: "text-success" },
    { label: "நிலுவை", value: `₹${pending.toLocaleString("ta-IN")}`, icon: AlertCircle, color: "text-destructive" },
    { label: "கடைசி பில்", value: lastDate, icon: Calendar, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((i) => (
        <Card key={i.label}>
          <CardContent className="flex items-center gap-3 p-3">
            <div className={`rounded-full bg-muted p-2 ${i.color}`}>
              <i.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{i.label}</p>
              <p className="truncate text-base font-bold">{i.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
