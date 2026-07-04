import { useEffect, useMemo, useState } from "react";
import { BillEntry, loadBills } from "@/lib/billing-data";
import { CustomerInfo, loadCustomers } from "@/lib/customers";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, MapPin, ChevronRight } from "lucide-react";

interface Row {
  name: string;
  info?: CustomerInfo;
  total: number;
  pending: number;
  count: number;
}

export default function CustomersPage() {
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [customers, setCustomers] = useState<Record<string, CustomerInfo>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    setBills(loadBills());
    setCustomers(loadCustomers());
  }, []);

  const rows: Row[] = useMemo(() => {
    const map = new Map<string, Row>();
    for (const b of bills) {
      const r = map.get(b.name) || {
        name: b.name,
        info: customers[b.name],
        total: 0,
        pending: 0,
        count: 0,
      };
      r.total += b.totalAmount;
      if (!b.paid) r.pending += b.totalAmount;
      r.count += 1;
      map.set(b.name, r);
    }
    // include customers with no bills
    Object.values(customers).forEach((c) => {
      if (!map.has(c.name))
        map.set(c.name, { name: c.name, info: c, total: 0, pending: 0, count: 0 });
    });
    const arr = Array.from(map.values());
    const s = q.trim().toLowerCase();
    return (s
      ? arr.filter(
          (r) =>
            r.name.toLowerCase().includes(s) ||
            r.info?.mobile?.includes(s) ||
            r.info?.village?.toLowerCase().includes(s),
        )
      : arr
    ).sort((a, b) => b.pending - a.pending || b.total - a.total);
  }, [bills, customers, q]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Users className="h-6 w-6" />
          வாடிக்கையாளர்கள்
        </h1>
        <p className="text-sm text-muted-foreground">பெயர் / மொபைல் / கிராமம் தேடு</p>
      </div>
      <Input
        placeholder="தேடு..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">வாடிக்கையாளர் இல்லை</p>
        )}
        {rows.map((r) => (
          <Link key={r.name} to={`/customers/${encodeURIComponent(r.name)}`}>
            <Card className="transition hover:border-primary hover:shadow-md">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{r.name}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {r.info?.mobile && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {r.info.mobile}
                    </p>
                  )}
                  {r.info?.village && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {r.info.village}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">
                    {r.count} பில்
                  </span>
                  <div className="flex gap-1">
                    <Badge variant="secondary">₹{r.total.toLocaleString("ta-IN")}</Badge>
                    {r.pending > 0 && (
                      <Badge variant="destructive">₹{r.pending.toLocaleString("ta-IN")}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
