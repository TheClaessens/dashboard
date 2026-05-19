"use client";

import { type FC, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/widget";
import { Donut, StackedBar } from "@/components/charts";
import { useFoodLog } from "@/app/food/hooks/useFoodLog";
import { useAddMeal } from "@/app/food/hooks/useAddMeal";
import { MealCard } from "@/app/food/components/MealCard";
import { SavedMealsBrowser } from "@/app/food/components/SavedMealsBrowser";
import type { FoodItem } from "@/lib/schemas/food";

const GOAL_CALORIES = 2400;
const GOAL_PROTEIN = 160;
const GOAL_CARBS = 260;
const GOAL_FAT = 80;

function deriveTotals(items: FoodItem[]) {
  return items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: acc.protein + i.protein,
      carbs: acc.carbs + i.carbs,
      fat: acc.fat + i.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
}

const MacroBar: FC<MacroBarProps> = ({ label, value, goal, color }) => {
  const pct = Math.min(value / goal, 1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
        <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono, ui-monospace)", fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}<span style={{ color: "var(--muted-foreground)" }}>/{goal}g</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: "var(--card-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, borderRadius: 999, transition: "width 400ms ease" }} />
      </div>
    </div>
  );
};

export default function FoodPage() {
  const [offset, setOffset] = useState(0);
  const [baseMs] = useState<number>(() => Date.now());
  const date = new Date(baseMs - offset * 86400000).toLocaleDateString("en-CA");
  const { data: meals = [], isLoading } = useFoodLog(date);
  const addMeal = useAddMeal(date);

  const allItems = meals.flatMap((m) => m.items);
  const totals = deriveTotals(allItems);
  const remaining = GOAL_CALORIES - Math.round(totals.calories);

  const isToday = offset === 0;
  const dateLabel = isToday
    ? "Today"
    : new Date(baseMs - offset * 86400000).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <PageHeader
        title="Food"
        icon="food"
        color="var(--m-food)"
        subtitle={dateLabel}
        actions={
          <>
            <button
              onClick={() => setOffset((o) => o + 1)}
              style={{ padding: "6px 8px", borderRadius: 10, background: "var(--card-2)", border: "1px solid var(--border)", color: "var(--foreground)", cursor: "pointer" }}
            >
              <Icon name="chevL" size={14} />
            </button>
            <button
              onClick={() => setOffset(0)}
              style={{
                padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: isToday ? "var(--m-food-bg)" : "var(--card-2)",
                border: `1px solid ${isToday ? "var(--m-food-bd)" : "var(--border)"}`,
                color: isToday ? "var(--m-food)" : "var(--muted-foreground)", cursor: "pointer",
              }}
            >Today</button>
            <button
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={isToday}
              style={{ padding: "6px 8px", borderRadius: 10, background: "var(--card-2)", border: "1px solid var(--border)", color: isToday ? "var(--subtle-foreground)" : "var(--foreground)", cursor: isToday ? "default" : "pointer" }}
            >
              <Icon name="chevR" size={14} />
            </button>
          </>
        }
      />

      <div className="row-3" style={{ marginBottom: 20 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20, display: "flex", alignItems: "center", gap: 18 }}>
          <Donut
            size={140} thickness={16}
            slices={[
              { color: "var(--macro-protein)", value: totals.protein * 4 },
              { color: "var(--macro-carbs)",   value: totals.carbs * 4 },
              { color: "var(--macro-fat)",      value: totals.fat * 9 },
              { color: "transparent",           value: Math.max(0, GOAL_CALORIES - totals.calories) },
            ]}
            centerValue={Math.round(totals.calories)}
            centerSub={`/ ${GOAL_CALORIES}`}
            centerLabel="kcal"
          />
          <div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", marginBottom: 4 }}>Remaining</div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-mono, ui-monospace)", lineHeight: 1, color: remaining > 0 ? "var(--m-food)" : "var(--m-health)" }}>
              {Math.abs(remaining)}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
              kcal {remaining >= 0 ? "left" : "over"}
            </div>
          </div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Macros</div>
          <MacroBar label="Protein" value={totals.protein} goal={GOAL_PROTEIN} color="var(--macro-protein)" />
          <MacroBar label="Carbs"   value={totals.carbs}   goal={GOAL_CARBS}   color="var(--macro-carbs)" />
          <MacroBar label="Fat"     value={totals.fat}     goal={GOAL_FAT}     color="var(--macro-fat)" />
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>By meal</div>
          {meals.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>No meals logged.</p>
          )}
          {meals.length > 0 && (
            <StackedBar
              height={110}
              groups={meals.map((meal) => ({
                label: meal.name,
                segments: [
                  { name: "P", value: meal.items.reduce((s, i) => s + i.protein * 4, 0), color: "var(--macro-protein)" },
                  { name: "C", value: meal.items.reduce((s, i) => s + i.carbs * 4, 0),   color: "var(--macro-carbs)" },
                  { name: "F", value: meal.items.reduce((s, i) => s + i.fat * 9, 0),     color: "var(--macro-fat)" },
                ],
              }))}
            />
          )}
        </div>
      </div>

      <div className="split-food">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isLoading && [1, 2].map((i) => (
            <div key={i} style={{ height: 96, borderRadius: 16, background: "var(--card-2)", animation: "pulse 1.5s infinite" }} />
          ))}
          {!isLoading && meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} date={date} />
          ))}

          <button
            onClick={() => addMeal.mutate({ name: "Meal", date })}
            style={{
              border: "1.5px dashed var(--border-strong)", background: "transparent",
              borderRadius: 16, padding: "16px 18px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              color: "var(--muted-foreground)", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Icon name="plus" size={16} /> Add meal
          </button>
        </div>

        <SavedMealsBrowser date={date} />
      </div>
    </div>
  );
}
