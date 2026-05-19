export interface Activity {
  id: string;
  name: string;
  type: string;
  startDateLocal: string;
  movingTime: number;
  ctl: number;
  atl: number;
  tss: number | null;
}

export interface Wellness {
  hrv: number | null;
  restingHr: number | null;
  weight: number | null;
  sleepSecs: number | null;
}

function baseUrl() {
  const id = process.env.INTERVALS_ICU_ATHLETE_ID ?? "0";
  return `https://intervals.icu/api/v1/athlete/${id}`;
}

function authHeader(): HeadersInit {
  const apiKey = process.env.INTERVALS_ICU_API_KEY ?? "";
  return {
    Authorization: `Basic ${Buffer.from(`API_KEY:${apiKey}`).toString("base64")}`,
  };
}

export async function getActivities(limit = 10): Promise<Activity[]> {
  const oldest = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");
  const newest = new Date().toLocaleDateString("en-CA");
  const url = `${baseUrl()}/activities?oldest=${oldest}&newest=${newest}`;
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) throw new Error(`Intervals.icu API error: ${res.status}`);
  const data = await res.json() as Record<string, unknown>[];
  return data.slice(0, limit).map((a) => ({
    id: String(a.id),
    name: String(a.name),
    type: String(a.type),
    startDateLocal: String(a.start_date_local),
    movingTime: Number(a.moving_time),
    ctl: Number(a.icu_ctl),
    atl: Number(a.icu_atl),
    tss: a.icu_training_load != null ? Number(a.icu_training_load) : null,
  }));
}

export async function getWellness(date: string): Promise<Wellness | null> {
  const res = await fetch(
    `${baseUrl()}/wellness?oldest=${date}&newest=${date}`,
    { headers: authHeader() }
  );
  if (!res.ok) throw new Error(`Intervals.icu API error: ${res.status}`);
  const data = await res.json() as Record<string, unknown>[];
  if (data.length === 0) return null;
  const w = data[0];
  return {
    hrv: w.hrv != null ? Number(w.hrv) : null,
    restingHr: w.resting_hr != null ? Number(w.resting_hr) : null,
    weight: w.weight != null ? Number(w.weight) : null,
    sleepSecs: w.sleep_secs != null ? Number(w.sleep_secs) : null,
  };
}
