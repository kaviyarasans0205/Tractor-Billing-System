import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BillEntry } from "@/lib/billing-data";
import { Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { PAYEE_MOBILE, buildUpiUrl } from "@/lib/upi";

interface Props {
  bills: BillEntry[];
  title?: string;
}

export function PaymentSection({ bills, title = "PhonePe / UPI மூலம் பணம் செலுத்து" }: Props) {
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<string>("");

  const totalAmount = bills.reduce((s, b) => s + b.totalAmount, 0);
  const paidAmount = bills.filter((b) => b.paid).reduce((s, b) => s + b.totalAmount, 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const payAmount = pendingAmount > 0 ? pendingAmount : totalAmount;

  const upiUrl = buildUpiUrl(payAmount);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(upiUrl, { margin: 1, width: 400, errorCorrectionLevel: "M" })
      .then((d) => alive && setQr(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [upiUrl]);

  const handlePay = () => {
    if (payAmount <= 0) {
      toast.info("செலுத்த தொகை இல்லை");
      return;
    }
    setLoading(true);
    try {
      window.location.href = upiUrl;
      setTimeout(() => setLoading(false), 1500);
    } catch {
      toast.error("கட்டணம் தொடங்க முடியவில்லை");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-green-50/90 to-white/90 p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-center text-lg font-bold text-primary">{title}</h3>
      <div className="flex flex-col items-center gap-5 md:flex-row md:items-stretch md:justify-center">
        <a
          href={upiUrl}
          className="block rounded-lg border-2 border-primary/40 bg-white p-2 shadow transition hover:scale-[1.02]"
          aria-label="QR-ஐ கிளிக் செய்து செலுத்து"
        >
          {qr ? (
            <img src={qr} alt="UPI QR" className="h-48 w-48 sm:h-56 sm:w-56" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <p className="mt-1 text-center text-xs font-medium text-muted-foreground">
            QR-ஐ Touch செய்து செலுத்து
          </p>
        </a>

        <div className="flex w-full max-w-xs flex-col justify-center gap-3 text-center md:text-left">
          <div className="rounded-lg bg-white/80 p-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">மொத்த தொகை</p>
            <p className="text-xl font-bold">₹{totalAmount.toLocaleString("ta-IN")}</p>
          </div>
          <div className="rounded-lg bg-white/80 p-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">நிலுவைத் தொகை</p>
            <p className="text-2xl font-extrabold text-destructive">
              ₹{pendingAmount.toLocaleString("ta-IN")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            பெறுநர்: <b>சோலைமுத்து</b> · {PAYEE_MOBILE}
          </p>
          <Button
            onClick={handlePay}
            disabled={loading || payAmount <= 0}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                திறக்கப்படுகிறது...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-5 w-5" />
                PhonePe மூலம் பணம் செலுத்து
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground">
            PhonePe இல்லையெனில் GPay / Paytm / BHIM போன்ற UPI App திறக்கும்.
          </p>
        </div>
      </div>
    </div>
  );
}
