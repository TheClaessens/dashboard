import { type FC, type ReactNode } from "react";
import { Icon } from "@/components/widget";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  actions?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, icon, color, actions }) => (
  <header style={{
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: 16, marginBottom: 24, flexWrap: "wrap",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {icon && (
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: color ? `color-mix(in oklch, ${color} 18%, transparent)` : "var(--muted)",
          color: color ?? "var(--muted-foreground)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: color ? `1px solid color-mix(in oklch, ${color} 30%, transparent)` : "1px solid var(--border)",
        }}>
          <Icon name={icon} size={20} />
        </div>
      )}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--muted-foreground)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {actions}
      </div>
    )}
  </header>
);
