"use client";

import { type FC, type ReactNode } from "react";
import Link from "next/link";

// ── Icon paths ────────────────────────────────────────────────

const ICON_PATHS: Record<string, ReactNode> = {
  home:     <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h14v-9"/></>,
  todos:    <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 9l2.2 2.2L14 8"/><path d="M8 15h8"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></>,
  food:     <><path d="M5 4v8a4 4 0 0 0 4 4v4"/><path d="M9 4v6"/><path d="M5 4v6"/><path d="M16 4c2 0 3 2 3 5s-1 5-3 5v6"/></>,
  health:   <><path d="M20.4 12.6 12 21 3.6 12.6a4.7 4.7 0 0 1 6.6-6.7l1.8 1.8 1.8-1.8a4.7 4.7 0 0 1 6.6 6.7Z"/></>,
  search:   <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  plus:     <><path d="M12 5v14M5 12h14"/></>,
  bolt:     <><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z"/></>,
  flame:    <><path d="M12 3c1 3-2 4-2 7a4 4 0 1 0 8 0c0-3-3-4-3-7-2 2-3 0-3 0Z"/></>,
  clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  weight:   <><path d="M5 7h14l-2 13H7L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></>,
  drop:     <><path d="M12 3c-3 5-6 7-6 11a6 6 0 0 0 12 0c0-4-3-6-6-11Z"/></>,
  bed:      <><path d="M3 18v-7h18v7"/><path d="M3 18v3M21 18v3"/><path d="M7 11V8h6a3 3 0 0 1 3 3"/></>,
  run:      <><circle cx="15" cy="4.5" r="1.5"/><path d="m14 8-3 4 3 2v5"/><path d="m8 10 3-2 3 4 3 1"/><path d="M5 19l3-3"/></>,
  bike:     <><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17 10 8h5l3 9"/><path d="M10 8h2.5"/></>,
  chevR:    <><path d="m9 6 6 6-6 6"/></>,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: FC<IconProps> = ({ name, size = 18, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    {ICON_PATHS[name]}
  </svg>
);

// ── Widget ────────────────────────────────────────────────────

interface WidgetProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  color?: string;
  icon?: string;
  action?: ReactNode;
  spanCol?: number;
  spanRow?: number;
  padded?: boolean;
  href?: string;
  style?: React.CSSProperties;
}

export const Widget: FC<WidgetProps> = ({
  children, title, subtitle, color, icon, action,
  spanCol, spanRow, padded = true, href, style,
}) => {
  const inner = (
    <div
      data-span-col={spanCol}
      data-span-row={spanRow}
      style={{
        position: "relative", display: "flex", flexDirection: "column",
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", boxShadow: "var(--shadow-md)",
        overflow: "hidden",
        gridColumn: spanCol ? `span ${spanCol}` : undefined,
        gridRow: spanRow ? `span ${spanRow}` : undefined,
        ...style,
      }}
    >
      {color && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${color}, transparent 70%)`,
          borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit",
          opacity: 0.9,
        }} />
      )}
      {(title ?? action) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: padded ? "var(--pad-5) var(--pad-5) var(--pad-3)" : 0, gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            {icon && (
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: color ? `color-mix(in oklch, ${color} 18%, transparent)` : "var(--muted)",
                color: color ?? "var(--muted-foreground)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={icon} size={15} />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              {title && (
                <div style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                  textTransform: "uppercase", color: "var(--muted-foreground)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{title}</div>
              )}
              {subtitle && (
                <div style={{
                  fontSize: 12, color: "var(--subtle-foreground)", marginTop: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{subtitle}</div>
              )}
            </div>
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, padding: padded ? "0 var(--pad-5) var(--pad-5)" : 0 }}>
        {children}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ display: "contents" }}>{inner}</Link>;
  }
  return inner;
};

// ── Stat ──────────────────────────────────────────────────────

interface StatProps {
  label?: string;
  value: string | number;
  unit?: string;
  hint?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export const Stat: FC<StatProps> = ({ label, value, unit, hint, color, size = "md" }) => {
  const valueSize = size === "lg" ? 38 : size === "sm" ? 20 : 28;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      {label && (
        <div style={{
          fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600,
          letterSpacing: "0.03em", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>{label}</div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{
          fontSize: valueSize, fontWeight: 700,
          fontFamily: "var(--font-mono, ui-monospace)", fontVariantNumeric: "tabular-nums",
          lineHeight: 1, color: color ?? "var(--foreground)",
        }}>{value}</span>
        {unit && (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{unit}</span>
        )}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: "var(--subtle-foreground)", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
};

// ── MacroRow ──────────────────────────────────────────────────

interface MacroRowProps {
  protein: number;
  carbs: number;
  fat: number;
  total?: number;
}

export const MacroRow: FC<MacroRowProps> = ({ protein, carbs, fat, total }) => {
  const sum = total ?? (protein + carbs + fat || 1);
  const segments = [
    { label: "P", value: protein, color: "var(--macro-protein)" },
    { label: "C", value: carbs,   color: "var(--macro-carbs)" },
    { label: "F", value: fat,     color: "var(--macro-fat)" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 3, height: 6, borderRadius: 999, overflow: "hidden" }}>
        {segments.map((s) => (
          <div key={s.label} style={{
            flex: s.value / sum, background: s.color, minWidth: s.value > 0 ? 3 : 0,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{s.label}</span>
            <span style={{
              fontFamily: "var(--font-mono, ui-monospace)", fontVariantNumeric: "tabular-nums",
              color: "var(--foreground)",
            }}>{Math.round(s.value)}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};
