"use client";

import { useId } from "react";

// ── Path helpers ─────────────────────────────────────────────

function buildPath(pts: [number, number][], smooth = 0.18): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cpx = x0 + (x1 - x0) * smooth * 2.4;
    d += ` C ${cpx} ${y0}, ${x1 - (x1 - x0) * smooth * 2.4} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function niceRange(vals: number[], padTop = 0.15, padBot = 0.1): [number, number] {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const span = Math.max(hi - lo, 1);
  return [lo - span * padBot, hi + span * padTop];
}

// ── Sparkline ────────────────────────────────────────────────

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
}

export function Sparkline({ data, color = "var(--primary)", height = 36, width = 120, fill = true }: SparklineProps) {
  const id = useId();
  const [lo, hi] = niceRange(data);
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - lo) / (hi - lo)) * height * 0.86 - 3,
  ]);
  const linePath = buildPath(pts);
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaPath} fill={`url(#spark-${id})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

// ── AreaChart ────────────────────────────────────────────────

interface AreaSeries {
  name: string;
  color: string;
  data: number[];
  labels?: string[];
}

interface AreaChartProps {
  series: AreaSeries[];
  height?: number;
  showAxes?: boolean;
}

export function AreaChart({ series, height = 200, showAxes = true }: AreaChartProps) {
  const id = useId();
  const w = 600;
  const h = height;
  const padL = showAxes ? 32 : 8;
  const padR = 8;
  const padT = 12;
  const padB = showAxes ? 22 : 8;
  const iw = w - padL - padR;
  const ih = h - padT - padB;
  const allVals = series.flatMap((s) => s.data);
  const [lo, hi] = niceRange(allVals, 0.15, 0.05);
  const N = series[0].data.length;
  const x = (i: number) => padL + (i / (N - 1)) * iw;
  const y = (v: number) => padT + ih - ((v - lo) / (hi - lo)) * ih;
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => lo + (i / ticks) * (hi - lo));

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        {series.map((s, si) => (
          <linearGradient key={si} id={`area-${id}-${si}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.36" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {showAxes && yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray="2 4" />
          <text x={padL - 6} y={y(t)} textAnchor="end" dominantBaseline="middle"
            fontSize="10" fill="var(--subtle-foreground)" fontFamily="var(--font-mono, ui-monospace)">
            {Math.round(t)}
          </text>
        </g>
      ))}
      {series.map((s, si) => {
        const pts: [number, number][] = s.data.map((v, i) => [x(i), y(v)]);
        const linePath = buildPath(pts);
        const areaPath = `${linePath} L ${x(N - 1)} ${padT + ih} L ${x(0)} ${padT + ih} Z`;
        return (
          <g key={si}>
            <path d={areaPath} fill={`url(#area-${id}-${si})`} />
            <path d={linePath} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })}
      {showAxes && Array.from({ length: 6 }).map((_, i) => {
        const idx = Math.round((i / 5) * (N - 1));
        const lbl = series[0].labels?.[idx];
        if (!lbl) return null;
        const anchor = i === 0 ? "start" : i === 5 ? "end" : "middle";
        return (
          <text key={i} x={x(idx)} y={h - 6} textAnchor={anchor} fontSize="10"
            fill="var(--subtle-foreground)" fontFamily="var(--font-mono, ui-monospace)">{lbl}</text>
        );
      })}
    </svg>
  );
}

// ── Donut ────────────────────────────────────────────────────

interface DonutSlice {
  color: string;
  value: number;
}

interface DonutProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: number;
  centerSub?: string;
}

export function Donut({ slices, size = 140, thickness = 14, centerLabel, centerValue, centerSub }: DonutProps) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const circ = 2 * Math.PI * r;
  const offsets = slices.reduce<number[]>((acc, s) => {
    const prev = acc[acc.length - 1] ?? 0;
    return [...acc, prev + (s.value / total) * circ];
  }, []);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--card-2)" strokeWidth={thickness} />
        {slices.map((s, i) => {
          const len = (s.value / total) * circ;
          const dash = `${len} ${circ - len}`;
          const startOffset = i === 0 ? 0 : offsets[i - 1];
          return (
            <circle key={i} cx={c} cy={c} r={r}
              fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={dash} strokeDashoffset={-startOffset}
              strokeLinecap="butt" />
          );
        })}
      </svg>
      {(centerValue !== undefined || centerLabel) && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          {centerLabel && (
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle-foreground)" }}>
              {centerLabel}
            </div>
          )}
          {centerValue !== undefined && (
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-mono, ui-monospace)", fontVariantNumeric: "tabular-nums" }}>
              {centerValue}
            </div>
          )}
          {centerSub && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{centerSub}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ProgressRing ─────────────────────────────────────────────

interface ProgressRingProps {
  value: number;
  max?: number;
  color?: string;
  size?: number;
  thickness?: number;
}

export function ProgressRing({ value, max = 100, color = "var(--primary)", size = 76, thickness = 9 }: ProgressRingProps) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--card-2)" strokeWidth={thickness} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeLinecap="round" strokeDasharray={`${pct * circ} ${circ}`} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", lineHeight: 1.1,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono, ui-monospace)" }}>
          {Math.round(pct * 100)}<span style={{ fontSize: 9, color: "var(--muted-foreground)" }}>%</span>
        </div>
      </div>
    </div>
  );
}

// ── Heatmap ──────────────────────────────────────────────────

interface HeatmapProps {
  weeks?: number;
  days?: number;
  values: number[];
  color?: string;
  cell?: number;
  gap?: number;
}

export function Heatmap({ weeks = 16, days = 7, values, color = "var(--m-food)", cell = 14, gap = 4 }: HeatmapProps) {
  const max = Math.max(...values, 1);
  const dayLabels = ["M", "", "W", "", "F", "", ""];
  return (
    <div style={{ display: "inline-block" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `${cell + 4}px ${weeks * cell + (weeks - 1) * gap}px`,
      }}>
        <div style={{
          display: "grid", gridTemplateRows: `repeat(${days}, ${cell}px)`, rowGap: gap,
          fontSize: 9, color: "var(--subtle-foreground)", fontFamily: "var(--font-mono, ui-monospace)",
        }}>
          {dayLabels.slice(0, days).map((d, i) => (
            <div key={i} style={{ lineHeight: `${cell}px`, paddingRight: 4, textAlign: "right" }}>{d}</div>
          ))}
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeks}, ${cell}px)`,
          gridTemplateRows: `repeat(${days}, ${cell}px)`,
          gridAutoFlow: "column",
          gap,
        }}>
          {values.map((v, i) => {
            const t = v / max;
            const opacity = v === 0 ? 0.05 : 0.18 + t * 0.82;
            return (
              <div key={i} title={String(v)} style={{
                width: cell, height: cell, borderRadius: 4,
                background: v === 0 ? "var(--card-2)" : color,
                opacity,
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── StackedBar ───────────────────────────────────────────────

interface StackedBarSegment {
  name: string;
  value: number;
  color: string;
}

interface StackedBarGroup {
  label: string;
  segments: StackedBarSegment[];
}

interface StackedBarProps {
  groups: StackedBarGroup[];
  height?: number;
  gap?: number;
}

export function StackedBar({ groups, height = 160, gap = 14 }: StackedBarProps) {
  const totalMax = Math.max(...groups.map((g) => g.segments.reduce((s, x) => s + x.value, 0)), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap, height: height + 24 }}>
      {groups.map((g, gi) => {
        const total = g.segments.reduce((s, x) => s + x.value, 0);
        const ratio = total / totalMax;
        const barH = Math.max(2, height * ratio);
        return (
          <div key={gi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: "100%", height: barH, borderRadius: 10, overflow: "hidden",
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              background: "var(--card-2)", border: "1px solid var(--border)",
            }}>
              {g.segments.map((seg, i) => {
                const segH = total === 0 ? 0 : (seg.value / total) * (barH - 2);
                return (
                  <div key={i} title={`${seg.name}: ${seg.value}`} style={{
                    height: segH, background: seg.color, opacity: 0.92,
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{g.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── BarChart ─────────────────────────────────────────────────

interface BarChartProps {
  data: number[];
  color?: string;
  height?: number;
  labels?: string[];
}

export function BarChart({ data, color = "var(--primary)", height = 120, labels }: BarChartProps) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: height + 20 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: "100%", height: `${(v / max) * height}px`,
            background: `linear-gradient(180deg, ${color}, color-mix(in oklch, ${color} 55%, transparent))`,
            borderRadius: 6, minHeight: 2,
          }} />
          {labels && <div style={{ fontSize: 10, color: "var(--subtle-foreground)" }}>{labels[i]}</div>}
        </div>
      ))}
    </div>
  );
}

// ── DeltaBadge ───────────────────────────────────────────────

interface DeltaBadgeProps {
  value: number;
  suffix?: string;
  inverse?: boolean;
}

export function DeltaBadge({ value, suffix = "", inverse = false }: DeltaBadgeProps) {
  const positive = value > 0;
  const good = inverse ? !positive : positive;
  const color = value === 0 ? "var(--muted-foreground)" : good ? "var(--success)" : "var(--destructive)";
  const sign = value > 0 ? "↑" : value < 0 ? "↓" : "·";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 11, fontWeight: 600, color,
      fontFamily: "var(--font-mono, ui-monospace)",
    }}>
      <span>{sign}</span>
      <span>{Math.abs(value)}{suffix}</span>
    </span>
  );
}
