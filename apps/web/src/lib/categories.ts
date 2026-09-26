import type { Category } from "@memento-mori/types";

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; emoji: string; color: string }
> = {
  CEMETERY: { label: "Cemetery", emoji: "🪦", color: "#6B7280" },
  HAUNTED_HOUSE: { label: "Haunted House", emoji: "🏚️", color: "#8B5CF6" },
  BATTLEFIELD: { label: "Battlefield", emoji: "⚔️", color: "#EF4444" },
  ASYLUM: { label: "Asylum", emoji: "🏥", color: "#F59E0B" },
  CURSED_PLACE: { label: "Cursed Place", emoji: "🌲", color: "#10B981" },
  URBAN_LEGEND: { label: "Urban Legend", emoji: "👁️", color: "#EC4899" },
};

export function getSpookySkulls(score: number): string {
  return "💀".repeat(score) + "🩶".repeat(5 - score);
}
