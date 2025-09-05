// src/lib/sheets.ts

/**
 * Robust CSV -> array of rows (handles quoted commas and newlines)
 */
export function parseCsvToRows(text: string): string[][] {
  const rows: string[][] = [];
  let curRow: string[] = [];
  let curField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // escaped quote: ""
        curField += '"';
        i++; // skip one char
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        curField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        curRow.push(curField);
        curField = "";
      } else if (ch === "\n") {
        curRow.push(curField);
        rows.push(curRow);
        curRow = [];
        curField = "";
      } else if (ch === "\r") {
        // ignore, \r\n handled by \n branch
      } else {
        curField += ch;
      }
    }
  }

  // Flush last field/row
  curRow.push(curField);
  // Only push if not a single empty field line
  if (curRow.length > 1 || curRow[0] !== "") {
    rows.push(curRow);
  }

  return rows;
}

/**
 * Fetch CSV over HTTP and return parsed rows
 */
export async function fetchCsv(url: string): Promise<string[][]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed CSV fetch ${res.status} for ${url}`);
  }
  const text = await res.text();
  return parseCsvToRows(text);
}

/**
 * Convert headered CSV to array of plain objects (header -> value)
 */
export async function fetchCsvObjects(
  url: string
): Promise<Record<string, string>[]> {
  const rows = await fetchCsv(url);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      obj[key] = (cols[c] ?? "").trim();
    }
    out.push(obj);
  }

  return out;
}
