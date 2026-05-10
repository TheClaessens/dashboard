import { type FC } from "react";
import { sumMacros } from "@/lib/food";
import type { FoodItem } from "@/lib/schemas/food";

interface MacroRowProps {
  label: string;
  value: number;
  unit?: string;
}

const MacroRow: FC<MacroRowProps> = ({ label, value, unit = "g" }) => (
  <span className="text-sm text-zinc-600 dark:text-zinc-400">
    <span className="font-medium">{label}</span> {Math.round(value * 10) / 10}{unit}
  </span>
);

interface MacroSummaryProps {
  items: Pick<FoodItem, "calories" | "protein" | "carbs" | "fat">[];
}

export const MacroSummary: FC<MacroSummaryProps> = ({ items }) => {
  const totals = sumMacros(items);
  return (
    <div className="flex flex-wrap gap-4">
      <MacroRow label="Calories" value={totals.calories} unit="kcal" />
      <MacroRow label="Protein" value={totals.protein} />
      <MacroRow label="Carbs" value={totals.carbs} />
      <MacroRow label="Fat" value={totals.fat} />
    </div>
  );
};
