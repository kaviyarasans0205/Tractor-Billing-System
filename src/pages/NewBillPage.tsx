import { useEffect, useState } from "react";
import { BillEntry, loadBills, saveBills } from "@/lib/billing-data";
import { BillForm } from "@/components/BillForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function NewBillPage() {
  const [bills, setBills] = useState<BillEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setBills(loadBills());
  }, []);

  const handleAdd = (bill: BillEntry) => {
    const next = [...bills, bill];
    setBills(next);
    saveBills(next);
    toast.success("பில் சேர்க்கப்பட்டது!");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">புதிய பில்</h1>
        <p className="text-sm text-muted-foreground">
          ஒரே படிவத்தில் பல வரிசைகள் சேர்க்கலாம்
        </p>
      </div>
      <BillForm onAdd={handleAdd} />
      <div className="text-right">
        <button
          onClick={() => navigate("/bills")}
          className="text-sm text-primary underline"
        >
          பில்கள் பட்டியலுக்கு செல்
        </button>
      </div>
    </div>
  );
}
