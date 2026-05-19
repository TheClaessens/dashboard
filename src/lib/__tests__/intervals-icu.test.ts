import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActivities, getWellness } from "@/lib/intervals-icu";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

const mockActivity = {
  id: "abc",
  name: "Morning Run",
  type: "Run",
  start_date_local: "2026-05-19T07:00:00",
  moving_time: 3600,
  icu_ctl: 72.4,
  icu_atl: 85.1,
};

describe("getActivities", () => {
  it("returns parsed activities with ctl and atl", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockActivity],
    } as unknown as Response);

    const result = await getActivities();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "abc",
      name: "Morning Run",
      type: "Run",
      ctl: 72.4,
      atl: 85.1,
    });
  });

  it("returns empty array when API returns no activities", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as unknown as Response);

    const result = await getActivities();
    expect(result).toEqual([]);
  });

  it("throws when API responds with error status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as unknown as Response);

    await expect(getActivities()).rejects.toThrow("Intervals.icu API error: 401");
  });
});

const mockWellness = {
  id: "2026-05-19",
  hrv: 62.3,
  resting_hr: 48,
  weight: 74.5,
  sleep_secs: 27000,
};

describe("getWellness", () => {
  it("returns parsed wellness for a date", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockWellness],
    } as unknown as Response);

    const result = await getWellness("2026-05-19");

    expect(result).toMatchObject({
      hrv: 62.3,
      restingHr: 48,
      weight: 74.5,
      sleepSecs: 27000,
    });
  });

  it("returns null when no wellness data for date", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as unknown as Response);

    const result = await getWellness("2026-05-19");
    expect(result).toBeNull();
  });
});
