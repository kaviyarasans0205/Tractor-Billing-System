import { useEffect, useMemo, useState } from "react";
import { BillEntry, loadBills } from "@/lib/billing-data";
import { BillSummary } from "@/components/BillSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [bills, setBills] = useState<BillEntry[]>([]);

  useEffect(() => {
    setBills(loadBills());
  }, []);

  const recent = useMemo(
    () => [...bills].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6),
    [bills],
  );

  const perPerson = useMemo(() => {
    const map = new Map<string, { name: string; total: number; pending: number }>();
    for (const b of bills) {
      const cur = map.get(b.name) || { name: b.name, total: 0, pending: 0 };
      cur.total += b.totalAmount;
      const paid = (b.payments && b.payments.length)
        ? b.payments.reduce((s, p) => s + p.amount, 0)
        : (b.paid ? b.totalAmount : 0);
      cur.pending += Math.max(0, b.totalAmount - paid);
      map.set(b.name, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [bills]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">டாஷ்போர்டு</h1>
          <p className="text-sm text-muted-foreground">
            வணக்கம், சோலைமுத்து — உங்கள் பில்லிங் சுருக்கம்
          </p>
        </div>
        <Button asChild>
          <Link to="/bills/new">
            <Plus className="mr-1 h-4 w-4" />
            புதிய பில்
          </Link>
        </Button>
      </div>

      <BillSummary bills={bills} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">முதன்மை நபர்கள் — வருமானம்</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {perPerson.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                தரவு இல்லை
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perPerson}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => `₹${v.toLocaleString("ta-IN")}`}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="மொத்தம்" />
                  <Bar dataKey="pending" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} name="நிலுவை" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">சமீபத்திய பில்கள்</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link to="/bills">
                எல்லாம் <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">பில் இல்லை</p>
            )}
            {recent.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-md border bg-card p-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.plowingType} · {b.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{b.totalAmount.toLocaleString("ta-IN")}</p>
                  <p className={`text-xs ${b.paid ? "text-success" : "text-destructive"}`}>
                    {b.paid ? "செலுத்தியது" : "நிலுவை"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
