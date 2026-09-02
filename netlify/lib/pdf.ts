import PDFDocument from "pdfkit";
import { PDF_COLORS as C } from "../../shared/brand";

export interface SupplyPdfLine {
  sku: string;
  name: string;
  qty: number;
  unit: string | null;
  manufacturer: string | null;
  supplier: string | null;
  category: string | null;
}

export interface SupplyPdfInput {
  orderNumber: number;
  assistantName: string;
  orderDate: string;
  urgency: string;
  notes: string;
  createdByEmail: string;
  lines: SupplyPdfLine[];
  specialRequests: { text: string; photoUrl: string | null }[];
}

export interface EndoPdfInput {
  orderNumber: number;
  dentist: string;
  orderDate: string;
  urgency: string;
  notes: string;
  createdByEmail: string;
  files: { type: string; taper: string; length: string; qty: number }[];
  accessories: string[];
}

const PAGE_MARGIN = 48;

function collect(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function header(doc: PDFKit.PDFDocument, title: string, dateStr: string) {
  const w = doc.page.width - PAGE_MARGIN * 2;
  doc.save();
  doc.roundedRect(PAGE_MARGIN, PAGE_MARGIN, w, 66, 10).fill(C.primary);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(18).text("ASNAN DENTAL", PAGE_MARGIN + 20, PAGE_MARGIN + 16);
  doc.font("Helvetica").fontSize(9).fillColor("#F2EEFB").text(title.toUpperCase(), PAGE_MARGIN + 20, PAGE_MARGIN + 40, {
    characterSpacing: 1.5,
  });
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#FFFFFF").text(dateStr, PAGE_MARGIN, PAGE_MARGIN + 30, {
    width: w - 20,
    align: "right",
  });
  doc.restore();
  doc.y = PAGE_MARGIN + 88;
  doc.x = PAGE_MARGIN;
}

function metaRow(doc: PDFKit.PDFDocument, pairs: [string, string][]) {
  const startY = doc.y;
  const colW = (doc.page.width - PAGE_MARGIN * 2) / pairs.length;
  pairs.forEach(([label, value], i) => {
    const x = PAGE_MARGIN + i * colW;
    doc.font("Helvetica").fontSize(8).fillColor(C.muted).text(label.toUpperCase(), x, startY, { characterSpacing: 1.2 });
    doc.font("Helvetica-Bold").fontSize(12).fillColor(C.ink).text(value, x, startY + 12, { width: colW - 8 });
  });
  doc.moveTo(PAGE_MARGIN, startY + 34).lineTo(doc.page.width - PAGE_MARGIN, startY + 34).lineWidth(1).stroke(C.border);
  doc.y = startY + 46;
  doc.x = PAGE_MARGIN;
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string) {
  if (doc.y > doc.page.height - 120) doc.addPage();
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.primaryDeep).text(text.toUpperCase(), PAGE_MARGIN, doc.y, {
    characterSpacing: 1.5,
  });
  doc.moveTo(PAGE_MARGIN, doc.y + 2).lineTo(doc.page.width - PAGE_MARGIN, doc.y + 2).lineWidth(1.2).stroke(C.primary);
  doc.moveDown(0.5);
  doc.x = PAGE_MARGIN;
}

function itemRow(doc: PDFKit.PDFDocument, name: string, detail: string, qty: string) {
  if (doc.y > doc.page.height - 80) doc.addPage();
  const w = doc.page.width - PAGE_MARGIN * 2;
  const qtyW = 48;
  const y = doc.y;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.ink).text(name, PAGE_MARGIN, y, { width: w - qtyW - 10 });
  if (detail) {
    doc.font("Helvetica").fontSize(8).fillColor(C.muted).text(detail, PAGE_MARGIN, doc.y, { width: w - qtyW - 10 });
  }
  doc.font("Helvetica-Bold").fontSize(13).fillColor(C.primaryDeep).text(qty, doc.page.width - PAGE_MARGIN - qtyW, y, {
    width: qtyW,
    align: "right",
  });
  doc.moveDown(0.35);
  doc.moveTo(PAGE_MARGIN, doc.y).lineTo(doc.page.width - PAGE_MARGIN, doc.y).lineWidth(0.5).stroke(C.rule);
  doc.moveDown(0.35);
}

function footer(doc: PDFKit.PDFDocument, createdByEmail: string) {
  doc.moveDown(1.2);
  doc.font("Helvetica").fontSize(8).fillColor(C.muted).text(
    `Asnan Dental · Placed by ${createdByEmail} · Generated ${new Date().toLocaleString("en-GB")}`,
    PAGE_MARGIN,
    doc.y,
    { width: doc.page.width - PAGE_MARGIN * 2, align: "center" },
  );
}

function decodeDataUrl(dataUrl: string): Buffer | null {
  const m = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!m) return null;
  try {
    return Buffer.from(m[2], "base64");
  } catch {
    return null;
  }
}

export async function buildSupplyOrderPdf(input: SupplyPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
  const done = collect(doc);

  header(doc, "Inventory Supply Order", fmtDate(input.orderDate));
  doc.font("Helvetica-Bold").fontSize(20).fillColor(C.ink).text(`Order #${input.orderNumber}`, { align: "left" });
  doc.moveDown(0.6);
  metaRow(doc, [
    ["Assistant", input.assistantName],
    ["Order date", fmtDate(input.orderDate)],
    ["Urgency", input.urgency],
  ]);

  if (input.notes.trim()) {
    sectionTitle(doc, "Order Notes");
    doc.font("Helvetica").fontSize(10).fillColor(C.ink).text(input.notes.trim(), { width: doc.page.width - PAGE_MARGIN * 2 });
  }

  // group by supplier -> category
  const bySupplier = new Map<string, SupplyPdfLine[]>();
  for (const l of input.lines) {
    const s = l.supplier || "Other";
    if (!bySupplier.has(s)) bySupplier.set(s, []);
    bySupplier.get(s)!.push(l);
  }
  for (const [supplier, lines] of bySupplier) {
    sectionTitle(doc, `${supplier} — ${lines.length} item${lines.length === 1 ? "" : "s"}`);
    const byCat = new Map<string, SupplyPdfLine[]>();
    for (const l of lines) {
      const c = l.category || "Uncategorized";
      if (!byCat.has(c)) byCat.set(c, []);
      byCat.get(c)!.push(l);
    }
    for (const [cat, catLines] of byCat) {
      doc.moveDown(0.2);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(C.muted).text(cat, PAGE_MARGIN, doc.y, { characterSpacing: 1 });
      doc.moveDown(0.3);
      for (const l of catLines) {
        const detail = [l.manufacturer, l.unit, `SKU ${l.sku}`].filter(Boolean).join("  ·  ");
        itemRow(doc, l.name, detail, String(l.qty));
      }
    }
  }

  if (input.specialRequests.length) {
    sectionTitle(doc, "Special Requests");
    input.specialRequests.forEach((sr, i) => {
      if (doc.y > doc.page.height - 140) doc.addPage();
      const y = doc.y;
      doc.font("Helvetica-Bold").fontSize(9).fillColor(C.muted).text(String(i + 1).padStart(2, "0"), PAGE_MARGIN, y, {
        width: 24,
      });
      doc.font("Helvetica").fontSize(10).fillColor(C.ink).text(sr.text, PAGE_MARGIN + 30, y, {
        width: doc.page.width - PAGE_MARGIN * 2 - 140,
      });
      if (sr.photoUrl) {
        const buf = decodeDataUrl(sr.photoUrl);
        if (buf) {
          try {
            doc.image(buf, doc.page.width - PAGE_MARGIN - 96, y, { fit: [96, 96] });
          } catch {
            /* skip unreadable image */
          }
        }
      }
      doc.y = Math.max(doc.y, y + 100);
      doc.moveTo(PAGE_MARGIN, doc.y).lineTo(doc.page.width - PAGE_MARGIN, doc.y).lineWidth(0.5).stroke(C.rule);
      doc.moveDown(0.4);
    });
  }

  const totalUnits = input.lines.reduce((s, l) => s + l.qty, 0);
  doc.moveDown(0.6);
  sectionTitle(doc, "Summary");
  doc.font("Helvetica").fontSize(10).fillColor(C.ink)
    .text(`Catalog line items: ${input.lines.length}`, { continued: false })
    .text(`Total units: ${totalUnits}`)
    .text(`Special requests: ${input.specialRequests.length}`);

  footer(doc, input.createdByEmail);
  doc.end();
  return done;
}

export async function buildEndoOrderPdf(input: EndoPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
  const done = collect(doc);

  header(doc, "WaveOne Endo Supply Order", fmtDate(input.orderDate));
  doc.font("Helvetica-Bold").fontSize(20).fillColor(C.ink).text(`Endo Order #${input.orderNumber}`);
  doc.moveDown(0.6);
  metaRow(doc, [
    ["Dentist", input.dentist],
    ["Order date", fmtDate(input.orderDate)],
    ["Urgency", input.urgency],
  ]);

  sectionTitle(doc, "Files Ordered");
  for (const f of input.files) {
    itemRow(doc, f.type, `${f.taper}  ·  ${f.length}`, String(f.qty));
  }

  if (input.accessories.length) {
    sectionTitle(doc, "Accessories");
    for (const a of input.accessories) {
      doc.font("Helvetica").fontSize(10).fillColor(C.ink).text(`•  ${a}`, PAGE_MARGIN, doc.y);
      doc.moveDown(0.2);
    }
  }

  if (input.notes.trim()) {
    sectionTitle(doc, "Notes");
    doc.font("Helvetica").fontSize(10).fillColor(C.ink).text(input.notes.trim(), { width: doc.page.width - PAGE_MARGIN * 2 });
  }

  footer(doc, input.createdByEmail);
  doc.end();
  return done;
}
