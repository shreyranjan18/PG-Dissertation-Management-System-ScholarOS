import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/StatCard";
import apiClient, { STORAGE_URL } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  Upload, FileText, Search, Check, X, RefreshCw, 
  UserPlus, FileSearch, Folder, Users, ChevronLeft, 
  ChevronRight, ShieldCheck, AlertCircle, FileDigit, 
  MessageSquare, Send, Clock, History, Award, CheckCircle2
} from "lucide-react";

export const Route = createFileRoute("/_app/dissertation/")({
  head: () => ({ meta: [{ title: "Dissertations — ScholarOS" }] }),
  component: Page,
});

type Feedback = {
  id: string; comments: string; created_at: string; faculty?: { name: string };
};

type Row = {
  id: string; title: string; status: string; domain: string | null;
  department: string | null; progress: number; student_id: string;
  created_at: string; abstract?: string; research_area?: string;
  file_path?: string; ai_summary?: string;
  student?: { name: string; email: string };
  guide?: { name: string };
};

const STATUS_TONE: Record<string, string> = {
  approved: "bg-success/15 text-success border-success/20",
  pending_approval: "bg-primary/15 text-primary border-primary/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/20",
  changes_requested: "bg-warning/20 text-warning border-warning/20",
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Page() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Row | null>(null);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [guideSelection, setGuideSelection] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [activeTab, setActiveTab] = useState<"topics" | "final">("topics");
  const [examinerId, setExaminerId] = useState("");

  // Queries
  const { data: rows = [], isLoading: loadingRows } = useQuery({
    queryKey: ['dissertations'],
    queryFn: async () => {
      const res = await apiClient.get('/dissertations');
      return res.data as Row[];
    }
  });

  const { data: faculty = [] } = useQuery({
    queryKey: ['faculty'],
    queryFn: async () => {
      if (user?.role !== 'hod' && user?.role !== 'admin') return [];
      const res = await apiClient.get('/dashboard/hod');
      return res.data.faculty_list || [];
    },
    enabled: !!user && (user.role === 'hod' || user.role === 'admin')
  });

  const { data: pendingFinalRows = [] } = useQuery({
    queryKey: ['dissertations', 'pending-final'],
    queryFn: async () => {
      if (user?.role !== 'hod' && user?.role !== 'admin') return [];
      const res = await apiClient.get('/dissertations/pending-final-review');
      return res.data as Row[];
    },
    enabled: !!user && (user.role === 'hod' || user.role === 'admin')
  });

  const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
    queryKey: ['feedback', selected?.id],
    queryFn: async () => {
      if (!selected) return [];
      const res = await apiClient.get(`/dissertations/${selected.id}/feedback`);
      return res.data as Feedback[];
    },
    enabled: !!selected
  });

  // Mutations
  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string, action: string, payload?: any }) => {
      if (action === 'assign') {
        return apiClient.post(`/dissertations/${id}/assign-guide`, { guide_id: payload.guide_id });
      } else if (action === 'feedback') {
        return apiClient.post(`/feedback`, { 
          dissertation_id: id, 
          comments: payload.comments,
          status: 'changes_requested'
        });
      } else {
        return apiClient.put(`/dissertations/${id}`, { status: action });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dissertations'] });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success("Action completed successfully!");
      if (newFeedback) setNewFeedback("");
    },
    onError: (error: any) => toast.error(error.message || "Action failed")
  });

  const finalApproveMutation = useMutation({
    mutationFn: async () => {
      if (!selected || !examinerId) return;
      return apiClient.post(`/dissertations/${selected.id}/final-approve`, { examiner_id: examinerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dissertations'] });
      toast.success("Dissertation graduated! Viva scheduled.");
      setSelected(null);
    },
    onError: () => toast.error("Final approval failed")
  });

  const failedVivas = useMemo(() => rows.filter(d => d.status === 'viva_failed'), [rows]);
  const graduatedVivas = useMemo(() => rows.filter(d => d.status === 'completed'), [rows]);

  const depts = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach(r => {
      const d = r.department || "General";
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!activeDept) return [];
    return rows.filter(r => (r.department || "General") === activeDept);
  }, [rows, activeDept]);

  const isStudent = user?.role === "student";
  const isFaculty = user?.role === "faculty";
  const canManage = user?.role === "hod" || user?.role === "admin";

  if (loadingRows) return <div className="p-20 text-center animate-pulse text-lg font-display text-primary">Syncing Repository...</div>;

  return (
    <>
      <PageHeader
        kicker={activeDept ? activeDept : (isStudent ? "My Work" : "Repository")}
        title={activeDept ? `Students in ${activeDept}` : (isStudent ? "My Dissertations" : "Departmental Overview")}
        actions={
          <div className="flex gap-2">
            {canManage && !isStudent && !activeDept && (
              <div className="flex bg-card border border-border rounded-xl p-1">
                <button 
                  onClick={() => setActiveTab("topics")}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", activeTab === "topics" ? "bg-primary text-white" : "text-muted-foreground")}
                >
                  Topics
                </button>
                <button 
                  onClick={() => setActiveTab("final")}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", activeTab === "final" ? "bg-primary text-white" : "text-muted-foreground")}
                >
                  Graduation {pendingFinalRows.length > 0 && <span className="ml-1 bg-white text-primary px-1.5 rounded-full">{pendingFinalRows.length}</span>}
                </button>
              </div>
            )}
            {(activeDept && !isStudent) && (
              <button onClick={() => setActiveDept(null)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm hover:bg-accent transition-all">
                <ChevronLeft className="h-4 w-4" /> Back to Departments
              </button>
            )}
            {isStudent && (
              <Link to="/dissertation/new" className="inline-flex items-center gap-2 rounded-xl gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all active:scale-95">
                <Upload className="h-4 w-4" /> Submit Topic
              </Link>
            )}
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['dissertations'] })} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm transition-all hover:bg-accent">
              <RefreshCw className={`h-4 w-4 ${loadingRows ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        }
      />

      {/* Level 1: Department Cards OR Final Graduation List */}
      {!activeDept && !isStudent && (
        <>
          {activeTab === "topics" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {depts.map(d => (
                <button 
                  key={d.name}
                  onClick={() => setActiveDept(d.name)}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 text-left transition-all hover:border-primary/50 hover:shadow-glow hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl border border-border bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      <Folder className="h-8 w-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-display font-bold">{d.count}</div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Students</div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-display font-semibold group-hover:text-primary transition-colors">{d.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-1">View all dissertations and track faculty assignments.</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Explore Department <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-border glass p-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="text-xl font-display font-bold">Pending Final Approval</h3>
              </div>
              {pendingFinalRows.length === 0 && failedVivas.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-dashed border-border text-muted-foreground">
                  No dissertations are currently ready for final graduation review or re-examination.
                </div>
              ) : (
                <div className="space-y-8">
                  {pendingFinalRows.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                       {pendingFinalRows.map(r => (
                         <div key={r.id} className="p-8 rounded-[2.5rem] border border-border bg-card/40 flex items-center justify-between group hover:border-primary/40 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-success"><Award className="h-20 w-20" /></div>
                            <div className="flex items-center gap-6">
                               <div className="h-16 w-16 rounded-[1.5rem] bg-success/10 text-success grid place-items-center shadow-sm"><ShieldCheck className="h-8 w-8" /></div>
                               <div>
                                  <div className="text-[10px] font-bold text-success uppercase tracking-[0.2em] mb-1">Unit Ready for Final Review</div>
                                  <div className="text-xl font-display font-bold group-hover:text-primary transition-colors">{r.title}</div>
                                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                     <Users className="h-3.5 w-3.5" /> {r.student?.name} 
                                     <span className="h-1 w-1 rounded-full bg-border" />
                                     <Check className="h-3.5 w-3.5 text-success" /> All 5 Chapters Cleared
                                  </div>
                               </div>
                            </div>
                            <button onClick={() => { setActiveTab("final"); setSelected(r); }} className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-glow hover:scale-105 active:scale-95 transition-all">
                               Finalize Unit & Schedule Viva
                            </button>
                         </div>
                       ))}
                    </div>
                  )}

                  {failedVivas.length > 0 && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-destructive uppercase tracking-widest ml-2">
                          <AlertCircle className="h-4 w-4" /> Re-examination Required
                       </div>
                       <div className="grid gap-4 md:grid-cols-2">
                          {failedVivas.map(r => (
                            <div key={r.id} className="p-8 rounded-[2.5rem] border border-destructive/20 bg-destructive/5 flex items-center justify-between group transition-all">
                               <div className="flex items-center gap-6">
                                  <div className="h-16 w-16 rounded-[1.5rem] bg-destructive/10 text-destructive grid place-items-center shadow-sm"><X className="h-8 w-8" /></div>
                                  <div>
                                     <div className="text-[10px] font-bold text-destructive uppercase tracking-[0.2em] mb-1">Viva Failed (Score: {r.examiner_marks})</div>
                                     <div className="text-xl font-display font-bold">{r.title}</div>
                                     <div className="text-sm text-muted-foreground mt-1">{r.student?.name} · Requesting Retake</div>
                                  </div>
                               </div>
                               <button 
                                 onClick={async () => {
                                    actionMutation.mutate({ id: r.id, action: 'approved' });
                                 }}
                                 className="px-6 py-3 rounded-2xl bg-destructive text-white text-sm font-bold shadow-glow hover:scale-105 transition-all"
                               >
                                  Approve Retake
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                  {graduatedVivas.length > 0 && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-success uppercase tracking-widest ml-2">
                          <CheckCircle2 className="h-4 w-4" /> Successfully Graduated
                       </div>
                       <div className="grid gap-4 md:grid-cols-2">
                          {graduatedVivas.map(r => (
                            <div key={r.id} className="p-8 rounded-[2.5rem] border border-success/20 bg-success/5 flex items-center justify-between group transition-all">
                               <div className="flex items-center gap-6">
                                  <div className="h-16 w-16 rounded-[1.5rem] bg-success/10 text-success grid place-items-center shadow-sm"><Award className="h-8 w-8" /></div>
                                  <div>
                                     <div className="text-[10px] font-bold text-success uppercase tracking-[0.2em] mb-1">Unit Cleared (Score: {r.total_marks})</div>
                                     <div className="text-xl font-display font-bold">{r.title}</div>
                                     <div className="text-sm text-muted-foreground mt-1">{r.student?.name} · Graduation Verified</div>
                                  </div>
                               </div>
                               <button onClick={() => setSelected(r)} className="px-6 py-3 rounded-2xl bg-success/20 text-success text-sm font-bold hover:bg-success hover:text-white transition-all">
                                  View Transcript
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Level 2: Student List */}
      {(activeDept || isStudent) && (
        <div className="rounded-[2.5rem] border border-border glass p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-border/50">
                  <th className="pb-4 pr-4">Student & Dissertation</th>
                  <th className="pb-4 pr-4">Mentor Status</th>
                  <th className="pb-4 pr-4">Phase</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {(isStudent ? rows : filteredRows).map(r => (
                  <tr key={r.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-6 pr-6 cursor-pointer" onClick={() => setSelected(r)}>
                      <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-background/50 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-all">
                          <FileDigit className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-lg font-semibold truncate max-w-md group-hover:text-primary transition-colors">{r.title}</div>
                          <div className="text-sm text-muted-foreground mt-0.5">{r.student?.name} · {r.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 pr-6">
                      {r.guide ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-1 text-xs font-medium text-success">
                           <ShieldCheck className="h-3.5 w-3.5" /> {r.guide.name}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/5 px-3 py-1 text-xs font-medium text-warning animate-pulse">
                           <AlertCircle className="h-3.5 w-3.5" /> Unassigned
                        </div>
                      )}
                    </td>
                     <td className="py-6 pr-6">
                        <div className="flex flex-col gap-1.5">
                           <span className={`inline-block w-fit rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[r.status]}`}>
                             {r.status.replace(/_/g, " ")}
                           </span>
                           {pendingFinalRows.some(p => p.id === r.id) && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success uppercase tracking-tighter">
                                 <Award className="h-3 w-3" /> Ready for Final HOD Review
                              </span>
                           )}
                        </div>
                     </td>
                    <td className="py-6 text-right">
                       <button 
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                       >
                         Control Center <FileSearch className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Level 3: Control Center Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-[3rem] border border-border bg-card p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 my-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4em] text-primary">
                   Workflow Management
                </div>
                <h2 className="text-4xl font-display font-semibold leading-tight pr-12">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-2xl p-4 hover:bg-accent text-muted-foreground transition-all"><X className="h-7 w-7" /></button>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-3">
              {/* Sidebar Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-3xl border border-border bg-background/40 p-6 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><Users className="h-5 w-5" /></div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Student</div>
                        <div className="font-semibold">{selected.student?.name}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-success/10 grid place-items-center text-success"><ShieldCheck className="h-5 w-5" /></div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Faculty Guide</div>
                        <div className="font-semibold">{selected.guide?.name || "Pending..."}</div>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-border/50">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Topic Abstract</div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{selected.abstract}</p>
                   </div>
                   {selected.file_path && (
                      <a href={`${STORAGE_URL}/${selected.file_path}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-100 py-3 text-slate-900 font-bold text-sm hover:bg-white transition-all">
                         <FileText className="h-4 w-4" /> Open Manuscript
                      </a>
                   )}
                </div>

                {/* HOD Specific Assignment OR Final Approval */}
                {canManage && (
                  <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                    {selected.status === 'viva_scheduled' ? (
                      <div className="text-center py-4">
                        <Check className="h-10 w-10 text-success mx-auto mb-2" />
                        <div className="text-sm font-bold text-success uppercase">Graduated</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Viva session has been scheduled.</div>
                      </div>
                    ) : (
                      <>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-primary">
                          {activeTab === 'final' ? "Assign Final Examiner" : "Assign Mentor"}
                        </div>
                        <select 
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                          value={activeTab === 'final' ? examinerId : guideSelection}
                          onChange={(e) => activeTab === 'final' ? setExaminerId(e.target.value) : setGuideSelection(e.target.value)}
                        >
                          <option value="">{activeTab === 'final' ? "Select Examiner..." : "Select Faculty..."}</option>
                          {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        {activeTab === 'final' ? (
                           <button 
                             disabled={!examinerId || finalApproveMutation.isPending}
                             onClick={() => finalApproveMutation.mutate()}
                             className="w-full gradient-primary text-primary-foreground py-3 rounded-xl font-bold shadow-glow hover:scale-105 transition-all"
                           >
                             {finalApproveMutation.isPending ? "Scheduling Viva..." : "Graduate & Schedule Viva"}
                           </button>
                        ) : !selected.guide && (
                           <button 
                             onClick={() => actionMutation.mutate({ id: selected.id, action: 'assign', payload: { guide_id: guideSelection } })}
                             disabled={actionMutation.isPending}
                             className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold shadow-glow"
                           >
                             {actionMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                           </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content: Feedback Cycle */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 font-display text-xl font-semibold">
                      <MessageSquare className="h-5 w-5 text-primary" /> Guide Feedback Cycle
                   </div>
                   <span className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[selected.status]}`}>
                      {selected.status.replace(/_/g, " ")}
                   </span>
                </div>

                {/* Feedback List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {loadingFeedback ? (
                      <div className="py-10 text-center animate-pulse text-xs text-muted-foreground">Syncing feedback chain...</div>
                    ) : feedback.length === 0 ? (
                      <div className="py-20 text-center rounded-[2rem] border border-dashed border-border text-muted-foreground italic">
                         No feedback history yet.
                      </div>
                    ) : (
                      feedback.map((f, i) => (
                        <div key={f.id} className="relative pl-10 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                           <div className="absolute left-3 top-0 bottom-0 w-px bg-border/50" />
                           <div className="absolute left-1.5 top-2 h-4 w-4 rounded-full border-2 border-primary bg-card shadow-glow" />
                           <div className="rounded-2xl border border-border bg-background/40 p-5">
                              <div className="flex items-center justify-between mb-2">
                                 <div className="text-[10px] uppercase font-bold tracking-widest text-primary">Dr. {f.faculty?.name || "Faculty"}</div>
                                 <div className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(f.created_at).toLocaleDateString()}</div>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{f.comments}</p>
                           </div>
                        </div>
                      ))
                    )}
                </div>

                {/* Interaction Form */}
                {(isFaculty || canManage || (isStudent && selected.status === 'rejected')) && (
                  <div className="mt-8 space-y-4">
                     {/* Marks Entry for Faculty/HOD */}
                     {(isFaculty || canManage) && (
                       <div className="p-8 rounded-[2rem] border border-primary/20 bg-primary/5 space-y-6">
                          <div className="flex items-center gap-2">
                             <Award className="h-5 w-5 text-primary" />
                             <h4 className="font-display font-bold">Academic Assessment</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Guide Marks</div>
                                <div className="text-xl font-bold">{selected.guide_marks ?? '--'} <span className="text-xs text-muted-foreground">/ 100</span></div>
                             </div>
                             <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">HOD Marks</div>
                                <div className="text-xl font-bold">{selected.hod_marks ?? '--'} <span className="text-xs text-muted-foreground">/ 100</span></div>
                             </div>
                          </div>

                          <div className="pt-4 border-t border-primary/10">
                             <div className="flex items-center gap-3">
                                <input 
                                  type="number" 
                                  max={100} min={0}
                                  placeholder="Enter marks (0-100)"
                                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                                  id="marks-input"
                                />
                                <button 
                                  onClick={() => {
                                    const val = (document.getElementById('marks-input') as HTMLInputElement).value;
                                    if (val) {
                                      const type = user?.role === 'hod' ? 'hod' : 'guide';
                                      apiClient.post(`/dissertations/${selected.id}/submit-marks`, { 
                                        marks: parseInt(val),
                                        type: type
                                      })
                                        .then(() => {
                                          toast.success(`${type.toUpperCase()} marks recorded!`);
                                          queryClient.invalidateQueries({ queryKey: ["dissertations"] });
                                          setSelected(null);
                                        })
                                        .catch(() => toast.error("Failed to submit marks"));
                                    }
                                  }}
                                  className="rounded-xl gradient-primary px-6 py-3 text-xs font-bold text-white shadow-glow"
                                >
                                  Submit
                                </button>
                             </div>
                             <p className="mt-2 text-[10px] text-muted-foreground italic">Submit your assessment score. Graduation requires scores from Guide, HOD, and Examiner.</p>
                          </div>
                       </div>
                     )}

                     {isStudent ? (
                       <div className="rounded-[2rem] border border-warning/20 bg-warning/5 p-8 text-center space-y-4">
                          <AlertCircle className="h-8 w-8 text-warning mx-auto" />
                          <h4 className="font-semibold text-lg">Submission Required</h4>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">Address your guide's feedback above and upload a revised version of your dissertation.</p>
                          <Link to="/dissertation/new" className="inline-flex items-center gap-2 rounded-xl gradient-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-glow">
                             <Upload className="h-4 w-4" /> Upload Revision
                          </Link>
                       </div>
                     ) : (
                       <div className="space-y-3">
                          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Submit New Feedback</div>
                          <div className="relative">
                            <textarea 
                              className="w-full rounded-[2rem] border border-border bg-background/40 p-6 pr-16 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                              rows={4}
                              placeholder="Write your corrections or suggestions here..."
                              value={newFeedback}
                              onChange={(e) => setNewFeedback(e.target.value)}
                            />
                            <button 
                               onClick={() => actionMutation.mutate({ id: selected.id, action: 'feedback', payload: { comments: newFeedback } })}
                               disabled={!newFeedback || actionMutation.isPending}
                               className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-glow grid place-items-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                             >
                               {actionMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                             </button>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => actionMutation.mutate({ id: selected.id, action: 'approved' })} 
                                disabled={actionMutation.isPending}
                                className="flex-1 rounded-xl bg-success/10 border border-success/30 py-2.5 text-[10px] font-bold uppercase tracking-widest text-success hover:bg-success hover:text-success-foreground transition-all disabled:opacity-50"
                              >
                                Approve Version
                              </button>
                              <button 
                                onClick={() => actionMutation.mutate({ id: selected.id, action: 'rejected' })} 
                                disabled={actionMutation.isPending}
                                className="flex-1 rounded-xl bg-destructive/10 border border-destructive/30 py-2.5 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-50"
                              >
                                Request Changes
                              </button>
                          </div>
                       </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
