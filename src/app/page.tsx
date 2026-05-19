export const dynamic = "force-dynamic";

import { type FC } from "react";
import { Widget, Stat } from "@/components/widget";
import { Donut } from "@/components/charts";
import { formatEventTime } from "@/lib/schemas/calendar";
import {
  getUpcomingTodos,
  getTodayCalendarEvents,
  getTodayMacros,
  getLatestActivity,
} from "@/app/page.utils";
import { deriveForm } from "@/lib/health";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";
import type { Macros } from "@/lib/schemas/food";
import type { Activity } from "@/lib/intervals-icu";

function deriveFormLabel(tsb: number) {
  if (tsb > 5) return "Fresh";
  if (tsb > -10) return "Neutral";
  if (tsb > -20) return "Pushing";
  return "Risk";
}

function deriveFormColor(tsb: number) {
  if (tsb > 5) return "var(--success)";
  if (tsb > -10) return "var(--m-todos)";
  return "var(--m-health)";
}

function deriveGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

// ── Widgets ───────────────────────────────────────────────────

interface TodosWidgetProps {
  items: Todo[];
}

const TodosWidget: FC<TodosWidgetProps> = ({ items }) => (
  <Widget
    title="Todos"
    icon="todos"
    color="var(--m-todos)"
    subtitle={`${items.length} open`}
    spanCol={4}
    href="/todos"
  >
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.length === 0 && (
        <li style={{ fontSize: 13, color: "var(--muted-foreground)" }}>All done!</li>
      )}
      {items.slice(0, 4).map((todo) => (
        <li key={todo.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 4px" }}>
          <span style={{
            width: 18, height: 18, borderRadius: 999, flexShrink: 0,
            border: "1.5px solid var(--border-strong)",
          }} />
          <span style={{
            flex: 1, fontSize: 13, minWidth: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{todo.title}</span>
          {todo.dueDate && (
            <span style={{ fontSize: 10.5, color: "var(--subtle-foreground)", fontFamily: "var(--font-mono, ui-monospace)" }}>
              {todo.dueDate}
            </span>
          )}
        </li>
      ))}
    </ul>
  </Widget>
);

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const CalendarWidget: FC<CalendarWidgetProps> = ({ events }) => (
  <Widget
    title="Today"
    icon="calendar"
    color="var(--m-calendar)"
    subtitle={`${events.length} events`}
    spanCol={5}
    href="/calendar"
  >
    {events.length === 0 && (
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>Nothing scheduled today.</p>
    )}
    {events.length > 0 && (
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map((event) => (
          <li key={event.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "8px 10px",
            background: "var(--card-2)", borderRadius: 10, border: "1px solid var(--border)",
          }}>
            <span style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: "var(--m-calendar)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {event.summary}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono, ui-monospace)" }}>
                {formatEventTime(event)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Widget>
);

interface FoodWidgetProps {
  macros: Macros;
}

const FoodWidget: FC<FoodWidgetProps> = ({ macros }) => {
  const goalCalories = 2400;
  const goalProtein = 160;
  const goalCarbs = 260;
  const goalFat = 80;
  const hasData = macros.calories > 0;

  return (
    <Widget
      title="Food"
      icon="food"
      color="var(--m-food)"
      subtitle={`${Math.round(macros.calories)} / ${goalCalories} kcal`}
      spanCol={5}
      href="/food"
    >
      {!hasData && (
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>Nothing logged today.</p>
      )}
      {hasData && (
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 4, flexWrap: "wrap" }}>
          <Donut
            size={110}
            thickness={13}
            slices={[
              { color: "var(--macro-protein)", value: macros.protein * 4 },
              { color: "var(--macro-carbs)",   value: macros.carbs * 4 },
              { color: "var(--macro-fat)",      value: macros.fat * 9 },
              { color: "transparent",           value: Math.max(0, goalCalories - macros.calories) },
            ]}
            centerValue={Math.round(macros.calories)}
            centerSub={`/ ${goalCalories}`}
            centerLabel="kcal"
          />
          <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 10 }}>
            <FoodMacroRow label="Protein" value={macros.protein} goal={goalProtein} color="var(--macro-protein)" />
            <FoodMacroRow label="Carbs"   value={macros.carbs}   goal={goalCarbs}   color="var(--macro-carbs)" />
            <FoodMacroRow label="Fat"     value={macros.fat}     goal={goalFat}     color="var(--macro-fat)" />
          </div>
        </div>
      )}
    </Widget>
  );
};

interface FoodMacroRowProps {
  label: string;
  value: number;
  goal: number;
  color: string;
}

const FoodMacroRow: FC<FoodMacroRowProps> = ({ label, value, goal, color }) => {
  const pct = Math.min(value / goal, 1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
        <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono, ui-monospace)", fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}<span style={{ color: "var(--muted-foreground)" }}>/{goal}g</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: "var(--card-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
};

interface HealthWidgetProps {
  activity: Activity | null;
}

const HealthWidget: FC<HealthWidgetProps> = ({ activity }) => {
  const ctl = activity ? Math.round(activity.ctl) : 0;
  const atl = activity ? Math.round(activity.atl) : 0;
  const tsb = deriveForm(activity?.ctl ?? 0, activity?.atl ?? 0);
  const formLabel = deriveFormLabel(tsb);
  const formColor = deriveFormColor(tsb);

  return (
    <Widget
      title="Training load"
      icon="health"
      color="var(--m-health)"
      subtitle="Fitness vs fatigue · intervals.icu"
      spanCol={7}
      spanRow={2}
      href="/health"
    >
      {!activity && (
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>No training data available.</p>
      )}
      {activity && (
        <>
          <div style={{ display: "flex", gap: 24, marginBottom: 12, marginTop: 4, flexWrap: "wrap" }}>
            <Stat label="Fitness" value={ctl} hint="CTL" color="var(--m-health)" />
            <Stat label="Fatigue" value={atl} hint="ATL" />
            <Stat label="Form" value={Math.round(tsb)} hint={formLabel} color={formColor} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginBottom: 4, display: "flex", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="dot" style={{ background: "var(--m-health)" }} />Fitness
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="dot" style={{ background: "var(--m-todos)" }} />Fatigue
            </span>
          </div>
        </>
      )}
    </Widget>
  );
};

// ── Page ──────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [upcomingTodos, todayEvents, todayMacros, latestActivity] = await Promise.all([
    getUpcomingTodos(),
    getTodayCalendarEvents(),
    getTodayMacros(),
    getLatestActivity(),
  ]);

  const greeting = deriveGreeting();
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const tsb = deriveForm(latestActivity?.ctl ?? 0, latestActivity?.atl ?? 0);
  const formLabel = deriveFormLabel(tsb);
  const formColor = deriveFormColor(tsb);

  return (
    <div>
      <header style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>{today}</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.05 }}>
            Good {greeting},{" "}
            <span className="font-display" style={{ color: "var(--m-todos)" }}>Thomas</span>.
          </h1>
          {latestActivity && (
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted-foreground)" }}>
              {upcomingTodos.length} open todo{upcomingTodos.length === 1 ? "" : "s"},{" "}
              {todayEvents.length} events today, and a{" "}
              <span style={{ color: formColor, fontWeight: 600 }}>{formLabel.toLowerCase()}</span> training form.
            </p>
          )}
        </div>
      </header>

      <div className="bento">
        <HealthWidget activity={latestActivity} />
        <FoodWidget macros={todayMacros} />
        <CalendarWidget events={todayEvents} />
        <TodosWidget items={upcomingTodos} />
      </div>
    </div>
  );
}
