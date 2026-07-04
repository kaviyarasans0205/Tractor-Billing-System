import { useEffect, useMemo, useState } from "react";
import { BillEntry, loadBills, saveBills } from "@/lib/billing-data";
import { BillTable } from "@/components/BillTable";
import { BillEditDialog } from "@/components/BillEditDialog";
import { PaymentsDialog } from "@/components/PaymentsDialog";
import { PdfExport } from "@/components/PdfExport";
import { BillFilters, Filters, emptyFilters, applyFilters } from "@/components/BillFilters";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { loadCustomers } from "@/lib/customers";

export default function BillsPage() {
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [editing, setEditing] = useState<BillEntry | null>(null);
  const [payingFor, setPayingFor] = useState<BillEntry | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    setBills(loadBills());
  }, []);
  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  const customers = useMemo(() => loadCustomers(), [bills]);
  const filtered = useMemo(
    () => applyFilters(bills, filters, customers),
    [bills, filters, customers],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">பில்கள்</h1>
          <p className="text-sm text-muted-foreground">அனைத்து பில்களும் நபர் வாரியாக</p>
        </div>
        <div className="flex gap-2">
          <PdfExport bills={filtered} />
          <Button asChild>
            <Link to="/bills/new">
              <Plus className="mr-1 h-4 w-4" />
              புதிய பில்
            </Link>
          </Button>
        </div>
      </div>

      <BillFilters value={filters} onChange={setFilters} />

      <BillTable
        bills={filtered}
        onTogglePaid={(id) =>
          setBills((prev) => prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)))
        }
        onDelete={(id) => {
          setBills((prev) => prev.filter((b) => b.id !== id));
          toast.info("பில் நீக்கப்பட்டது");
        }}
        onEdit={(id) => {
          const b = bills.find((x) => x.id === id);
          if (b) setEditing(b);
        }}
        onPay={(id) => {
          const b = bills.find((x) => x.id === id);
          if (b) setPayingFor(b);
        }}
      />

      <BillEditDialog
        bill={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={(updated) => {
          setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          setEditing(null);
          toast.success("பில் திருத்தப்பட்டது!");
        }}
      />

      <PaymentsDialog
        bill={payingFor}
        open={!!payingFor}
        onClose={() => setPayingFor(null)}
        onChange={(updated) => {
          setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          setPayingFor(updated);
        }}
      />
    </div>
  );
}
