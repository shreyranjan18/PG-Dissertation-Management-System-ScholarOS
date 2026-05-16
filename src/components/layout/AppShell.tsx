import * as React from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/lib/auth";
import { X } from "lucide-react";

export function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading workspace…</div>;
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72 animate-float-up">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-border bg-card">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
