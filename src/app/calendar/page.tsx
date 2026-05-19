"use client";

import { type FC, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/widget";
import { useCalendarEvents } from "@/app/calendar/hooks/useCalendarEvents";
import { getWeekEvents, formatEventTime } from "@/lib/schemas/calendar";
import { deriveWeekStart, deriveWeekDays, eventStartDate } from "@/app/calendar/page.utils";
import type { CalendarEvent } from "@/lib/schemas/calendar";

interface DayColumnProps {
  day: Date;
  events: CalendarEvent[];
}

const DayColumn: FC<DayColumnProps> = ({ day, events }) => {
  const isToday = day.toLocaleDateString("en-CA") === new Date().toLocaleDateString("en-CA");
  const label = day.toLocaleDateString([], { weekday: "short" });
  const dateNum = day.getDate();

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        padding: "8px 4px 10px", marginBottom: 8,
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>{label}</span>
        <span style={{
          fontSize: 18, fontWeight: 700, lineHeight: 1,
          width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: isToday ? "var(--m-calendar)" : "transparent",
          color: isToday ? "var(--background)" : "var(--foreground)",
        }}>{dateNum}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {events.length === 0 && <div style={{ height: 4 }} />}
        {events.map((event) => (
          <div key={event.id} style={{
            borderRadius: 8, padding: "6px 8px", overflow: "hidden",
            background: "color-mix(in oklch, var(--m-calendar) 14%, transparent)",
            borderLeft: "3px solid var(--m-calendar)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--foreground)" }}>
              {event.summary}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono, ui-monospace)", marginTop: 1 }}>
              {formatEventTime(event)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function LoadingState() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 140, borderRadius: 12, background: "var(--card-2)", animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = deriveWeekStart();
    const d = new Date(base);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const { data: allEvents = [], isLoading } = useCalendarEvents(weekStart, weekEnd);
  const days = useMemo(() => deriveWeekDays(weekStart), [weekStart]);
  const weekEvents = useMemo(() => getWeekEvents(allEvents, weekStart), [allEvents, weekStart]);

  const monthYear = weekStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const isCurrentWeek = weekOffset === 0;

  return (
    <div>
      <PageHeader
        title="Calendar"
        icon="calendar"
        color="var(--m-calendar)"
        subtitle={monthYear}
        actions={
          <>
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              style={{ padding: "6px 8px", borderRadius: 10, background: "var(--card-2)", border: "1px solid var(--border)", color: "var(--foreground)", cursor: "pointer" }}
            >
              <Icon name="chevL" size={14} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: isCurrentWeek ? "var(--m-calendar-bg)" : "var(--card-2)",
                border: `1px solid ${isCurrentWeek ? "var(--m-calendar-bd)" : "var(--border)"}`,
                color: isCurrentWeek ? "var(--m-calendar)" : "var(--muted-foreground)", cursor: "pointer",
              }}
            >Today</button>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              style={{ padding: "6px 8px", borderRadius: 10, background: "var(--card-2)", border: "1px solid var(--border)", color: "var(--foreground)", cursor: "pointer" }}
            >
              <Icon name="chevR" size={14} />
            </button>
          </>
        }
      />

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20 }}>
        {isLoading && <LoadingState />}
        {!isLoading && (
          <div style={{ display: "flex", gap: 12 }}>
            {days.map((day) => {
              const dayStr = day.toLocaleDateString("en-CA");
              const dayEvents = weekEvents.filter((e) => eventStartDate(e) === dayStr);
              return <DayColumn key={dayStr} day={day} events={dayEvents} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
