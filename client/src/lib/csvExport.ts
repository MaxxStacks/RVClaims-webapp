// client/src/lib/csvExport.ts
// Reusable CSV export utility for analytics and reports

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  // Detect ISO date strings
  if (ISO_DATE_RE.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return s;
}

function quoteCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns: Array<{ key: string; label: string }>
): void {
  const header = columns.map((c) => quoteCell(c.label)).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => quoteCell(formatValue(row[c.key])))
      .join(",")
  );

  const csv = [header, ...rows].join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
