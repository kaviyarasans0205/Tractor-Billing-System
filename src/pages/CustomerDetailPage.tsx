import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BillEntry,
  getPaidAmount,
  getPendingAmount,
  getBillingType,
  loadBills,
  saveBills,
} from "@/lib/billing-data";
import { CustomerInfo, getCustomer, upsertCustomer } from "@/lib/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentSection } from "@/components/PaymentSection";
import { PaymentsDialog } from "@/components/PaymentsDialog";
import { BillEditDialog } from "@/components/BillEditDialog";
import { CustomerSummary } from "@/components/CustomerSummary";
import { toast } from "sonner";
import { exportBillsPdf } from "@/lib/pdf-export";
import { buildWhatsappShareUrl } from "@/lib/whatsapp";
import { ArrowLeft, FileDown, IndianRupee, Loader2, Pencil, Printer, Share2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerDetailPage() {
  const { name = "" } = useParams();
  const decoded = decodeURIComponent(name);
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [info, setInfo] = useState<CustomerInfo | undefined>();
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [paying, setPaying] = useState<BillEntry | null>(null);
  const [editing, setEditing] = useState<BillEntry | null>(null);

  const refresh = () => {
    const all = loadBills().filter((b) => b.name === decoded);
    all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setBills(all);
  };

  useEffect(() => {
    refresh();
    const c = getCustomer(decoded);
    setInfo(c);
    setMobile(c?.mobile || "");
    setVillage(c?.village || "");
  }, [decoded]);

  const saveInfo = () => {
    upsertCustomer({ name: decoded, mobile: mobile.trim(), village: village.trim() });
    setInfo({ name: decoded, mobile, village, updatedAt: Date.now() });
    toast.success("சேமிக்கப்பட்டது");
  };

  const persist = (updater: (all: BillEntry[]) => BillEntry[]) => {
    const next = updater(loadBills());
    saveBills(next);
    refresh();
  };

  const togglePaid = (id: string) =>
    persist((all) => all.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)));

  const deleteBill = (id: string) => {
    if (!confirm("இந்த பில்லை நீக்கவா?")) return;
    persist((all) => all.filter((b) => b.id !== id));
    toast.info("பில் நீக்கப்பட்டது");
  };

  const applyEdit = (updated: BillEntry) => {
    persist((all) => all.map((b) => (b.id === updated.id ? updated : b)));
    setEditing(null);
    toast.success("பில் புதுப்பிக்கப்பட்டது");
  };

  const applyPayment = (updated: BillEntry) => {
    persist((all) => all.map((b) => (b.id === updated.id ? updated : b)));
    setPaying(updated);
  };

  const downloadPdf = async (single?: BillEntry) => {
    if (exporting) return;
    setExporting(true);
    const t = toast.loading("PDF உருவாக்கப்படுகிறது...");
    try {
      await exportBillsPdf({
        bills: single ? [single] : bills,
        title: "KPS கவர்பணை",
        subtitle: "டிராக்டர் உழவு பில்லிங்",
        personName: decoded,
        fileName: single
          ? `invoice_${single.invoiceNumber || single.id}.pdf`
          : `invoice_${decoded}_${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success("PDF தயார்!", { id: t });
    } catch {
      toast.error("PDF உருவாக்க முடியவில்லை", { id: t });
    } finally {
      setExporting(false);
    }
  };

  const shareWa = (single?: BillEntry) => {
    const url = buildWhatsappShareUrl({
      mobile: info?.mobile,
      personName: decoded,
      bills: single ? [single] : bills,
    });
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <Link
        to="/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> வாடிக்கையாளர்கள்
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">{decoded}</h1>
          <p className="text-sm text-muted-foreground">
            {bills.length} பில் · மொத்தம் ₹{bills.reduce((s, b) => s + b.totalAmount, 0).toLocaleString("ta-IN")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => downloadPdf()} disabled={exporting || bills.length === 0}>
            {exporting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileDown className="mr-1 h-4 w-4" />}
            PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()} disabled={bills.length === 0}>
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={() => shareWa()} disabled={bills.length === 0}>
            <Share2 className="mr-1 h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      <CustomerSummary bills={bills} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">வாடிக்கையாளர் தகவல்</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>மொபைல்</Label>
            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-இலக்க எண்" />
          </div>
          <div className="space-y-1">
            <Label>கிராமம்</Label>
            <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="ஊர்" />
          </div>
          <div className="flex items-end">
            <Button onClick={saveInfo} className="w-full">சேமிக்க</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">பில் வரலாறு</CardTitle>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              பில் இல்லை.{" "}
              <Link to="/bills/new" className="text-primary underline">புதிய பில் சேர்</Link>
            </p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>பில் #</TableHead>
                    <TableHead>இன்வாய்ஸ் #</TableHead>
                    <TableHead>வகை</TableHead>
                    <TableHead className="text-right">மொத்தம்</TableHead>
                    <TableHead className="text-right">செலுத்தியது</TableHead>
                    <TableHead className="text-right">நிலுவை</TableHead>
                    <TableHead>தேதி</TableHead>
                    <TableHead className="text-center">நிலை</TableHead>
                    <TableHead className="text-center">செயல்கள்</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((b) => {
                    const paid = getPaidAmount(b);
                    const pending = getPendingAmount(b);
                    const status = paid >= b.totalAmount && paid > 0 ? "paid" : paid > 0 ? "partial" : "pending";
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs">{b.billNumber || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{b.invoiceNumber || "—"}</TableCell>
                        <TableCell>{getBillingType(b)}</TableCell>
                        <TableCell className="text-right font-bold">₹{b.totalAmount.toLocaleString("ta-IN")}</TableCell>
                        <TableCell className="text-right text-success">₹{paid.toLocaleString("ta-IN")}</TableCell>
                        <TableCell className="text-right text-destructive">₹{pending.toLocaleString("ta-IN")}</TableCell>
                        <TableCell>{b.date}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={status === "paid" ? "default" : status === "partial" ? "secondary" : "destructive"}
                            className="cursor-pointer"
                            onClick={() => togglePaid(b.id)}
                          >
                            {status === "paid" ? "செலுத்தியது" : status === "partial" ? "பகுதி" : "நிலுவை"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setPaying(b)} title="பணப்பதிவு">
                              <IndianRupee className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditing(b)} title="திருத்து">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => downloadPdf(b)} title="PDF">
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => shareWa(b)} title="Share">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBill(b.id)}
                              className="text-destructive"
                              title="நீக்கு"
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
          )}
        </CardContent>
      </Card>

      {bills.length > 0 && <PaymentSection bills={bills} />}

      <PaymentsDialog
        bill={paying}
        open={!!paying}
        onClose={() => setPaying(null)}
        onChange={applyPayment}
      />
      <BillEditDialog
        bill={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={applyEdit}
      />
    </div>
  );
}
