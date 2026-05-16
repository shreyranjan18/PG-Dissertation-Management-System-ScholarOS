import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Sparkles, ShieldCheck, MessagesSquare,
  CalendarClock, GitBranch, Bell, Settings, Users, GraduationCap,
  ClipboardList, BarChart3, LogOut, Handshake, Video, Trophy
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const STUDENT = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dissertation", icon: FileText, label: "My Dissertation" },
  { to: "/mentorship", icon: Handshake, label: "Mentorship Hub" },
  { to: "/ai-analysis", icon: Sparkles, label: "AI Analysis" },
  { to: "/plagiarism", icon: ShieldCheck, label: "Plagiarism" },
  { to: "/timeline", icon: GitBranch, label: "Timeline" },
  { to: "/meetings", icon: CalendarClock, label: "Meetings" },
  { to: "/viva", icon: Video, label: "Viva Workspace" },
  { to: "/report-card", icon: Trophy, label: "Report Card" },
  { to: "/chat", icon: MessagesSquare, label: "Chat" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const HOD = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Department Overview" },
  { to: "/dissertation", icon: ClipboardList, label: "Topic Assignments" },
  { to: "/mentorship", icon: Handshake, label: "Mentorship Hub" },
  { to: "/viva", icon: Video, label: "Viva Workspace" },
  { to: "/timeline", icon: GitBranch, label: "Dept. Timeline" },
  { to: "/chat", icon: MessagesSquare, label: "Chat" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const FACULTY = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dissertation", icon: ClipboardList, label: "My Dissertations" },
  { to: "/mentorship", icon: Handshake, label: "Mentorship Hub" },
  { to: "/viva", icon: Video, label: "Viva Workspace" },
  { to: "/timeline", icon: GitBranch, label: "Timeline" },
  { to: "/meetings", icon: CalendarClock, label: "Meetings" },
  { to: "/chat", icon: MessagesSquare, label: "Chat" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: s => s.location.pathname });
  const items = user?.role === "student" ? STUDENT : 
                user?.role === "hod" ? HOD : 
                FACULTY;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-semibold tracking-tight">Scholar<span className="text-gradient">OS</span></div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">PG Dissertation Suite</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-5">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
        <ul className="space-y-1">
          {items.map(it => {
            const active = path === it.to;
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border border-sidebar-border transition-colors",
                    active ? "bg-primary/15 text-primary border-primary/30" : "bg-sidebar-accent/40",
                  )}>
                    <it.icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{it.label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</div>
        <ul className="space-y-1">
          <li>
            <Link to="/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent/40"><Settings className="h-4 w-4" /></span>
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      <div className="m-3 mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/20 p-2">
        <button 
          onClick={logout} 
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-destructive/20 bg-destructive/10">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
