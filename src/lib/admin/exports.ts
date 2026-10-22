import "server-only";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

/**
 * Excel and PDF files for reports and history backups. Built on the server,
 * only after the admin session has been verified by the caller.
 */
export type Column = { header: string; key: string; width?: number; type?: "money" | "date" | "number" };
export type Sheet = { name: string; columns: Column[]; rows: Record<string, unknown>[] };

const BRAND = "INNOVA Seguridad y Sistemas";
const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" });

function cellText(value: unknown, type?: Column["type"]) {
  if (value === null || value === undefined || value === "") return "";
  if (type === "money") return cop.format(Number(value));
  if (type === "date") return dateFmt.format(new Date(String(value)));
  if (type === "number") return new Intl.NumberFormat("es-CO").format(Number(value));
  return String(value);
}

export async function buildWorkbook(title: string, sheets: Sheet[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND;
  wb.created = new Date();
  for (const sheet of sheets) {
    const ws = wb.addWorksheet(sheet.name.slice(0, 31), { views: [{ state: "frozen", ySplit: 2 }] });
    ws.mergeCells(1, 1, 1, Math.max(1, sheet.columns.length));
    ws.getCell(1, 1).value = `${BRAND} · ${title} · ${sheet.name}`;
    ws.getCell(1, 1).font = { bold: true, size: 12 };
    const header = ws.getRow(2);
    sheet.columns.forEach((c, i) => {
      header.getCell(i + 1).value = c.header;
      ws.getColumn(i + 1).width = c.width ?? 18;
    });
    header.font = { bold: true, color: { argb: "FF0B1120" } };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9F99D" } };
    for (const row of sheet.rows) {
      ws.addRow(
        sheet.columns.map((c) => {
          const v = row[c.key];
          if (v === null || v === undefined) return null;
          if (c.type === "money" || c.type === "number") return Number(v);
          if (c.type === "date") return new Date(String(v));
          return String(v);
        }),
      );
    }
    sheet.columns.forEach((c, i) => {
      const col = ws.getColumn(i + 1);
      if (c.type === "money") col.numFmt = '"$"#,##0';
      if (c.type === "date") col.numFmt = "dd/mm/yyyy hh:mm";
    });
    if (sheet.rows.length) ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: sheet.columns.length } };
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export function buildPdf(title: string, subtitle: string, sections: { title: string; sheet: Sheet; maxRows?: number }[]): Buffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(BRAND, 40, 44);
  doc.setFontSize(12);
  doc.text(title, 40, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`${subtitle} · Generado el ${dateFmt.format(new Date())}`, 40, 80);
  doc.setTextColor(0);

  let y = 100;
  for (const section of sections) {
    const rows = section.maxRows ? section.sheet.rows.slice(0, section.maxRows) : section.sheet.rows;
    if (y > 500) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(section.title, 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [section.sheet.columns.map((c) => c.header)],
      body: rows.length ? rows.map((r) => section.sheet.columns.map((c) => cellText(r[c.key], c.type))) : [[{ content: "Sin registros", colSpan: section.sheet.columns.length }]],
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [11, 17, 32], textColor: [217, 249, 157] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 40, right: 40 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 28;
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`Página ${i} de ${pages}`, doc.internal.pageSize.getWidth() - 90, doc.internal.pageSize.getHeight() - 20);
  }
  return Buffer.from(doc.output("arraybuffer"));
}

export function fileResponse(body: Buffer, filename: string, format: "xlsx" | "pdf") {
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
