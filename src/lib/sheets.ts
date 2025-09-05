function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvToRows(text);
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
    return obj;
  });
}

export async function fetchCsv(url: string): Promise<string[][]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed CSV fetch ${res.status}`);
  const text = await res.text();
  // If you want to reuse your robust parser, expose parseCsvToRows from recipes.ts
  // For brevity, assume parseCsvToRows is exported:
  // import { parseCsvToRows } from "@/lib/recipes";
  // return parseCsvToRows(text);
  // If not, you can copy the same function here.
  // (Short version: split safely with quotes handling.)
  // For now, assume we exported it:
  // @ts-ignore
  return (globalThis as any).parseCsvToRows
    ? (globalThis as any).parseCsvToRows(text)
    : text.trim().split(/\r?\n/).map(line => line.split(","));
}

// Convert headered CSV to array of objects
export async function fetchCsvObjects(url: string): Promise<Record<string,string>[]> {
  const rows = await fetchCsv(url);
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(cols => {
    const obj: Record<string,string> = {};
    headers.forEach((h, i) => obj[h] = (cols[i] ?? "").trim());
    return obj;
  });
}
