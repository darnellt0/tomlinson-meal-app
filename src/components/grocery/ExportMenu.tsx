// src/components/grocery/ExportMenu.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Mail, Printer } from "lucide-react";
import type { GroceryRow } from "@/lib/types";
import {
  exportGroceriesToPDF,
  exportGroceriesToText,
  exportGroceriesToEmail,
} from "@/lib/grocery-export";

export function ExportMenu({
  items,
  week,
}: {
  items: GroceryRow[];
  week: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const handlePDFExport = async () => {
    setLoading(true);
    try {
      const blob = await exportGroceriesToPDF(items, week);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grocery-list-${week.toLowerCase().replace(" ", "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextExport = () => {
    const text = exportGroceriesToText(items);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-list-${week.toLowerCase().replace(" ", "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailExport = () => {
    const html = exportGroceriesToEmail(items);
    const subject = `Grocery List - ${week}`;
    const body = encodeURIComponent(html);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePDFExport}
        disabled={loading}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTextExport}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Text
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleEmailExport}
        className="gap-2"
      >
        <Mail className="w-4 h-4" />
        Email
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2"
      >
        <Printer className="w-4 h-4" />
        Print
      </Button>
    </div>
  );
}
