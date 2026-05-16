import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { 
  CheckCircle2, Circle, Loader2, GitPullRequest, 
  Search, FileCheck, Award, Video, Rocket, 
  BookOpen, ClipboardCheck, GraduationCap, ShieldCheck,
  Star, FileText, RefreshCw
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/timeline")({
  head: () => ({ meta: [{ title: "Research Lifecycle — ScholarOS" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const { user } = useAuth();
  const [dissertations, setDissertations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get('/dissertations');
      const data = Array.isArray(res.data) ? res.data : [];
      setDissertations(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dissertation = useMemo(() => {
    return dissertations.find(d => d.id.toString() === selectedId);
  }, [dissertations, selectedId]);

  const milestones = useMemo(() => {
    if (!dissertation) return [];
    
    const d = dissertation;
    const created = new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const hasGuide = !!d.guide_id;
    const chapters = d.chapters || [];
    // A chapter counts as "handled" if it has a file OR if it has been officially approved
    const submittedChapters = chapters.filter((c: any) => (c.file_path && c.file_path.trim() !== "") || c.status === 'approved').length;
    const approvedChapters = chapters.filter((c: any) => c.status === 'approved').length;
    
    const isTopicApproved = d.status === 'approved' || d.status === 'viva_scheduled' || d.status === 'completed';
    const isUnderFinalReview = d.status === 'approved' && approvedChapters === 5;
    const isFinalApproved = d.status === 'viva_scheduled' || d.status === 'completed';
    const isVivaScheduled = d.status === 'viva_scheduled' || d.status === 'completed';
    const isCompleted = d.status === 'completed';

    return [
      { 
        key: "proposal", 
        label: "Research Proposal", 
        date: created, 
        status: "done", 
        icon: Rocket, 
        desc: "Initial research topic and abstract submitted for departmental validation." 
      },
      { 
        key: "guide", 
        label: "Mentor Assigned", 
        date: hasGuide ? (d.guide?.name || "Assigned") : "Awaiting HOD", 
        status: hasGuide ? "done" : (isTopicApproved ? "active" : "todo"), 
        icon: UserPlus, 
        desc: hasGuide ? `Under the mentorship of ${d.guide?.name}.` : "HOD is reviewing the topic to assign a specialized Faculty Guide." 
      },
      { 
        key: "chapters", 
        label: "Chapter Board Progress", 
        date: `${submittedChapters}/5 Uploaded`, 
        status: approvedChapters === 5 ? "done" : (isTopicApproved ? "active" : "todo"), 
        icon: BookOpen, 
        desc: `Research tracking. ${submittedChapters} chapters submitted for review. ${approvedChapters} chapters officially approved by guide.` 
      },
      { 
        key: "final_review", 
        label: "HOD Final Review", 
        date: isFinalApproved ? "Endorsed" : (isUnderFinalReview ? "Awaiting Review" : "Pending"), 
        status: isFinalApproved ? "done" : (isUnderFinalReview ? "active" : "todo"), 
        icon: ShieldCheck, 
        desc: "Final departmental verification of the consolidated thesis and plagiarism reports by the HOD." 
      },
      { 
        key: "viva", 
        label: "Final Viva Voce", 
        date: d.examiner_marks ? `Score: ${d.examiner_marks}/100` : (isVivaScheduled ? "Scheduled" : "TBD"), 
        status: d.examiner_marks ? "done" : (isVivaScheduled ? "active" : "todo"), 
        icon: Video, 
        desc: d.examiner_marks ? `Final defense completed with a score of ${d.examiner_marks}.` : "Oral defense before the external examiner to validate research findings." 
      },
      { 
        key: "graduation", 
        label: "Unit Completion", 
        date: isCompleted ? "Completed" : "TBD", 
        status: isCompleted ? "done" : "todo", 
        icon: GraduationCap, 
        desc: isCompleted ? "Congratulations! This dissertation unit is fully cleared." : "Final award of credits upon successful completion of all steps." 
      },
    ];
  }, [dissertation]);

  if (loading) return <div className="p-20 text-center font-display text-lg animate-pulse text-primary">Synchronizing research timelines...</div>;

  return (
    <>
      <PageHeader 
        kicker="Real-time Tracking" 
        title="Unit Progression Lifecycle" 
        actions={
          <div className="flex items-center gap-4">
             <button 
                onClick={loadData}
                disabled={refreshing}
                className={cn("p-2 rounded-xl border border-border bg-card/40 hover:bg-accent transition-all", refreshing && "animate-spin")}
             >
                <RefreshCw className="h-4 w-4" />
             </button>
             <div className="hidden md:flex items-center gap-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit Velocity</div>
                <div className="h-2 w-32 rounded-full bg-border overflow-hidden">
                   <div 
                      className="h-full gradient-primary transition-all duration-1000" 
                      style={{ width: `${(milestones.filter(s => s.status === 'done').length / milestones.length) * 100}%` }}
                   />
                </div>
             </div>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Selector Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className="rounded-[2rem] border border-border glass p-6">
              <div className="flex items-center justify-between mb-6">
                 <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground ml-1">My Research Units</label>
                 <span className="text-[10px] font-bold text-primary">{dissertations.length}/4</span>
              </div>
              <div className="space-y-2">
                 {dissertations.map((d, i) => (
                    <button 
                       key={d.id}
                       onClick={() => setSelectedId(d.id.toString())}
                       className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                          selectedId === d.id.toString() 
                             ? "bg-primary/10 border-primary/30 text-primary shadow-glow" 
                             : "border-transparent text-muted-foreground hover:bg-card/40"
                       )}
                    >
                       <div className="text-[9px] font-bold uppercase tracking-tighter opacity-50 mb-1">Project {i + 1}</div>
                       <div className="text-xs font-bold truncate pr-6">{d.title}</div>
                       <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60 flex items-center gap-1">
                          <div className={cn("h-1.5 w-1.5 rounded-full", d.status === 'completed' ? "bg-success" : "bg-warning animate-pulse")} />
                          {d.status?.replace('_', ' ')}
                       </div>
                       {d.status === 'completed' && <CheckCircle2 className="absolute top-4 right-4 h-3 w-3 text-success" />}
                    </button>
                 ))}
                 
                 {dissertations.length < 4 && (
                    <div className="p-6 rounded-2xl border border-dashed border-border text-center opacity-60">
                       <PlusIcon className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
                       <div className="text-[9px] uppercase font-bold text-muted-foreground">Unit {dissertations.length + 1} Pending</div>
                    </div>
                 )}
              </div>
           </div>

           <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-4" />
              <div className="text-sm font-bold">Degree Eligibility</div>
              <div className="mt-4 flex justify-between gap-1.5">
                 {[1,2,3,4].map(i => (
                    <div key={i} className={cn(
                       "flex-1 h-2 rounded-full transition-all duration-700",
                       dissertations.filter(d => d.status === 'completed').length >= i ? "bg-success shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-border"
                    )} />
                 ))}
              </div>
              <div className="mt-3 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                 {dissertations.filter(d => d.status === 'completed').length} of 4 Projects Cleared
              </div>
           </div>
        </div>

        {/* Timeline Center */}
        <div className="lg:col-span-3">
           {dissertation ? (
             <div className="rounded-[2.5rem] border border-border glass p-10 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 text-primary">
                   <GitPullRequest className="h-48 w-48" />
                </div>

                <div className="relative">
                   {/* Vertical Connector Line */}
                   <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-primary via-primary/20 to-transparent md:left-1/2 md:-ml-px" />
                   
                   <div className="space-y-20">
                      {milestones.map((m, i) => {
                         const Icon = m.icon as any;
                         const isDone = m.status === "done";
                         const isActive = m.status === "active";
                         const left = i % 2 === 0;

                         return (
                            <div key={m.key} className={cn(
                               "relative flex flex-col md:grid md:grid-cols-2 md:gap-24",
                               left ? "" : "md:[&>div:first-child]:order-2"
                            )}>
                               {/* Content Half */}
                               <div className={cn(
                                  "pl-16 md:pl-0",
                                  left ? "md:text-right" : "md:text-left"
                               )}>
                                  <div className={cn(
                                     "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                                     isDone ? "bg-success/10 border-success/20 text-success" : 
                                     isActive ? "bg-primary/10 border-primary/20 text-primary animate-pulse shadow-glow" : 
                                     "bg-card/40 border-border text-muted-foreground opacity-50"
                                  )}>
                                     <Icon className="h-3 w-3" />
                                     {m.status === 'done' ? 'Stage Clear' : m.status === 'active' ? 'Active Focus' : 'Locked'}
                                  </div>
                                  <h3 className="mt-3 text-xl md:text-2xl font-display font-bold leading-tight tracking-tight">{m.label}</h3>
                                  
                                  <div className={cn(
                                     "mt-4 p-6 rounded-3xl border transition-all duration-500",
                                     isDone ? "bg-background/20 border-border/50" : 
                                     isActive ? "bg-primary/5 border-primary/20 shadow-glow" : 
                                     "bg-card/20 border-border/20 opacity-30 grayscale"
                                  )}>
                                     <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                        {m.desc}
                                     </p>
                                     <div className="mt-4 flex items-center justify-between">
                                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">{m.date}</div>
                                        {isDone && (
                                           <div className="flex items-center gap-1.5 text-[9px] text-success font-bold uppercase tracking-widest">
                                              <CheckCircle2 className="h-3.5 w-3.5" /> Authenticated
                                           </div>
                                        )}
                                     </div>
                                  </div>
                               </div>

                               {/* Spacing */}
                               <div className="hidden md:block" />

                               {/* Center Dot */}
                               <div className={cn(
                                  "absolute left-4 md:left-1/2 top-1 -ml-2 md:-ml-4 h-8 w-8 rounded-full bg-background border-2 z-10 grid place-items-center transition-all duration-1000",
                                  isDone ? "border-success bg-success/10 scale-110 shadow-glow-success" : 
                                  isActive ? "border-primary bg-primary/20 animate-pulse shadow-glow" : 
                                  "border-border bg-card"
                               )}>
                                  <div className={cn(
                                     "h-2 w-2 rounded-full",
                                     isDone ? "bg-success" : isActive ? "bg-primary" : "bg-muted-foreground/30"
                                  )} />
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>
           ) : (
             <div className="py-20 text-center rounded-[2.5rem] border border-dashed border-border bg-card/20">
                <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a dissertation to view the timeline.</p>
             </div>
           )}
        </div>
      </div>
    </>
  );
}

function UserPlus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  );
}
