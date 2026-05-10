import { describe, it, expect } from "vitest";
import { getTodayEvents, getWeekEvents, formatEventTime } from "@/lib/schemas/calendar";

const makeEvent = (id: string, start: string, end: string, allDay = false) => ({
  id,
  summary: `Event ${id}`,
  start: allDay ? { date: start } : { dateTime: start },
  end: allDay ? { date: end } : { dateTime: end },
});

describe("getTodayEvents", () => {
  it("returns events that start today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const events = [
      makeEvent("1", `${today}T09:00:00Z`, `${today}T10:00:00Z`),
      makeEvent("2", "2020-01-01T09:00:00Z", "2020-01-01T10:00:00Z"),
    ];
    expect(getTodayEvents(events).map((e) => e.id)).toEqual(["1"]);
  });

  it("returns empty array when no events today", () => {
    const events = [makeEvent("1", "2020-01-01T09:00:00Z", "2020-01-01T10:00:00Z")];
    expect(getTodayEvents(events)).toEqual([]);
  });

  it("includes all-day events on today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const events = [makeEvent("1", today, today, true)];
    expect(getTodayEvents(events).map((e) => e.id)).toEqual(["1"]);
  });
});

describe("getWeekEvents", () => {
  it("returns events within the 7-day window", () => {
    const weekStart = new Date("2026-05-10T00:00:00Z");
    const events = [
      makeEvent("1", "2026-05-10T09:00:00Z", "2026-05-10T10:00:00Z"),
      makeEvent("2", "2026-05-14T09:00:00Z", "2026-05-14T10:00:00Z"),
      makeEvent("3", "2026-05-17T09:00:00Z", "2026-05-17T10:00:00Z"), // outside
    ];
    const result = getWeekEvents(events, weekStart);
    expect(result.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("excludes events before weekStart", () => {
    const weekStart = new Date("2026-05-10T00:00:00Z");
    const events = [makeEvent("1", "2026-05-09T23:59:00Z", "2026-05-09T23:59:00Z")];
    expect(getWeekEvents(events, weekStart)).toEqual([]);
  });
});

describe("formatEventTime", () => {
  it("formats timed event as HH:MM – HH:MM", () => {
    const event = makeEvent("1", "2026-05-10T09:00:00", "2026-05-10T10:30:00");
    expect(formatEventTime(event)).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns 'All day' for all-day events", () => {
    const event = makeEvent("1", "2026-05-10", "2026-05-11", true);
    expect(formatEventTime(event)).toBe("All day");
  });
});
