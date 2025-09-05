// src/lib/recipes.ts
export type Recipe = {
  id: string;
  title: string;
  serves: number;
  ingredients: string[];
  steps: string[];
  health: string[];
  cuisine?: string;
  tags?: string[];
};

// Robust CSV -> rows (handles quotes, commas, newlines inside quotes)
function parseCsvToRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"'; // escaped quote
          i++;
        } else {
          inQuotes = false; // closing quote
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field.trim());
        field = "";
      } else if (c === "\r") {
        // ignore
      } else if (c === "\n") {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += c;
      }
    }
  }
  // last field
  row.push(field.trim());
  rows.push(row);
  // drop trailing empty row if any
  if (rows.length && rows[rows.length - 1].every((v) => v === "")) rows.pop();
  return rows;
}

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

export async function fetchRecipesFromCsv(csvUrl: string): Promise<Record<string, Recipe>> {
  const res = await fetch(csvUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);

  const byId: Record<string, Recipe> = {};
  for (const r of rows) {
    const id = r.id || "";
    if (!id) continue;
    const toList = (s: string) =>
      (s || "")
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean);

    byId[id] = {
      id,
      title: r.title || id,
      serves: Number(r.serves || 0),
      ingredients: toList(r.ingredients),
      steps: toList(r.steps),
      health: toList(r.health),
      cuisine: r.cuisine || "",
      tags: toList(r.tags),
    };
  }
  return byId;
}

