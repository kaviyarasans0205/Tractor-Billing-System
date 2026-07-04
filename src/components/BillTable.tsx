import { useMemo, useState } from "react";
import { BillEntry, getPaidAmount, getPendingAmount, getBillingType } from "@/lib/billing-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronRight, FileDown, IndianRupee, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { exportBillsPdf } from "@/lib/pdf-export";
import { toast } from "sonner";

interface BillTableProps {
  bills: BillEntry[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPay?: (id: string) => void;
}

interface PersonGroup {
  name: string;
  bills: BillEntry[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalHours: number;
}

export function BillTable({ bills, onTogglePaid, onDelete, onEdit, onPay }: BillTableProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [exportingName, setExportingName] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, BillEntry[]>();
    bills.forEach((b) => {
      const existing = map.get(b.name) || [];
      existing.push(b);
      map.set(b.name, existing);
    });
    const result: PersonGroup[] = [];
    map.forEach((entries, name) => {
      const totalAmount = entries.reduce((s, b) => s + b.totalAmount, 0);
      const paidAmount = entries.reduce((s, b) => s + getPaidAmount(b), 0);
      result.push({
        name,
        bills: entries,
        totalAmount,
        paidAmount,
        pendingAmount: Math.max(0, totalAmount - paidAmount),
        totalHours: entries.reduce((s, b) => s + b.hours, 0),
      });
    });
    return result;
  }, [bills]);

  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">பில் எதுவும் இல்லை</p>
        <p className="text-sm">மேலே உள்ள படிவத்தில் புதிய பில் சேர்க்கவும்</p>
      </div>
    );
  }

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const exportPersonPdf = async (group: PersonGroup) => {
    if (exportingName) return;
    setExportingName(group.name);
    const t = toast.loading(`${group.name} – PDF உருவாக்கப்படுகிறது...`);
    try {
      await exportBillsPdf({
        bills: group.bills,
        title: "KPS கவர்பணை",
        subtitle: "டிராக்டர் உழவு பில்லிங்",
        personName: group.name,
        fileName: `bill_${group.name}_${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success("PDF தயார்!", { id: t });
    } catch (e) {
      console.error(e);
      toast.error("PDF உருவாக்க முடியவில்லை", { id: t });
    } finally {
      setExportingName(null);
    }
  };

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = openGroups.has(group.name);
        return (
          <Collapsible key={group.name} open={isOpen} onOpenChange={() => toggleGroup(group.name)}>
            <CollapsibleTrigger asChild>
              <div className="flex cursor-pointer items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-lg font-bold">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.bills.length} பில்{group.bills.length > 1 ? "கள்" : ""} · {group.totalHours.toFixed(1)} மணி
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPersonPdf(group)}
                    disabled={exportingName === group.name}
                    className="gap-1"
                  >
                    {exportingName === group.name ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        உருவாக்கப்படுகிறது...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        PDF
                      </>
                    )}
                  </Button>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">மொத்தம்</p>
                    <p className="font-bold text-lg">₹{group.totalAmount.toLocaleString("ta-IN")}</p>
                  </div>
                  {group.paidAmount > 0 && (
                    <Badge variant="default" className="text-xs">
                      <Check className="mr-1 h-3 w-3" />
                      ₹{group.paidAmount.toLocaleString("ta-IN")}
                    </Badge>
                  )}
                  {group.pendingAmount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <X className="mr-1 h-3 w-3" />
                      ₹{group.pendingAmount.toLocaleString("ta-IN")}
                    </Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-1 rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">பில் #</TableHead>
                      <TableHead className="font-bold">இன்வாய்ஸ் #</TableHead>
                      <TableHead className="font-bold">வகை</TableHead>
                      <TableHead className="font-bold text-right">மணி</TableHead>
                      <TableHead className="font-bold text-right">மணி ₹</TableHead>
                      <TableHead className="font-bold text-right">வரவு</TableHead>
                      <TableHead className="font-bold text-right">மொத்தம்</TableHead>
                      <TableHead className="font-bold text-right">நிலுவை</TableHead>
                      <TableHead className="font-bold">தேதி</TableHead>
                      <TableHead className="font-bold text-center">நிலை</TableHead>
                      <TableHead className="font-bold text-center">செயல்கள்</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.bills.map((bill) => {
                      const pending = getPendingAmount(bill);
                      const paid = getPaidAmount(bill);
                      const status = paid >= bill.totalAmount && paid > 0
                        ? "paid"
                        : paid > 0
                          ? "partial"
                          : "pending";
                      return (
                        <TableRow key={bill.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{bill.billNumber || "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{bill.invoiceNumber || "—"}</TableCell>
                          <TableCell>{getBillingType(bill)}</TableCell>
                          <TableCell className="text-right">{bill.hours.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{bill.amountPerHour.toLocaleString("ta-IN")}</TableCell>
                          <TableCell className="text-right">₹{(bill.varavuAmount || 0).toLocaleString("ta-IN")}</TableCell>
                          <TableCell className="text-right font-bold">₹{bill.totalAmount.toLocaleString("ta-IN")}</TableCell>
                          <TableCell className="text-right text-destructive">₹{pending.toLocaleString("ta-IN")}</TableCell>
                          <TableCell>{bill.date}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={status === "paid" ? "default" : status === "partial" ? "secondary" : "destructive"}
                              className="cursor-pointer"
                              onClick={() => onTogglePaid(bill.id)}
                            >
                              {status === "paid"
                                ? (<><Check className="mr-1 h-3 w-3" /> செலுத்தியது</>)
                                : status === "partial"
                                  ? "பகுதி"
                                  : (<><X className="mr-1 h-3 w-3" /> நிலுவை</>)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onPay && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onPay(bill.id)}
                                  className="text-muted-foreground hover:text-primary"
                                  title="பணப்பதிவு"
                                >
                                  <IndianRupee className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(bill.id)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(bill.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
