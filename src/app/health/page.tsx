"use client";

export const dynamic = "force-dynamic";

import { type FC, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Icon, Stat } from "@/components/widget";
import { AreaChart, Sparkline, BarChart, Heatmap } from "@/components/charts";
import { deriveForm, formatSleepDuration } from "@/lib/health";
import { useQuery } from "@tanstack/react-query";
import type { Activity, Wellness } from "@/lib/intervals-icu";

interface HealthPageData {
  activities: Activity[];
  wellness: Wellness | null;
}

async function fetchHealthData(): Promise<HealthPageData> {
  const res = await fetch("/api/health");
  if (!res.ok) return { activities: [], wellness: null };
  return res.json() as Promise<HealthPageData>;
}

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

function deriveActivityIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("run")) return "run";
  if (t.includes("bike") || t.includes("ride") || t.includes("cycling")) return "bike";
  return "bolt";
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ── HeroStat ──────────────────────────────────────────────────

interface HeroStatProps {
  label: string;
  sublabel: string;
  value: string | number;
  color: string;
  series: number[];
  suffix?: React.ReactNode;
}

const HeroStat: FC<HeroStatProps> = ({ label, sublabel, value, color, series, suffix }) => (
  <div style={{
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18,
    padding: 18, position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, ${color}, transparent 70%)`,
    }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: "var(--subtle-foreground)", fontFamily: "var(--font-mono, ui-monospace)", marginTop: 2 }}>
          {sublabel}
        </div>
      </div>
      {suffix}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
      <span style={{
        fontSize: 42, fontWeight: 700, fontFamily: "var(--font-mono, ui-monospace)",
        fontVariantNumeric: "tabular-nums", lineHeight: 1, color,
      }}>{value}</span>
    </div>
    {series.length > 1 && (
      <Sparkline data={series} color={color} width={220} height={32} />
    )}
  </div>
);

// ── StatMini ──────────────────────────────────────────────────

interface StatMiniProps {
  label: string;
  value: string | number;
  color?: string;
}

const StatMini: FC<StatMiniProps> = ({ label, value, color }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0, minWidth: 48 }}>
    <div style={{
      fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono, ui-monospace)",
      color: color ?? "var(--foreground)",
    }}>{value}</div>
    <div style={{ fontSize: 10, color: "var(--subtle-foreground)", letterSpacing: "0.05em" }}>{label}</div>
  </div>
);

// ── Pill (inline, no dep) ─────────────────────────────────────

interface PillProps {
  color: string;
  children: React.ReactNode;
}

const Pill: FC<PillProps> = ({ color, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", fontSize: 10.5, fontWeight: 600, borderRadius: 999,
    background: `color-mix(in oklch, ${color} 18%, transparent)`,
    color, border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
  }}>{children}</span>
);

// ── Page ──────────────────────────────────────────────────────

export default function HealthPage() {
  const [range, setRange] = useState("60d");
  const [now] = useState<number>(() => Date.now());
  const { data, isLoading } = useQuery({ queryKey: ["health"], queryFn: fetchHealthData });

  const activities = data?.activities ?? [];
  const wellness = data?.wellness ?? null;

  const sorted = [...activities].sort(
    (a, b) => a.startDateLocal.localeCompare(b.startDateLocal)
  );

  const latestActivity = sorted[sorted.length - 1] ?? null;
  const ctl = latestActivity ? Math.round(latestActivity.ctl) : 0;
  const atl = latestActivity ? Math.round(latestActivity.atl) : 0;
  const tsb = deriveForm(latestActivity?.ctl ?? 0, latestActivity?.atl ?? 0);
  const tsbRounded = Math.round(tsb);
  const formLabel = deriveFormLabel(tsb);
  const formColor = deriveFormColor(tsb);

  const ctlSeries = sorted.map((a) => a.ctl);
  const atlSeries = sorted.map((a) => a.atl);
  const tsbSeries = sorted.map((a) => a.ctl - a.atl);

  const weeklyTSSMap: Record<string, number> = {};
  for (const a of activities) {
    if (a.tss == null) continue;
    const d = new Date(a.startDateLocal);
    const weekNum = Math.floor((now - d.getTime()) / (7 * 86400000));
    const key = String(weekNum);
    weeklyTSSMap[key] = (weeklyTSSMap[key] ?? 0) + a.tss;
  }
  const weeklyTSS = Array.from({ length: 8 }, (_, i) => weeklyTSSMap[String(7 - i)] ?? 0);
  const weekLabels = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now - (7 - i) * 7 * 86400000);
    return `W${d.getMonth() + 1}/${d.getDate()}`;
  });

  const heatmapValues = (() => {
    const weeks = 16;
    const days = 7;
    const vals = Array<number>(weeks * days).fill(0);
    for (const a of activities) {
      const d = new Date(a.startDateLocal);
      const daysAgo = Math.floor((now - d.getTime()) / 86400000);
      if (daysAgo >= weeks * days) continue;
      const colFromEnd = Math.floor(daysAgo / 7);
      const col = weeks - 1 - colFromEnd;
      const row = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const idx = col * days + row;
      if (idx >= 0 && idx < vals.length) {
        vals[idx] = Math.min(5, (vals[idx] ?? 0) + 1);
      }
    }
    return vals;
  })();

  const rangeDays = parseInt(range) || 60;
  const filteredSorted = sorted.filter((a) => {
    const daysAgo = (now - new Date(a.startDateLocal).getTime()) / 86400000;
    return daysAgo <= rangeDays;
  });
  const chartCtl = filteredSorted.map((a) => a.ctl);
  const chartAtl = filteredSorted.map((a) => a.atl);
  const chartTsb = filteredSorted.map((a) => a.ctl - a.atl + 50);
  const chartLabels = filteredSorted.map((a) => {
    const d = new Date(a.startDateLocal);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Health" icon="health" color="var(--m-health)" subtitle="Training load · intervals.icu" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 140, borderRadius: 18, background: "var(--card-2)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Health"
        icon="health"
        color="var(--m-health)"
        subtitle="Training load · intervals.icu"
        actions={
          <>
            <div style={{ display: "flex", background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 999, padding: 2 }}>
              {["7d", "30d", "60d", "90d"].map((r) => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: range === r ? "var(--m-health)" : "transparent",
                  color: range === r ? "var(--background)" : "var(--muted-foreground)",
                }}>{r}</button>
              ))}
            </div>
          </>
        }
      />

      <div className="row-4" style={{ marginBottom: 16 }}>
        <HeroStat label="Fitness" sublabel="CTL" value={ctl} color="var(--m-health)" series={ctlSeries} />
        <HeroStat label="Fatigue" sublabel="ATL" value={atl} color="var(--m-todos)" series={atlSeries} />
        <HeroStat
          label="Form" sublabel="TSB" value={tsbRounded} color={formColor} series={tsbSeries}
          suffix={<Pill color={formColor}>{formLabel}</Pill>}
        />
        <HeroStat label="Ramp rate" sublabel="ΔCTL/7d" value={
          ctlSeries.length >= 2 ? `${ctlSeries[ctlSeries.length - 1] > ctlSeries[0] ? "+" : ""}${(ctlSeries[ctlSeries.length - 1] - ctlSeries[0]).toFixed(1)}` : "—"
        } color="var(--m-food)" series={ctlSeries} />
      </div>

      {chartCtl.length >= 2 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Training load</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>Fitness vs fatigue · last {range}</p>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: "var(--muted-foreground)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--m-health)" }} />Fitness (CTL)</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--m-todos)" }} />Fatigue (ATL)</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--m-food)" }} />Form (TSB+50)</span>
            </div>
          </div>
          <AreaChart
            height={240}
            series={[
              { name: "CTL", color: "var(--m-health)", data: chartCtl, labels: chartLabels },
              { name: "ATL", color: "var(--m-todos)", data: chartAtl },
              { name: "TSB", color: "var(--m-food)", data: chartTsb },
            ]}
          />
        </div>
      )}

      {wellness && (
        <div className="row-4" style={{ marginBottom: 16 }}>
          {wellness.weight != null && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
              <Stat label="Weight" value={wellness.weight} unit="kg" hint="Today" />
            </div>
          )}
          {wellness.hrv != null && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
              <Stat label="HRV" value={wellness.hrv} unit="ms" hint="Today" />
            </div>
          )}
          {wellness.restingHr != null && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
              <Stat label="Resting HR" value={wellness.restingHr} unit="bpm" hint="Today" />
            </div>
          )}
          {wellness.sleepSecs != null && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
              <Stat label="Sleep" value={formatSleepDuration(wellness.sleepSecs)} hint="Last night" />
            </div>
          )}
        </div>
      )}

      <div className="row-h-bottom" style={{ marginBottom: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Recent activities</h3>
          </div>
          {activities.length === 0 && (
            <p style={{ padding: "20px 18px", fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
              No activities found. Check Intervals.icu connection.
            </p>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {[...activities].slice(0, 8).map((a, i) => {
              const icon = deriveActivityIcon(a.type);
              const color = a.type.toLowerCase().includes("run") ? "var(--m-todos)" : "var(--m-health)";
              return (
                <li key={a.id} style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr auto auto auto",
                  gap: 14, alignItems: "center", padding: "12px 18px",
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: `color-mix(in oklch, ${color} 18%, transparent)`,
                    color, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={icon} size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--subtle-foreground)" }}>
                      {new Date(a.startDateLocal).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {a.type}
                    </div>
                  </div>
                  <StatMini label="Dur" value={formatDuration(a.movingTime)} />
                  <StatMini label="TSS" value={a.tss ?? "—"} color={a.tss != null && a.tss > 80 ? "var(--m-health)" : undefined} />
                  <StatMini label="CTL" value={Math.round(a.ctl)} />
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Weekly TSS</h3>
          </div>
          <p style={{ margin: "2px 0 14px", fontSize: 11.5, color: "var(--muted-foreground)" }}>Last 8 weeks</p>
          <BarChart data={weeklyTSS} labels={weekLabels} color="var(--m-health)" height={150} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <Stat label="Avg/week" value={Math.round(weeklyTSS.reduce((a, b) => a + b, 0) / Math.max(weeklyTSS.filter(Boolean).length, 1))} hint="TSS" />
            <Stat label="This week" value={weeklyTSS[weeklyTSS.length - 1]} hint="TSS" color="var(--m-health)" />
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Training calendar</h3>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--muted-foreground)" }}>Activity days · last 16 weeks</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--subtle-foreground)" }}>
            Less
            {[0, 1, 2, 3, 4].map((o) => (
              <span key={o} style={{
                width: 11, height: 11, borderRadius: 3,
                background: o === 0 ? "var(--card-2)" : "var(--m-health)",
                opacity: o === 0 ? 1 : 0.15 + o * 0.2,
              }} />
            ))}
            More
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <Heatmap weeks={16} days={7} values={heatmapValues} color="var(--m-health)" cell={16} gap={4} />
        </div>
      </div>
    </div>
  );
}
