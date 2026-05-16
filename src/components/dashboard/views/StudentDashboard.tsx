import { PageHeader } from "../StatCard";
import { 
  FileText, CheckCircle2, Clock, CalendarClock, 
  Sparkles, Award, TrendingUp, AlertCircle, 
  BarChart3, Target, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Presentation, Calendar, Video,
  ChevronRight, MapPin, GraduationCap, Layers
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { cn } from "@/lib/utils";

export function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/student')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!stats) return <div className="p-20 text-center animate-pulse text-primary font-display">Syncing Academic Intelligence...</div>;

  const nextMeetingDate = stats.next_meeting ? new Date(stats.next_meeting.scheduled_at).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : "None scheduled";
  const isViva = stats.next_meeting?.type === 'viva';
  const nextStep = stats.next_step;

  return (
    <>
      <PageHeader
        kicker="Student workspace"
        title={`Hello, ${user?.name.split(" ")[0]} — ${nextStep}.`}
        actions={
          <div className="flex gap-3">
             <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Target className="h-3 w-3 text-primary" /> Progress: {stats.graduation_progress}%
             </div>
             <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-xs font-bold text-white shadow-glow">
                <GraduationCap className="h-4 w-4" /> Degree Audit
             </button>
          </div>
        }
      />

      {/* Primary Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Uploads" 
          value={stats.total_dissertations} 
          sub="Across all 4 tracks" 
          icon={Layers} 
          trend={`${stats.total_dissertations}/4`} 
          trendUp={stats.total_dissertations >= 4} 
        />
        <StatCard 
          label="Completed Units" 
          value={stats.completed_count} 
          sub="Graduation required: 4" 
          icon={CheckCircle2} 
          trend={`${stats.graduation_progress}%`} 
          trendUp={true} 
          color="success"
        />
        <StatCard 
          label="Rejected" 
          value={stats.rejected_submissions} 
          sub="Revision required" 
          icon={AlertCircle} 
          trend="Action items" 
          trendUp={false} 
          color="warning"
        />
        <StatCard 
          label="Cumulative GPA" 
          value={stats.avg_marks > 0 ? (stats.avg_marks / 10).toFixed(2) : "TBD"} 
          sub="Scale: 10.0" 
          icon={Award} 
          trend={stats.avg_marks > 75 ? "Honors" : "Regular"} 
          trendUp={true}
          color="primary"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[2.5rem] border border-border glass p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold">Academic Submission Velocity</h3>
                <p className="text-sm text-muted-foreground">Historical trend across all 4 dissertations</p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 text-primary"><div className="h-2 w-2 rounded-full bg-primary" /> Submitted</div>
                <div className="flex items-center gap-1.5 text-success"><div className="h-2 w-2 rounded-full bg-success" /> Approved</div>
                <div className="flex items-center gap-1.5 text-warning"><div className="h-2 w-2 rounded-full bg-warning" /> Rejected</div>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.submission_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                  <Bar dataKey="submitted" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="rejected" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
             <div className="rounded-[2.5rem] border border-border glass p-8">
                <h3 className="text-sm font-display font-bold mb-6 flex items-center gap-2">
                   <Target className="h-4 w-4 text-primary" /> Scholar Proficiency
                </h3>
                <div className="h-[220px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.skill_radar}>
                         <PolarGrid stroke="rgba(255,255,255,0.1)" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 8 }} />
                         <Radar name="Skills" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-sm font-display font-bold px-2 flex items-center gap-2">
                   <Calendar className="h-4 w-4 text-primary" /> Examination Calendar
                </h3>
                {stats.upcoming_schedule?.length > 0 ? (
                  stats.upcoming_schedule.map((m: any) => (
                    <div key={m.id} className="p-4 rounded-2xl border border-border bg-card/20 hover:bg-card/40 transition-all group">
                       <div className="flex items-center justify-between mb-2">
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                            m.type === 'viva' ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
                          )}>
                             {m.type}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{new Date(m.scheduled_at).toLocaleDateString()}</div>
                       </div>
                       <div className="font-bold text-xs group-hover:text-primary transition-colors truncate">{m.topic}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-xs">
                     No examinations pending
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
           <div className="rounded-[2.5rem] border border-border glass p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                <GraduationCap className="h-24 w-24" />
             </div>
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Graduation Audit</h3>
             
             <div className="relative mx-auto h-48 w-48">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                   <circle className="stroke-muted-foreground/10" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                   <circle 
                      className="stroke-success transition-all duration-1000 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${stats.graduation_progress * 2.51} 251`} 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="40" cx="50" cy="50" 
                      transform="rotate(-90 50 50)" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-display font-bold">{stats.completed_count}/4</span>
                   <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Dissertations</span>
                </div>
             </div>

             <div className="mt-8 p-4 rounded-2xl bg-background/40 border border-border inline-flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", stats.completed_count >= 4 ? "bg-success animate-pulse" : "bg-warning")} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {stats.completed_count >= 4 ? "ELIGIBLE FOR DEGREE" : `${4 - stats.completed_count} REMAINING`}
                </span>
             </div>
           </div>

           <div className="rounded-[2.5rem] border border-border bg-primary/5 p-8 border-primary/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6">Course Status</h3>
              <div className="space-y-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "h-8 w-8 rounded-lg border grid place-items-center text-xs font-bold",
                             stats.completed_count >= i ? "bg-success/10 border-success/30 text-success" : "bg-card border-border text-muted-foreground"
                          )}>
                             {i}
                          </div>
                          <div className="text-xs font-medium">Dissertation Unit {i}</div>
                       </div>
                       {stats.completed_count >= i ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-muted-foreground/30" />}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, sub, icon: Icon, trend, trendUp, color = "default" }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    success: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    default: "text-muted-foreground bg-card/40 border-border"
  };

  return (
    <div className="group rounded-[2.5rem] border border-border glass p-8 transition-all hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("h-12 w-12 rounded-2xl grid place-items-center transition-all group-hover:scale-110", colorMap[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
          trendUp ? "text-success" : "text-warning"
        )}>
          {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-4xl font-display font-bold tracking-tight">{value}</div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">{label}</div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground/60 font-medium">{sub}</div>
    </div>
  );
}
