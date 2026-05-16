import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  label, value, delta, icon: Icon, tone = "primary", sub,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "muted";
  sub?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border glass p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
           style={{ background: "var(--color-primary)" }} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={cn(
          "grid h-10 w-10 place-items-center rounded-xl border",
          tone === "primary" && "border-primary/30 bg-primary/10 text-primary",
          tone === "success" && "border-success/30 bg-success/10 text-success",
          tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
          tone === "muted" && "border-border bg-muted text-foreground",
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
            up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
          )}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, kicker, actions }: { title: string; kicker?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{kicker}</div>}
        <h1 className="mt-1 font-display text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
