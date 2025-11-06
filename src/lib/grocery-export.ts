// src/lib/grocery-export.ts
import { jsPDF } from "jspdf";
import type { GroceryRow } from "./types";

/**
 * Export groceries to PDF format
 */
export async function exportGroceriesToPDF(
  items: GroceryRow[],
  week: string
): Promise<Blob> {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`Grocery List - ${week}`, 20, 20);

  // Group by category
  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  let y = 40;

  // Render each category
  Object.entries(grouped).forEach(([category, catItems]) => {
    // Category header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(category, 20, y);
    y += 8;

    // Items
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    catItems.forEach((item) => {
      const line = `☐ ${item.Item} ${item.Quantity || ""}`;
      doc.text(line, 25, y);
      y += 6;

      // Add notes if present
      if (item.Notes) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`    ${item.Notes}`, 25, y);
        y += 5;
        doc.setFontSize(10);
        doc.setTextColor(0);
      }

      // New page if needed
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10; // Space between categories
  });

  return doc.output("blob");
}

/**
 * Export groceries to plain text format
 */
export function exportGroceriesToText(items: GroceryRow[]): string {
  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  let text = "GROCERY LIST\n\n";

  Object.entries(grouped).forEach(([category, catItems]) => {
    text += `${category.toUpperCase()}\n`;
    text += "─".repeat(category.length) + "\n";

    catItems.forEach((item) => {
      text += `☐ ${item.Item}`;
      if (item.Quantity) text += ` - ${item.Quantity}`;
      text += "\n";
      if (item.Notes) text += `  Note: ${item.Notes}\n`;
    });

    text += "\n";
  });

  return text;
}

/**
 * Export groceries for email (formatted HTML)
 */
export function exportGroceriesToEmail(items: GroceryRow[]): string {
  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  let html = '<div style="font-family: sans-serif; max-width: 600px;">';
  html += '<h2>Grocery List</h2>';

  Object.entries(grouped).forEach(([category, catItems]) => {
    html += `<h3 style="margin-top: 20px; border-bottom: 2px solid #333;">${category}</h3>`;
    html += '<ul style="list-style: none; padding-left: 0;">';

    catItems.forEach((item) => {
      html += '<li style="margin: 8px 0;">';
      html += `<input type="checkbox" style="margin-right: 8px;">`;
      html += `<strong>${item.Item}</strong>`;
      if (item.Quantity) html += ` - ${item.Quantity}`;
      if (item.Notes) html += `<br><small style="color: #666; margin-left: 24px;">${item.Notes}</small>`;
      html += '</li>';
    });

    html += '</ul>';
  });

  html += '</div>';
  return html;
}
