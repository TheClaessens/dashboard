"use client";

import { useMemo } from "react";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { getWeekEvents, formatEventTime } from "@/lib/schemas/calendar";
import type { CalendarEvent } from "@/lib/schemas/calendar";

function getWeekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay() || 7; // Sunday=0 → 7, keeps Mon-first convention
  d.setDate(d.getDate() - dayOfWeek + 1);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getEventStartDate(event: CalendarEvent): string {
  if ("date" in event.start) return event.start.date;
  return new Date(event.start.dateTime).toLocaleDateString("en-CA");
}

function DayColumn({ day, events }: { day: Date; events: CalendarEvent[] }) {
  const label = day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const isToday = day.toLocaleDateString("en-CA") === new Date().toLocaleDateString("en-CA");

  return (
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-medium mb-2 pb-1 border-b border-zinc-200 dark:border-zinc-800 ${isToday ? "text-blue-500" : "text-zinc-500"}`}>
        {label}
      </div>
      {events.length === 0 && (
        <p className="text-xs text-zinc-300 dark:text-zinc-700">—</p>
      )}
      <ul className="space-y-1">
        {events.map((event) => (
          <li key={event.id} className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 px-2 py-1">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">{event.summary}</p>
            <p className="text-xs text-blue-500">{formatEventTime(event)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 h-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      ))}
    </div>
  );
}

export default function CalendarPage() {
  const weekStart = useMemo(getWeekStart, []);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const { data: allEvents = [], isLoading } = useCalendarEvents(weekStart, weekEnd);
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekEvents = useMemo(() => getWeekEvents(allEvents, weekStart), [allEvents, weekStart]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Calendar</h1>

      {isLoading && <LoadingState />}

      {!isLoading && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((day) => {
            const dayStr = day.toLocaleDateString("en-CA");
            const dayEvents = weekEvents.filter((e) => getEventStartDate(e) === dayStr);
            return <DayColumn key={dayStr} day={day} events={dayEvents} />;
          })}
        </div>
      )}
    </div>
  );
}
