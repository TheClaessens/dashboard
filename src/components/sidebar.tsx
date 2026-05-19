"use client";

import { type FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/widget";

const NAV_ITEMS = [
  { href: "/",         label: "Dashboard", icon: "home",     color: undefined },
  { href: "/todos",    label: "Todos",     icon: "todos",    color: "var(--m-todos)" },
  { href: "/calendar", label: "Calendar",  icon: "calendar", color: "var(--m-calendar)" },
  { href: "/food",     label: "Food",      icon: "food",     color: "var(--m-food)" },
  { href: "/health",   label: "Health",    icon: "health",   color: "var(--m-health)" },
];

export const Sidebar: FC = () => {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 232, flexShrink: 0, padding: "20px 14px",
      display: "flex", flexDirection: "column", gap: 16,
      borderRight: "1px solid var(--border)", background: "var(--background)",
      position: "sticky", top: 0, height: "100dvh",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 8px" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 10,
          background: "linear-gradient(135deg, var(--m-todos), var(--m-health))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15, color: "var(--primary-foreground)",
        }}>T</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Thomas</div>
          <div style={{ fontSize: 11, color: "var(--subtle-foreground)" }}>Personal</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                background: isActive ? "var(--card-2)" : "transparent",
                color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                border: "1px solid", borderColor: isActive ? "var(--border)" : "transparent",
                transition: "background 120ms, color 120ms",
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                background: item.color
                  ? `color-mix(in oklch, ${item.color} ${isActive ? 22 : 14}%, transparent)`
                  : (isActive ? "var(--muted)" : "transparent"),
                color: item.color ?? "currentColor",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={item.icon} size={14} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
