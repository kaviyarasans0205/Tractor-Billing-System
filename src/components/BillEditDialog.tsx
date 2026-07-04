import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillEntry, PLOWING_TYPES, PlowingType } from "@/lib/billing-data";
import { BillingTypeCombobox } from "./BillingTypeCombobox";

interface BillEditDialogProps {
  bill: BillEntry | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: BillEntry) => void;
}

export function BillEditDialog({ bill, open, onClose, onSave }: BillEditDialogProps) {
  const [name, setName] = useState("");
  const [billingType, setBillingType] = useState("");
  const [plowingType, setPlowingType] = useState<PlowingType | "">("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [amountPerHour, setAmountPerHour] = useState("");
  const [varavuAmount, setVaravuAmount] = useState("");

  const resetForm = (b: BillEntry) => {
    setName(b.name);
    setBillingType(b.billingType || b.plowingType);
    setPlowingType(b.plowingType);
    const wholeHours = Math.floor(b.hours);
    const mins = Math.round((b.hours - wholeHours) * 60);
    setHours(wholeHours.toString());
    setMinutes(mins.toString());
    setAmountPerHour(b.amountPerHour.toString());
    setVaravuAmount((b.varavuAmount || 0).toString());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
        if (isOpen && bill) resetForm(bill);
      }}
    >
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={() => { if (bill) resetForm(bill); }}>
        <DialogHeader>
          <DialogTitle>
            பில் திருத்தம் {bill?.billNumber ? `· ${bill.billNumber}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>பெயர்</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>பில்லிங் வகை</Label>
            <BillingTypeCombobox value={billingType} onChange={setBillingType} />
          </div>
          <div className="space-y-2">
            <Label>உழவு வகை</Label>
            <Select value={plowingType} onValueChange={(v) => setPlowingType(v as PlowingType)}>
              <SelectTrigger><SelectValue placeholder="வகை தேர்வு" /></SelectTrigger>
              <SelectContent>
                {PLOWING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>மணி</Label>
              <Input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>நிமிடம்</Label>
              <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>மணிக்கு தொகை (₹)</Label>
            <Input type="number" step="1" value={amountPerHour} onChange={(e) => setAmountPerHour(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>வரவு (₹)</Label>
            <Input type="number" step="1" value={varavuAmount} onChange={(e) => setVaravuAmount(e.target.value)} />
          </div>
          <div className="rounded-md border bg-muted/30 p-3 text-center">
            <span className="text-sm text-muted-foreground">மொத்தம்: </span>
            <span className="text-lg font-bold text-primary">
              ₹{((((parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60) * (parseFloat(amountPerHour) || 0)) - (parseFloat(varavuAmount) || 0)).toLocaleString("ta-IN")}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ரத்து</Button>
          <Button onClick={() => {
            if (!bill || !name || !plowingType) return;
            const totalHours = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;
            const amt = parseFloat(amountPerHour) || 0;
            const varavu = parseFloat(varavuAmount) || 0;
            onSave({
              ...bill,
              name,
              billingType: billingType || plowingType,
              plowingType: plowingType as PlowingType,
              hours: totalHours,
              amountPerHour: amt,
              varavuAmount: varavu,
              totalAmount: totalHours * amt - varavu,
            });
          }}>
            சேமிக்க
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
