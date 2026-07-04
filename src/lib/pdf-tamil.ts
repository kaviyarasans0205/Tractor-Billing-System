import jsPDF from "jspdf";
import { NotoSansTamilBase64 } from "./noto-sans-tamil";

let registered = false;

export function registerTamilFont(doc: jsPDF) {
  // jsPDF VFS is shared across instances, but addFont must run per-doc
  if (!registered) {
    doc.addFileToVFS("NotoSansTamil.ttf", NotoSansTamilBase64);
    registered = true;
  } else {
    // ensure VFS still has it (HMR safety)
    const anyDoc = doc as unknown as { existsFileInVFS?: (n: string) => boolean };
    if (!anyDoc.existsFileInVFS?.("NotoSansTamil.ttf")) {
      doc.addFileToVFS("NotoSansTamil.ttf", NotoSansTamilBase64);
    }
  }
  doc.addFont("NotoSansTamil.ttf", "NotoSansTamil", "normal");
  doc.setFont("NotoSansTamil");
}
