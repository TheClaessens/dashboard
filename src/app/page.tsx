export const dynamic = "force-dynamic";

import { type FC } from "react";
import { Widget, Stat, Icon } from "@/components/widget";
import { AreaChart, Donut, Sparkline, BarChart, Heatmap } from "@/components/charts";
import { formatEventTime } from "@/lib/schemas/calendar";
import {
  getUpcomingTodos,
  getTodayCalendarEvents,
  getTodayMacros,
  getRecentActivities,
  getTodayWellness,
} from "@/app/page.utils";
import { deriveForm, formatSleepDuration } from "@/lib/health";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";
import type { Macros } from "@/lib/schemas/food";
import type { Activity, Wellness } from "@/lib/intervals-icu";

const GOAL_CALORIES = 2400;
const GOAL_PROTEIN = 160;
const GOAL_CARBS = 260;
const GOAL_FAT = 80;

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

// ── FoodMacroBar ──────────────────────────────────────────────

interface FoodMacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
}

const FoodMacroBar: FC<FoodMacroBarProps> = ({ label, value, goal, color }) => {
  const pct = Math.min(value / goal, 1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono, ui-monospace)", fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}<span style={{ color: "var(--muted-foreground)" }}>/{goal}g</span>
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: "var(--card-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
};

// ── Widgets ───────────────────────────────────────────────────

interface HealthWidgetProps {
  activities: Activity[];
}

const HealthWidget: FC<HealthWidgetProps> = ({ activities }) => {
  const sorted = [...activities].sort((a, b) => a.startDateLocal.localeCompare(b.startDateLocal));
  const latest = sorted[sorted.length - 1] ?? null;
  const ctl = latest ? Math.round(latest.ctl) : 0;
  const atl = latest ? Math.round(latest.atl) : 0;
  const tsb = deriveForm(latest?.ctl ?? 0, latest?.atl ?? 0);
  const formLabel = deriveFormLabel(tsb);
  const formColor = deriveFormColor(tsb);

  const ctlSeries = sorted.map((a) => a.ctl);
  const atlSeries = sorted.map((a) => a.atl);
  const labels = sorted.map((a) => {
    const d = new Date(a.startDateLocal);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

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
      {!latest && <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>No training data.</p>}
      {latest && (
        <>
          <div style={{ display: "flex", gap: 24, marginBottom: 10, marginTop: 4, flexWrap: "wrap" }}>
            <Stat label="Fitness" value={ctl} hint="CTL" color="var(--m-health)" />
            <Stat label="Fatigue" value={atl} hint="ATL" />
            <Stat label="Form" value={Math.round(tsb)} hint={formLabel} color={formColor} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginBottom: 6, display: "flex", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="dot" style={{ background: "var(--m-health)" }} />Fitness (CTL)
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="dot" style={{ background: "var(--m-todos)" }} />Fatigue (ATL)
            </span>
          </div>
          {ctlSeries.length >= 2 && (
            <AreaChart
              height={150}
              series={[
                { name: "CTL", color: "var(--m-health)", data: ctlSeries, labels },
                { name: "ATL", color: "var(--m-todos)",  data: atlSeries },
              ]}
            />
          )}
        </>
      )}
    </Widget>
  );
};

interface FoodWidgetProps {
  macros: Macros;
}

const FoodWidget: FC<FoodWidgetProps> = ({ macros }) => {
  const hasData = macros.calories > 0;
  return (
    <Widget
      title="Food"
      icon="food"
      color="var(--m-food)"
      subtitle={`${Math.round(macros.calories)} / ${GOAL_CALORIES} kcal`}
      spanCol={5}
      href="/food"
    >
      {!hasData && <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>Nothing logged today.</p>}
      {hasData && (
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 4, flexWrap: "wrap" }}>
          <Donut
            size={100} thickness={12}
            slices={[
              { color: "var(--macro-protein)", value: macros.protein * 4 },
              { color: "var(--macro-carbs)",   value: macros.carbs * 4 },
              { color: "var(--macro-fat)",      value: macros.fat * 9 },
              { color: "transparent",           value: Math.max(0, GOAL_CALORIES - macros.calories) },
            ]}
            centerValue={Math.round(macros.calories)}
            centerLabel="kcal"
          />
          <div style={{ flex: 1, minWidth: 120, display: "flex", flexDirection: "column", gap: 8 }}>
            <FoodMacroBar label="Protein" value={macros.protein} goal={GOAL_PROTEIN} color="var(--macro-protein)" />
            <FoodMacroBar label="Carbs"   value={macros.carbs}   goal={GOAL_CARBS}   color="var(--macro-carbs)" />
            <FoodMacroBar label="Fat"     value={macros.fat}     goal={GOAL_FAT}     color="var(--macro-fat)" />
          </div>
        </div>
      )}
    </Widget>
  );
};

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
    {events.length === 0 && <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>Nothing scheduled today.</p>}
    {events.length > 0 && (
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map((event) => (
          <li key={event.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 10px", background: "var(--card-2)", borderRadius: 8,
            border: "1px solid var(--border)",
          }}>
            <span style={{ width: 3, alignSelf: "stretch", borderRadius: 4, background: "var(--m-calendar)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {event.summary}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono, ui-monospace)" }}>
                {formatEventTime(event)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Widget>
);

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
    {items.length === 0 && <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>All caught up!</p>}
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.slice(0, 4).map((todo) => (
        <li key={todo.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
          <span style={{ width: 16, height: 16, borderRadius: 999, border: "1.5px solid var(--border-strong)", flexShrink: 0 }} />
          <span style={{
            flex: 1, fontSize: 13, minWidth: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{todo.title}</span>
          {todo.dueDate && (
            <span style={{ fontSize: 10, color: "var(--subtle-foreground)", fontFamily: "var(--font-mono, ui-monospace)", flexShrink: 0 }}>
              {todo.dueDate}
            </span>
          )}
        </li>
      ))}
    </ul>
  </Widget>
);

interface WellnessWidgetProps {
  wellness: Wellness | null;
}

const SleepWidget: FC<WellnessWidgetProps> = ({ wellness }) => {
  const series = wellness?.sleepSecs != null
    ? [wellness.sleepSecs / 3600]
    : [0];

  return (
    <Widget title="Sleep" icon="bed" color="var(--m-calendar)" spanCol={2}>
      <Stat value={wellness?.sleepSecs != null ? formatSleepDuration(wellness.sleepSecs) : "—"} hint="Last night" />
      <div style={{ marginTop: 8 }}>
        <Sparkline data={series.length > 1 ? series : [...series, ...series]} color="var(--m-calendar)" width={140} height={32} />
      </div>
    </Widget>
  );
};

const WeightWidget: FC<WellnessWidgetProps> = ({ wellness }) => (
  <Widget title="Weight" icon="weight" color="var(--m-food)" spanCol={2}>
    <Stat value={wellness?.weight ?? "—"} unit={wellness?.weight != null ? "kg" : ""} hint="Today" />
    {wellness?.weight != null && (
      <div style={{ marginTop: 8 }}>
        <Sparkline data={[wellness.weight, wellness.weight]} color="var(--m-food)" width={140} height={32} fill={false} />
      </div>
    )}
  </Widget>
);

interface LatestActivityWidgetProps {
  activity: Activity | null;
}

const LatestActivityWidget: FC<LatestActivityWidgetProps> = ({ activity }) => (
  <Widget title="Latest activity" icon="bolt" color="var(--m-health)" spanCol={3}>
    {!activity && <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>No activities yet.</p>}
    {activity && (
      <>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {activity.name}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginBottom: 10 }}>{activity.type}</div>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Duration" value={`${Math.round(activity.movingTime / 60)}m`} size="sm" />
          <Stat label="TSS" value={activity.tss ?? "—"} size="sm" color="var(--m-health)" />
          <Stat label="CTL" value={Math.round(activity.ctl)} size="sm" />
        </div>
      </>
    )}
  </Widget>
);

interface WeeklyTSSWidgetProps {
  activities: Activity[];
  todayStr: string;
}

const WeeklyTSSWidget: FC<WeeklyTSSWidgetProps> = ({ activities, todayStr }) => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const weekTSS = Array(7).fill(0) as number[];
  const todayMs = new Date(todayStr).getTime();
  for (const a of activities) {
    if (a.tss == null) continue;
    const daysAgo = Math.floor((todayMs - new Date(a.startDateLocal).getTime()) / 86400000);
    if (daysAgo < 7) {
      const dayIdx = (new Date(a.startDateLocal).getDay() + 6) % 7;
      weekTSS[dayIdx] = (weekTSS[dayIdx] ?? 0) + a.tss;
    }
  }
  const total = weekTSS.reduce((a, b) => a + b, 0);

  return (
    <Widget title="This week" icon="flame" color="var(--m-health)" subtitle="Training stress" spanCol={3}>
      <BarChart data={weekTSS} labels={days} color="var(--m-health)" height={80} />
      <div style={{ marginTop: 4, fontSize: 11, color: "var(--muted-foreground)" }}>
        Total{" "}
        <span style={{ color: "var(--foreground)", fontFamily: "var(--font-mono, ui-monospace)", fontWeight: 600 }}>
          {total} TSS
        </span>
      </div>
    </Widget>
  );
};

const ActivityHeatmapWidget: FC<WeeklyTSSWidgetProps> = ({ activities, todayStr }) => {
  const weeks = 16;
  const days = 7;
  const vals = Array<number>(weeks * days).fill(0);
  const todayMs = new Date(todayStr).getTime();
  for (const a of activities) {
    const d = new Date(a.startDateLocal);
    const daysAgo = Math.floor((todayMs - d.getTime()) / 86400000);
    if (daysAgo >= weeks * days) continue;
    const col = weeks - 1 - Math.floor(daysAgo / 7);
    const row = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const idx = col * days + row;
    if (idx >= 0 && idx < vals.length) {
      vals[idx] = Math.min(5, (vals[idx] ?? 0) + 1);
    }
  }

  return (
    <Widget title="Activity" icon="flame" color="var(--m-health)" subtitle="Days logged · last 16 weeks" spanCol={9}>
      <div style={{ overflowX: "auto", paddingTop: 4 }}>
        <Heatmap weeks={16} days={7} values={vals} color="var(--m-health)" cell={14} gap={4} />
      </div>
    </Widget>
  );
};

// ── Page ──────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [upcomingTodos, todayEvents, todayMacros, recentActivities, wellness] = await Promise.all([
    getUpcomingTodos(),
    getTodayCalendarEvents(),
    getTodayMacros(),
    getRecentActivities(30),
    getTodayWellness(),
  ]);

  const greeting = deriveGreeting();
  const todayStr = new Date().toLocaleDateString("en-CA");
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const latestActivity = recentActivities[0] ?? null;
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
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted-foreground)" }}>
            {upcomingTodos.length} open todo{upcomingTodos.length === 1 ? "" : "s"},{" "}
            {todayEvents.length} events today
            {latestActivity && (
              <>, and a{" "}
                <span style={{ color: formColor, fontWeight: 600 }}>{formLabel.toLowerCase()}</span> training form
              </>
            )}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Icon name="bolt" size={14} color="var(--muted-foreground)" />
        </div>
      </header>

      <div className="bento">
        <HealthWidget activities={recentActivities} />
        <FoodWidget macros={todayMacros} />
        <CalendarWidget events={todayEvents} />
        <TodosWidget items={upcomingTodos} />
        <WeightWidget wellness={wellness} />
        <SleepWidget wellness={wellness} />
        <WeeklyTSSWidget activities={recentActivities} todayStr={todayStr} />
        <ActivityHeatmapWidget activities={recentActivities} todayStr={todayStr} />
        <LatestActivityWidget activity={latestActivity} />
      </div>
    </div>
  );
}
