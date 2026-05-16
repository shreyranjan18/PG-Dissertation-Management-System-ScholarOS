import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { useAuth } from "@/lib/auth";
import { Sun, Moon } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — ScholarOS" }] }),
  component: Page,
});

function Page() {
  const { user, theme, toggleTheme } = useAuth();
  return (
    <>
      <PageHeader kicker="Account" title="Settings" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border glass p-5">
            <div className="font-display text-lg font-semibold">Profile</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" v={user?.name ?? ""} />
              <Field label="Email" v={user?.email ?? ""} />
              <Field label="Role" v={user?.role ?? ""} />
              <Field label="Department" v="CSE" />
            </div>
          </div>

          <div className="rounded-2xl border border-border glass p-5">
            <div className="font-display text-lg font-semibold">Notifications</div>
            <div className="mt-3 space-y-2">
              {["Email — submission updates", "Push — meeting reminders", "SMS — viva alerts only"].map(l => (
                <label key={l} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3 text-sm">
                  <span>{l}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-9 appearance-none rounded-full bg-muted relative transition-all checked:bg-primary before:absolute before:left-0.5 before:top-0.5 before:h-3 before:w-3 before:rounded-full before:bg-card before:transition-all checked:before:left-[1.25rem]" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border glass p-5">
          <div className="font-display text-lg font-semibold">Appearance</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => theme === "dark" ? null : toggleTheme()} className={`rounded-xl border p-3 text-sm ${theme === "dark" ? "border-primary/60 bg-primary/15 text-primary" : "border-border"}`}>
              <Moon className="mb-2 h-4 w-4" /> Dark
            </button>
            <button onClick={() => theme === "light" ? null : toggleTheme()} className={`rounded-xl border p-3 text-sm ${theme === "light" ? "border-primary/60 bg-primary/15 text-primary" : "border-border"}`}>
              <Sun className="mb-2 h-4 w-4" /> Light
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
            ScholarOS v1.0 · Build 2026.05
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <input defaultValue={v} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
    </div>
  );
}
