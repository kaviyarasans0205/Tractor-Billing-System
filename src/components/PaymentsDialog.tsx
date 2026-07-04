import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BillEntry,
  PaymentMethod,
  addPaymentToBill,
  getPaidAmount,
  getPendingAmount,
} from "@/lib/billing-data";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  bill: BillEntry | null;
  open: boolean;
  onClose: () => void;
  onChange: (updated: BillEntry) => void;
}

export function PaymentsDialog({ bill, open, onClose, onChange }: Props) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && bill) {
      setAmount(getPendingAmount(bill).toString());
      setMethod("Cash");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [open, bill]);

  if (!bill) return null;
  const paid = getPaidAmount(bill);
  const pending = getPendingAmount(bill);

  const addPayment = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("சரியான தொகையை உள்ளிடவும்");
      return;
    }
    const updated = addPaymentToBill(bill, { amount: amt, date, method, note });
    onChange(updated);
    toast.success("பணம் சேர்க்கப்பட்டது");
    setAmount("0");
    setNote("");
  };

  const removePayment = (id: string) => {
    const payments = (bill.payments || []).filter((p) => p.id !== id);
    const totalPaid = payments.reduce((s, x) => s + x.amount, 0);
    onChange({ ...bill, payments, paid: totalPaid >= bill.totalAmount });
    toast.info("பணம் நீக்கப்பட்டது");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            பணப்பதிவு · {bill.billNumber || bill.id.slice(0, 6)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded border p-2">
              <p className="text-xs text-muted-foreground">மொத்தம்</p>
              <p className="font-bold">₹{bill.totalAmount.toLocaleString("ta-IN")}</p>
            </div>
            <div className="rounded border p-2">
              <p className="text-xs text-muted-foreground">செலுத்தியது</p>
              <p className="font-bold text-success">₹{paid.toLocaleString("ta-IN")}</p>
            </div>
            <div className="rounded border p-2">
              <p className="text-xs text-muted-foreground">நிலுவை</p>
              <p className="font-bold text-destructive">₹{pending.toLocaleString("ta-IN")}</p>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <p className="mb-2 text-sm font-semibold">பணப்பதிவு வரலாறு</p>
            {(bill.payments || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">பணப்பதிவு இல்லை</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {(bill.payments || []).map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span>
                      ₹{p.amount.toLocaleString("ta-IN")} · {p.method} · {p.date}
                      {p.note ? ` · ${p.note}` : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePayment(p.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>தொகை</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>வழி</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>தேதி</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>குறிப்பு</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            மூடு
          </Button>
          <Button onClick={addPayment}>பணம் சேர்</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
