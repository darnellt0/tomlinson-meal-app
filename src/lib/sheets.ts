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

export const CALENDAR_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=0&single=true&output=csv";

// Groceries (you can start with Week 1 and add others)
export const GROCERIES_W1_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1104201051&single=true&output=csv";
export const GROCERIES_W2_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=253250838&single=true&output=csv";
export const GROCERIES_W3_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1304242431&single=true&output=csv"
export const GROCERIES_W4_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1507203300&single=true&output=csv";

// Tracking
export const TRACKING_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=679480084&single=true&output=csv";

// Prep / Assignments
export const PREP_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1089504506&single=true&output=csv";

// Reflection
export const REFLECTION_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=317895333&single=true&output=csv";

// Metrics
export const METRICS_BASELINE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=743859351&single=true&output=csv";
export const METRICS_WEEKLY_CSV_URL   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1410756729&single=true&output=csv";
export const METRICS_FINAL_CSV_URL    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=207434613&single=true&output=csv";