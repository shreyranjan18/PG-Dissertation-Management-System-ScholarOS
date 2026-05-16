import { Link } from "@tanstack/react-router";
import * as React from "react";
import { StatCard, PageHeader } from "@/components/dashboard/StatCard";
import { useAuth } from "@/lib/auth";
import { Users, FileText, ClipboardCheck, CalendarClock, Filter } from "lucide-react";
import { recentDissertations, submissionTrend } from "@/lib/mock";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import apiClient from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const COPY = {
  faculty: { kicker: "Faculty workspace", title: "Reviews waiting on you", a: "Assigned students", b: "Pending reviews", c: "Revisions requested", d: "Upcoming meetings" },
  evaluator: { kicker: "Evaluator workspace", title: "Evaluations queue", a: "Assigned dissertations", b: "Pending evaluations", c: "Submitted marks", d: "Viva slots" },
  hod: { kicker: "Department oversight", title: "Department health", a: "Faculty active", b: "Reviews this week", c: "Approval rate", d: "Viva pipeline" },
  examiner: { kicker: "External examiner", title: "External evaluation", a: "Assigned theses", b: "Pending reports", c: "Submitted reports", d: "Scheduled vivas" },
} as const;

export function GenericRoleDashboard() {
  const { user } = useAuth();
  const role = (user?.role ?? "faculty") as keyof typeof COPY;
  const c = COPY[role] ?? COPY.faculty;
  const [stats, setStats] = React.useState({
    total_assigned: 0,
    pending_tasks: 0,
    success_rate: 0,
    upcoming_meetings: 0,
    queue: [] as any[]
  });

  React.useEffect(() => {
    apiClient.get(`/dashboard/${role}`).then(res => setStats(res.data)).catch(console.error);
  }, [role]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border glass p-8 md:p-10">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2 opacity-80">{c.kicker}</div>
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
               Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              You have <span className="text-primary font-bold">{stats.pending_tasks} reviews</span> pending for this week. Your department's research efficiency is up by <span className="text-success font-bold">12%</span>.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="h-12 px-6 rounded-2xl gradient-primary text-white font-bold text-sm shadow-glow transition-transform hover:scale-105 active:scale-95">
                New Announcement
             </button>
             <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-border glass hover:bg-accent transition-all">
                <Filter className="h-5 w-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={c.a} value={String(stats.total_assigned)} delta={5} icon={Users} />
        <StatCard label={c.b} value={String(stats.pending_tasks)} delta={-2} icon={ClipboardCheck} tone="warning" />
        <StatCard label={c.c} value={`${stats.success_rate}%`} delta={8} icon={FileText} tone="success" />
        <StatCard label={c.d} value={String(stats.upcoming_meetings)} icon={CalendarClock} sub="Real-time count" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-border glass p-8 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Submission Trends</h3>
              <p className="text-xs text-muted-foreground mt-1">Dissertation activity over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary" /> Submitted</div>
               <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-border" /> Previous</div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionTrend}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis 
                  dataKey="m" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--color-muted-foreground)', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--color-muted-foreground)', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(15, 15, 15, 0.8)", 
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--color-border)", 
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="submitted" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-border glass p-8 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Review Queue</h3>
            <span className="h-6 w-6 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">{stats.queue?.length || 0}</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            <ul className="space-y-4">
              {stats.queue?.length > 0 ? stats.queue.map((d: any) => (
                <li key={d.id} className="group relative rounded-2xl border border-border bg-card/40 p-4 transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-primary uppercase tracking-tighter mb-1 opacity-70">{d.dept}</div>
                      <div className="truncate font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{d.title}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-5 w-5 rounded-lg bg-background border border-border grid place-items-center text-[8px] font-bold">
                           {d.student?.charAt(0) || 'S'}
                        </div>
                        <span className="text-xs text-muted-foreground">{d.student}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className={cn(
                      "text-[9px] uppercase font-black px-2.5 py-1 rounded-lg tracking-widest",
                      d.status === 'approved' ? 'bg-success/20 text-success' : 
                      d.status === 'viva_failed' ? 'bg-destructive/20 text-destructive' :
                      'bg-primary/20 text-primary'
                    )}>
                       {d.status.replace(/_/g, " ")}
                    </div>
                    <Link to={`/mentorship?dissertation_id=${d.id}`} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                       View Details →
                    </Link>
                  </div>
                </li>
              )) : (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-30 text-center">
                  <ClipboardCheck className="h-10 w-10 mb-3" />
                  <p className="text-xs italic">No active students in your queue</p>
                </div>
              )}
            </ul>
          </div>
          <Link to="/dissertation" className="mt-6 h-12 w-full flex items-center justify-center rounded-2xl border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 transition-all shadow-sm">
             Open Full Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
