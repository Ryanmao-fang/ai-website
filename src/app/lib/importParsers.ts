export type ImportMode = "upsert" | "insert_only";

function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if ('"' === ch) {
      if (inQuotes && '"' === line[i + 1]) {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if ("," === ch && !inQuotes) {
      cols.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  cols.push(cur.trim());
  return cols;
}

export function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return [];
  }
  const headers = splitCsvLine(lines[0]).map((x) => x.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

export function parseJsonOrCsv(text: string): unknown[] {
  const raw = String(text || "").trim();
  if (!raw) {
    return [];
  }
  if (raw.startsWith("[")) {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }
  return parseCsvRows(raw);
}

