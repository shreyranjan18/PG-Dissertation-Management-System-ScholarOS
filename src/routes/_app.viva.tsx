import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/StatCard";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  Video, Calendar, Clock, User, Award, 
  ExternalLink, CheckCircle2, AlertCircle, Lock,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/viva")({
  head: () => ({ meta: [{ title: "Viva Workspace — ScholarOS" }] }),
  component: VivaWorkspace,
});

function VivaWorkspace() {
  const { user } = useAuth();
  const [vivas, setVivas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [forceLive, setForceLive] = useState<Record<number, boolean>>({});

  const loadVivas = async () => {
    try {
      const res = await apiClient.get('/meetings');
      const data = Array.isArray(res.data) ? res.data : [];
      setVivas(data.filter((m: any) => m.type === 'viva'));
    } catch (err) {
      toast.error("Failed to load Viva sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVivas();
    const clock = setInterval(() => setNow(new Date()), 1000);
    // Polling: Refresh meeting data every 5 seconds to catch live status changes
    const poll = setInterval(() => loadVivas(), 5000);
    
    return () => {
      clearInterval(clock);
      clearInterval(poll);
    };
  }, []);

  const updateLink = async (vivaId: number, link: string) => {
    try {
      await apiClient.put(`/meetings/${vivaId}`, { location: link });
      toast.success("Viva link updated!");
      loadVivas();
    } catch (err) {
      toast.error("Failed to update link");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-display">Opening Viva Workspace...</div>;

  return (
    <>
      <PageHeader 
        kicker="Examination Portal" 
        title="Viva Voce Workspace" 
        actions={
          <div className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-primary/30 text-primary bg-primary/5">
            Secure Channel
          </div>
        }
      />

      <div className="grid gap-6">
        {vivas.length === 0 ? (
          <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed border-border bg-background/20">
            <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold">No Viva Scheduled</h3>
            <p className="mt-2 text-sm text-muted-foreground">Viva sessions appear here after HOD final approval.</p>
          </div>
        ) : (
          vivas.map(v => {
            const target = new Date(v.scheduled_at);
            const diff = target.getTime() - now.getTime();
            const isEnded = v.status === 'completed' || v.dissertation?.status === 'viva_failed';
            const isFailed = v.dissertation?.status === 'viva_failed';
            const isLive = !isEnded && (v.status === 'live' || diff <= 0 || (v.location && v.location.startsWith('http') && v.location !== 'TBD (Google Meet)'));
            
            // Allow controls if user is the assigned examiner OR is HOD/Admin
            const canControl = user?.id == v.faculty_id || user?.role === 'hod' || user?.role === 'admin';
            const isExaminer = user?.id == v.faculty_id; // For UI labeling

            return (
              <div key={v.id} className="rounded-[2.5rem] border border-border glass p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-primary">
                  {isLive ? <Video className="h-32 w-32 animate-pulse" /> : <Lock className="h-32 w-32" />}
                </div>

                <div className="grid gap-8 lg:grid-cols-12 relative">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <div className={cn("h-2 w-2 rounded-full", isLive ? "bg-success animate-ping" : "bg-warning")} />
                           <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">{isLive ? "Session Live" : "Awaiting Schedule"}</div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">{v.topic}</h2>
                      </div>
                      
                      {canControl && !isLive && (
                        <button 
                          onClick={async () => {
                            try {
                              await apiClient.put(`/meetings/${v.id}`, { status: 'live' });
                              toast.success("Viva Started! Waiting for student.");
                              loadVivas();
                            } catch (e) { toast.error("Failed to start session"); }
                          }}
                          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold uppercase hover:scale-105 transition-all shadow-glow"
                        >
                          <PlayCircle className="h-5 w-5" /> Start Viva Now
                        </button>
                      )}
                    </div>

                    {!isLive && !isEnded && (
                      <div className="p-8 rounded-[2rem] border border-primary/20 bg-primary/5">
                         <div className="text-xs uppercase font-bold text-muted-foreground mb-4 tracking-widest">Countdown to Examination</div>
                         <Countdown target={v.scheduled_at} now={now} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <DetailCard icon={Calendar} label="Date" value={new Date(v.scheduled_at).toLocaleDateString()} />
                      <DetailCard icon={Clock} label="Time" value={new Date(v.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                      <DetailCard icon={User} label={isExaminer ? "Student" : "Examiner"} value={isExaminer ? (v.student?.name || 'Student') : (v.faculty?.name || 'Examiner')} />
                    </div>

                    <div className="p-6 rounded-3xl border border-border bg-background/40">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Assessment Guidelines</h4>
                      <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                        <li>Examiner has authority to start the viva before the countdown.</li>
                        <li>Google Meet link activates instantly once the examiner posts it.</li>
                        <li>Viva Performance Score must be submitted to complete graduation.</li>
                      </ul>
                    </div>

                    {canControl && (
                       <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-left duration-700">
                          <div className="flex items-center justify-between mb-4">
                             <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Research Assessment Record</h4>
                             <Award className="h-4 w-4 text-primary" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-2xl bg-background/40 border border-border">
                                <div className="text-[9px] uppercase font-bold text-muted-foreground">Guide Marks</div>
                                <div className="text-xl font-display font-bold mt-1">
                                   {v.dissertation?.guide_marks ?? '--'} <span className="text-[10px] opacity-50">/ 100</span>
                                </div>
                             </div>
                             <div className="p-4 rounded-2xl bg-background/40 border border-border">
                                <div className="text-[9px] uppercase font-bold text-muted-foreground">HOD Marks</div>
                                <div className="text-xl font-display font-bold mt-1">
                                   {v.dissertation?.hod_marks ?? '--'} <span className="text-[10px] opacity-50">/ 100</span>
                                </div>
                             </div>
                          </div>
                          <p className="mt-3 text-[9px] text-muted-foreground italic">Refer to previous assessments to calibrate the final viva score.</p>
                       </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className={cn(
                      "p-8 rounded-[2.5rem] border h-full flex flex-col justify-between transition-all duration-700",
                      isLive ? "border-success/30 bg-success/5 shadow-glow-success" : "border-primary/10 bg-primary/5 opacity-80"
                    )}>
                      <div>
                        <h4 className="text-lg font-display font-bold mb-4">Meeting Access</h4>
                        
                        {!isLive && !canControl ? (
                          <div className="space-y-4">
                             <div className="h-12 w-12 rounded-2xl bg-background/50 border border-border grid place-items-center mx-auto mb-4">
                                <Lock className="h-6 w-6 text-muted-foreground" />
                             </div>
                             <p className="text-xs text-center text-muted-foreground leading-relaxed">
                               This room is locked until the scheduled time.<br/>
                               Wait for your examiner to start the session.
                             </p>
                          </div>
                        ) : (
                          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                             {canControl ? (
                               <div className="space-y-4">
                                 <div className="space-y-2">
                                   <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-bold uppercase text-primary">Joining Link</label>
                                      {!isLive && <span className="text-[9px] bg-warning/20 text-warning px-1.5 rounded">Early Access</span>}
                                   </div>
                                   <input 
                                     type="text" 
                                     defaultValue={v.location === 'TBD (Google Meet)' ? '' : v.location}
                                     onBlur={(e) => updateLink(v.id, e.target.value)}
                                     placeholder="Paste Meet Link..."
                                     className="w-full bg-background/80 border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-primary transition-all"
                                   />
                                   <p className="text-[9px] text-muted-foreground italic flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> Link reveals to student instantly.
                                   </p>
                                 </div>
                               </div>
                             ) : (
                                 <div className="p-5 rounded-2xl bg-success/10 border border-success/20 text-center">
                                   {v.location && (v.location.startsWith('http') || v.location.includes('meet.google') || v.location.includes('.com')) ? (
                                     <a 
                                       href={v.location.startsWith('http') ? v.location : `https://${v.location}`} 
                                       target="_blank" rel="noreferrer" 
                                       className="flex items-center justify-center gap-2 text-success font-bold hover:underline py-2"
                                     >
                                       <Video className="h-5 w-5" /> JOIN VIVA NOW
                                     </a>
                                   ) : (
                                     <div className="text-xs font-bold text-warning flex items-center justify-center gap-2">
                                       <Clock className="h-4 w-4 animate-spin-slow" /> AWAITING EXAMINER LINK
                                     </div>
                                   )}
                                 </div>
                             )}

                             {canControl && v.status !== 'completed' && (
                               <div className="pt-6 border-t border-success/10 space-y-3">
                                  <label className="text-[10px] font-bold uppercase text-primary">Viva Performance Score</label>
                                  <div className="flex gap-2">
                                     <input 
                                       type="number" 
                                       id={`marks-${v.id}`}
                                       defaultValue={v.dissertation?.examiner_marks || ''}
                                       className="w-full bg-background/80 border border-border rounded-xl px-3 py-2 text-sm outline-none"
                                       placeholder="0-100"
                                     />
                                     <button 
                                       onClick={async () => {
                                          const val = (document.getElementById(`marks-${v.id}`) as HTMLInputElement).value;
                                          if (!val) { toast.error("Enter a score first"); return; }
                                          try {
                                             await apiClient.post(`/dissertations/${v.dissertation_id}/submit-marks`, { 
                                               marks: parseInt(val),
                                               type: 'viva'
                                             });
                                             await apiClient.put(`/meetings/${v.id}`, { status: 'completed' });
                                             toast.success("Viva Concluded & Marks Posted!");
                                             loadVivas();
                                          } catch (err) { toast.error("Failed to complete session"); }
                                       }}
                                       className="rounded-xl bg-success text-success-foreground px-4 py-2 text-xs font-bold shadow-md hover:scale-105 transition-all"
                                     >
                                       Complete Viva
                                     </button>
                                  </div>
                               </div>
                             )}

                             {isEnded && (
                               <div className="pt-6 border-t border-success/20 text-center animate-in fade-in zoom-in duration-500">
                                  <div className={cn("h-16 w-16 rounded-full grid place-items-center mx-auto mb-4 border-2", isFailed ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-success/10 text-success border-success/20")}>
                                     {isFailed ? <AlertCircle className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                                  </div>
                                  <h4 className={cn("text-xl font-display font-bold", isFailed ? "text-destructive" : "text-success")}>
                                     {isFailed ? "Re-examination Required" : "Session Concluded"}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-2">
                                     {isFailed 
                                        ? "The performance did not meet the minimum requirements (30%). You must seek HOD approval for a re-examination." 
                                        : "The examination results have been verified and submitted for graduation audit."}
                                  </p>
                                  
                                  <div className={cn("mt-6 p-4 rounded-2xl border", isFailed ? "bg-destructive/5 border-destructive/10" : "bg-success/5 border-success/10")}>
                                     <div className={cn("text-[10px] uppercase font-bold tracking-widest", isFailed ? "text-destructive/60" : "text-success/60")}>
                                        {isFailed ? "Unsuccessful Score" : "Performance Score"}
                                     </div>
                                     <div className={cn("text-3xl font-display font-bold", isFailed ? "text-destructive" : "text-success")}>
                                        {v.dissertation?.examiner_marks || '--'} <span className="text-xs opacity-50">/ 100</span>
                                     </div>
                                  </div>

                                  {isFailed && (
                                     <div className="mt-8 space-y-4 animate-in slide-in-from-bottom duration-700">
                                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-[10px] font-bold uppercase text-destructive tracking-widest text-center animate-pulse">
                                           {canControl ? "Action Required: Failure Logged" : "Ineligible for Degree"}
                                        </div>
                                        
                                        {!canControl ? (
                                          <button 
                                            onClick={async (e) => {
                                               try {
                                                  const btn = e.currentTarget;
                                                  btn.disabled = true;
                                                  btn.innerText = "Requesting...";
                                                  await apiClient.post('/notifications', {
                                                     user_id: 1, 
                                                     title: 'Viva Retake Requested 🔄',
                                                     message: `Student ${user?.name} has requested a re-examination for: ${v.topic}`,
                                                     type: 'dissertation'
                                                  });
                                                  btn.innerText = "Retake Request Sent";
                                                  btn.className = "w-full py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold uppercase text-xs cursor-default";
                                                  toast.success("Request sent to HOD!");
                                               } catch (err) { toast.error("Failed to send request"); }
                                            }}
                                            className="w-full py-4 rounded-2xl bg-destructive text-white font-bold uppercase text-xs shadow-glow-destructive hover:scale-105 active:scale-95 transition-all"
                                          >
                                             Request Re-examination from HOD
                                          </button>
                                        ) : (
                                          <button 
                                            onClick={async () => {
                                               try {
                                                  await apiClient.post(`/dissertations/${v.dissertation_id}/approve-retake`);
                                                  toast.success("Retake Authorized! Student notified.");
                                                  loadVivas();
                                               } catch (err) { toast.error("Failed to authorize retake"); }
                                            }}
                                            className="w-full py-4 rounded-2xl bg-primary text-white font-bold uppercase text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                                          >
                                             Authorize Re-viva Now
                                          </button>
                                        )}
                                        <p className="text-[10px] text-muted-foreground text-center italic">
                                           {canControl ? "Authorize a second attempt for this student." : "Your request will appear in the HOD's Graduation Hub for approval."}
                                        </p>
                                     </div>
                                  )}
                               </div>
                             )}
                          </div>
                        )}
                      </div>

                      <div className="mt-8 pt-8 border-t border-primary/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Session Status</span>
                          <span className={cn("font-bold uppercase tracking-widest flex items-center gap-1.5", isLive ? "text-success" : "text-warning")}>
                            {isLive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {isLive ? "Verified" : "Waiting"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function Countdown({ target, now }: { target: string, now: Date }) {
  const diff = new Date(target).getTime() - now.getTime();
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return (
    <div className="flex gap-6">
       <TimeBlock val={d} label="Days" />
       <TimeBlock val={h} label="Hours" />
       <TimeBlock val={m} label="Mins" />
       <TimeBlock val={s} label="Secs" />
    </div>
  );
}

function TimeBlock({ val, label }: { val: number, label: string }) {
  return (
    <div className="text-center">
       <div className="text-4xl font-display font-bold text-primary tabular-nums">{val.toString().padStart(2, '0')}</div>
       <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mt-1">{label}</div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card/60 flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{label}</div>
        <div className="text-sm font-bold truncate">{value}</div>
      </div>
    </div>
  );
}
