import { Card, CardContent } from "@/components/ui/card";
import { BillEntry, getPaidAmount, getPendingAmount } from "@/lib/billing-data";
import { Users, IndianRupee, CheckCircle, AlertCircle } from "lucide-react";

interface BillSummaryProps {
  bills: BillEntry[];
}

export function BillSummary({ bills }: BillSummaryProps) {
  const totalAmount = bills.reduce((s, b) => s + b.totalAmount, 0);
  const paidAmount = bills.reduce((s, b) => s + getPaidAmount(b), 0);
  const pendingAmount = bills.reduce((s, b) => s + getPendingAmount(b), 0);
  const uniquePeople = new Set(bills.map((b) => b.name)).size;

  const stats = [
    { label: "மொத்த வாடிக்கையாளர்", value: uniquePeople, icon: Users, color: "text-primary" },
    { label: "மொத்த தொகை", value: `₹${totalAmount.toLocaleString("ta-IN")}`, icon: IndianRupee, color: "text-foreground" },
    { label: "செலுத்தியது", value: `₹${paidAmount.toLocaleString("ta-IN")}`, icon: CheckCircle, color: "text-success" },
    { label: "நிலுவை", value: `₹${pendingAmount.toLocaleString("ta-IN")}`, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-full bg-muted p-3 ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
