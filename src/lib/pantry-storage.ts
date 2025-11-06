// src/lib/pantry-storage.ts

export type PantryItem = {
  item: string;
  quantity: string;
  addedDate: string;
  expirationDate?: string;
};

const STORAGE_KEY = "tomlinson_pantry";

export function getPantryItems(): PantryItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToPantry(item: PantryItem): void {
  const items = getPantryItems();
  items.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function removeFromPantry(itemName: string): void {
  const items = getPantryItems().filter((i) => i.item !== itemName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isInPantry(itemName: string): boolean {
  return getPantryItems().some(
    (i) => i.item.toLowerCase() === itemName.toLowerCase()
  );
}

export function clearPantry(): void {
  localStorage.removeItem(STORAGE_KEY);
}
