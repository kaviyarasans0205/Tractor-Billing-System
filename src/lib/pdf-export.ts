import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { BillEntry } from "./billing-data";

const CONTACTS: { name: string; phone: string }[] = [
  { name: "சின்னா", phone: "9751432547" },
  { name: "சோலைமுத்து", phone: "9345746165" },
  { name: "சோலைமுத்து", phone: "9943316827" },
  { name: "சித்ரா", phone: "9626619804" },
];

const PAYEE_VPA = "9943316827@ybl";
const PAYEE_NAME = "Solaimuthu";

interface ExportOptions {
  bills: BillEntry[];
  title: string;
  subtitle?: string;
  personName?: string;
  fileName: string;
  invoiceNumber?: string;
}

const fmt = (n: number) => `₹${n.toLocaleString("ta-IN")}`;

function buildUpiUrl(amount: number, invoiceNo: string) {
  return (
    `upi://pay?pa=${encodeURIComponent(PAYEE_VPA)}` +
    `&pn=${encodeURIComponent(PAYEE_NAME)}` +
    (amount > 0 ? `&am=${amount.toFixed(2)}` : "") +
    `&cu=INR` +
    `&tr=${encodeURIComponent(invoiceNo)}` +
    `&tn=${encodeURIComponent("KPS Bill Payment")}`
  );
}

function buildHtml(
  { bills, title, subtitle, personName, invoiceNumber }: ExportOptions,
  qrDataUrl: string,
  payAmount: number,
  invoiceNo: string,
): string {
  const totalAmount = bills.reduce((s, b) => s + b.totalAmount, 0);
  const paidAmount = bills.filter((b) => b.paid).reduce((s, b) => s + b.totalAmount, 0);
  const pendingAmount = totalAmount - paidAmount;

  const rows = bills
    .map(
      (b, i) => `
      <tr>
        <td>${i + 1}</td>
        ${personName ? "" : `<td>${b.name}</td>`}
        <td>${b.plowingType}</td>
        <td style="text-align:right">${b.hours.toFixed(2)}</td>
        <td style="text-align:right">₹${b.amountPerHour}</td>
        <td style="text-align:right">${fmt(b.varavuAmount || 0)}</td>
        <td style="text-align:right;font-weight:bold">${fmt(b.totalAmount)}</td>
        <td>${b.date}</td>
        <td style="text-align:center;color:${b.paid ? "#16a34a" : "#dc2626"}">
          ${b.paid ? "செலுத்தியது" : "நிலுவை"}
        </td>
      </tr>`
    )
    .join("");

  return `
  <div style="
    width: 760px;
    padding: 24px;
    font-family: 'Noto Sans Tamil', 'Latha', system-ui, sans-serif;
    color: #111;
    background: #fff;
    box-sizing: border-box;
  ">
    <div style="border-bottom:2px solid #22784a;padding-bottom:12px;margin-bottom:16px">
      <h1 style="margin:0;font-size:22px;color:#22784a">${title}</h1>
      ${subtitle ? `<p style="margin:4px 0 0;font-size:13px;color:#555">${subtitle}</p>` : ""}
      ${personName ? `<p style="margin:6px 0 0;font-size:14px;font-weight:bold">பெயர்: ${personName}</p>` : ""}
      <p style="margin:4px 0 0;font-size:12px;color:#666">
        Invoice #: <b>${invoiceNo}</b> &nbsp;·&nbsp; தேதி: ${new Date().toLocaleDateString("ta-IN")}
      </p>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:16px;font-size:13px">
      <div style="flex:1;padding:10px;background:#f1f5f9;border-radius:6px">
        <div style="color:#555">மொத்த பில்கள்</div>
        <div style="font-size:16px;font-weight:bold">${bills.length}</div>
      </div>
      <div style="flex:1;padding:10px;background:#f0fdf4;border-radius:6px">
        <div style="color:#555">மொத்தம்</div>
        <div style="font-size:16px;font-weight:bold">${fmt(totalAmount)}</div>
      </div>
      <div style="flex:1;padding:10px;background:#ecfdf5;border-radius:6px">
        <div style="color:#555">செலுத்தியது</div>
        <div style="font-size:16px;font-weight:bold;color:#16a34a">${fmt(paidAmount)}</div>
      </div>
      <div style="flex:1;padding:10px;background:#fef2f2;border-radius:6px">
        <div style="color:#555">நிலுவை</div>
        <div style="font-size:16px;font-weight:bold;color:#dc2626">${fmt(pendingAmount)}</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:#22784a;color:#fff">
          <th style="padding:8px;text-align:left">#</th>
          ${personName ? "" : `<th style="padding:8px;text-align:left">பெயர்</th>`}
          <th style="padding:8px;text-align:left">உழவு வகை</th>
          <th style="padding:8px;text-align:right">நேரம் (மணி)</th>
          <th style="padding:8px;text-align:right">மணி தொகை</th>
          <th style="padding:8px;text-align:right">வரவு</th>
          <th style="padding:8px;text-align:right">மொத்த தொகை</th>
          <th style="padding:8px;text-align:left">தேதி</th>
          <th style="padding:8px;text-align:center">நிலை</th>
        </tr>
      </thead>
      <tbody style="background:#fff">
        ${rows}
      </tbody>
    </table>
    <style>
      tbody td { padding:8px;border-bottom:1px solid #e5e7eb }
      tbody tr:nth-child(even) { background:#fafafa }
    </style>

    <div style="margin-top:20px;padding:14px;border:2px solid #22784a;border-radius:8px;background:#f0fdf4">
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex:0 0 240px;text-align:center">
          <img id="kps-upi-qr" src="${qrDataUrl}" style="width:230px;height:230px;border:1px solid #22784a;border-radius:6px;background:#fff;padding:6px" alt="UPI QR" />
          <div style="margin-top:6px;font-size:12px;color:#111;font-weight:bold">QR-ஐ Scan செய்து செலுத்து</div>
          <div style="margin-top:2px;font-size:11px;color:#555">PhonePe / GPay / Paytm / BHIM</div>
        </div>
        <div style="flex:1;min-width:240px;font-size:13px">
          <div style="margin-bottom:10px;padding:12px;background:#fff;border:1px dashed #22784a;border-radius:6px;text-align:center">
            <div style="color:#555;font-size:12px">Invoice #: <b>${invoiceNo}</b></div>
            <div style="color:#555;font-size:12px;margin-top:4px">மொத்தம்: <b>${fmt(totalAmount)}</b></div>
            <div style="color:#555;font-size:12px;margin-top:6px">செலுத்த வேண்டிய தொகை</div>
            <div style="font-size:24px;font-weight:bold;color:#dc2626">${fmt(payAmount)}</div>
            <div style="margin-top:6px;font-size:12px;color:#111">PhonePe: <b>சோலைமுத்து</b> · <b>9943316827</b></div>
            <div id="kps-pay-link" style="margin-top:8px;padding:8px;background:#6d28d9;color:#fff;border-radius:6px;font-weight:bold;font-size:13px">
              ▶ PhonePe மூலம் பணம் செலுத்தவும்
            </div>
            <div style="margin-top:6px;font-size:10px;color:#666">Link-ஐ Touch செய்தால் UPI App திறக்கும்</div>
          </div>
          <div style="font-weight:bold;margin-bottom:4px">தொடர்பு எண்கள்:</div>
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            ${(() => {
              const grouped: Record<string, string[]> = {};
              for (const c of CONTACTS) {
                if (!grouped[c.name]) grouped[c.name] = [];
                grouped[c.name].push(c.phone);
              }
              return Object.entries(grouped).map(
                ([name, phones]) => `<tr>
                  <td style="padding:2px 8px 2px 0;vertical-align:top">${name}</td>
                  <td style="padding:2px 0;font-weight:bold">${phones.join(", ")}</td>
                </tr>`
              ).join("");
            })()}
          </table>
        </div>
      </div>
    </div>
  </div>`;
}

export async function exportBillsPdf(opts: ExportOptions) {
  const totalAmount = opts.bills.reduce((s, b) => s + b.totalAmount, 0);
  const paidAmount = opts.bills.filter((b) => b.paid).reduce((s, b) => s + b.totalAmount, 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const payAmount = pendingAmount > 0 ? pendingAmount : totalAmount;
  const invoiceNo = opts.invoiceNumber || `KPS${Date.now()}`;
  const upiUrl = buildUpiUrl(payAmount, invoiceNo);

  // Generate dynamic QR encoding the UPI URL with the live amount.
  const qrDataUrl = await QRCode.toDataURL(upiUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 600,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.innerHTML = buildHtml(opts, qrDataUrl, payAmount, invoiceNo);
  document.body.appendChild(wrapper);

  try {
    const target = wrapper.firstElementChild as HTMLElement;

    const images = Array.from(target.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    const qrImg = target.querySelector("#kps-upi-qr") as HTMLImageElement | null;
    const payLinkEl = target.querySelector("#kps-pay-link") as HTMLElement | null;
    const targetRect = target.getBoundingClientRect();
    const qrRect = qrImg?.getBoundingClientRect();
    const payRect = payLinkEl?.getBoundingClientRect();

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const mmPerPx = imgWidth / (targetRect.width || canvas.width / 2);

    const addLinksOnPage = (pageTopPositionMm: number) => {
      const place = (rect?: DOMRect) => {
        if (!rect) return;
        const x = (rect.left - targetRect.left) * mmPerPx;
        const y = (rect.top - targetRect.top) * mmPerPx + pageTopPositionMm;
        const w = rect.width * mmPerPx;
        const h = rect.height * mmPerPx;
        if (y + h > 0 && y < pageHeight) {
          pdf.link(x, y, w, h, { url: upiUrl });
        }
      };
      place(qrRect);
      place(payRect);
    };

    const drawFooterLink = () => {
      pdf.setTextColor(37, 99, 235);
      pdf.setFontSize(10);
      pdf.textWithLink(
        `>> Pay with PhonePe / UPI - Rs.${payAmount.toFixed(2)} <<`,
        pageWidth / 2,
        pageHeight - 6,
        { url: upiUrl, align: "center" }
      );
      pdf.setTextColor(0, 0, 0);
    };

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    addLinksOnPage(position);
    drawFooterLink();
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      addLinksOnPage(position);
      drawFooterLink();
      heightLeft -= pageHeight;
    }

    pdf.save(opts.fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}
