"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type TabKey = "today" | "calendar" | "groceries";

export function NavTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "calendar", label: "Calendar" },
    { key: "groceries", label: "Groceries" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((t) => (
        <Button
          key={t.key}
          variant={value === t.key ? "default" : "outline"}
          onClick={() => onChange(t.key)}
          className="rounded-xl"
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
