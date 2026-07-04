import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BillEntry } from "@/lib/billing-data";
import { FileDown, Loader2 } from "lucide-react";
import { exportBillsPdf } from "@/lib/pdf-export";
import { toast } from "sonner";

interface PdfExportProps {
  bills: BillEntry[];
}

export function PdfExport({ bills }: PdfExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    const t = toast.loading("தமிழ் PDF உருவாக்கப்படுகிறது...");
    try {
      await exportBillsPdf({
        bills,
        title: "KPS கவர்பணை",
        subtitle: "டிராக்டர் உழவு பில்லிங்",
        fileName: `bills_${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success("PDF தயார்!", { id: t });
    } catch (e) {
      console.error(e);
      toast.error("PDF உருவாக்க முடியவில்லை", { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" disabled={bills.length === 0 || loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          உருவாக்கப்படுகிறது...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          PDF பதிவிறக்கம்
        </>
      )}
    </Button>
  );
}
