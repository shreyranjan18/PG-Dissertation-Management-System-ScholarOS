import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/StatCard";
import apiClient, { STORAGE_URL } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  CheckCircle2, Circle, Clock, MessageSquare, 
  Video, MapPin, Upload, FileText, Send, 
  ChevronRight, AlertCircle, Plus, LayoutGrid, Handshake,
  ChevronLeft, Lock, ShieldCheck, RefreshCw, X, Download,
  FileCheck, FileEdit, History, Presentation, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/mentorship")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      dissertation_id: search.dissertation_id as string | undefined,
    }
  },
  head: () => ({ meta: [{ title: "Mentorship Portfolio — ScholarOS" }] }),
  component: MentorshipHub,
});

type Chapter = {
  id: string; title: string; status: string; file_path?: string;
  guide_feedback?: string; order: number; due_date?: string;
};

type Dissertation = {
  id: string; title: string; status: string; department: string; 
  guide?: { name: string; id: string };
  student?: { name: string; id: string };
  abstract?: string;
  file_path?: string;
};

const CHAPTER_TEMPLATES = [
  "Chapter 1: Introduction",
  "Chapter 2: Literature Review",
  "Chapter 3: Methodology",
  "Chapter 4: Data Analysis",
  "Chapter 5: Conclusion"
];

function MentorshipHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const search: any = useSearch({ from: '/_app/mentorship' });
  
  const [selectedDissertationId, setSelectedDissertationId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chapters" | "chat" | "meetings" | "overview">("overview");
  
  // UI State
  const [facultyRemark, setFacultyRemark] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [meetingTopic, setMeetingTopic] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingType, setMeetingType] = useState<"virtual" | "in_person">("virtual");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Queries
  const { data: dissertations = [], isLoading: loadingDissertations } = useQuery({
    queryKey: ['dissertations'],
    queryFn: async () => {
      const res = await apiClient.get('/dissertations');
      const data = Array.isArray(res.data) ? res.data : [res.data];
      return data.filter(d => d && d.id) as Dissertation[];
    }
  });

  const selectedDissertation = useMemo(() => 
    dissertations.find(d => d.id === selectedDissertationId), 
  [dissertations, selectedDissertationId]);

  const { data: chapters = [], isLoading: loadingChapters } = useQuery({
    queryKey: ['chapters', selectedDissertationId],
    queryFn: async () => {
      const res = await apiClient.get(`/chapters-by-dissertation/${selectedDissertationId}`);
      return (Array.isArray(res.data) ? res.data : []) as Chapter[];
    },
    enabled: !!selectedDissertationId,
    refetchInterval: user?.role === 'student' ? 10000 : false // Poll for students to see feedback updates
  });

  const selectedChapter = useMemo(() => 
    chapters.find(c => c.id === selectedChapterId), 
  [chapters, selectedChapterId]);

  const { data: feedbackLog = [] } = useQuery({
    queryKey: ['feedback', selectedDissertationId],
    queryFn: async () => {
      const res = await apiClient.get(`/dissertations/${selectedDissertationId}/feedback`);
      return res.data;
    },
    enabled: !!selectedDissertationId && activeTab === 'overview'
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const res = await apiClient.get('/meetings');
      return res.data;
    }
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['chat', selectedDissertationId, selectedChapterId],
    queryFn: async () => {
        const url = selectedChapterId 
          ? `/chat?chapter_id=${selectedChapterId}` 
          : `/chat?dissertation_id=${selectedDissertationId}`;
        const res = await apiClient.get(url);
        return res.data;
    },
    enabled: !!selectedDissertationId && (!!selectedChapterId || activeTab === 'chat'),
    refetchInterval: 2000 // Faster polling for real-time feel
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
        if (selectedChapterId) {
            return apiClient.post(`/chapters/${selectedChapterId}`, formData);
        } else {
            return apiClient.post('/chapters', formData);
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chapters', selectedDissertationId] });
        toast.success("Manuscript updated successfully!");
    },
    onError: () => toast.error("Upload failed")
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, feedback }: { status: string, feedback: string }) => {
        return apiClient.post(`/chapters/${selectedChapterId}`, {
            status,
            guide_feedback: feedback,
            _method: 'POST'
        });
    },
    onSuccess: (res, variables) => {
        queryClient.invalidateQueries({ queryKey: ['chapters', selectedDissertationId] });
        toast.success(`Chapter ${variables.status === 'approved' ? 'Approved' : 'Updated'}`);
    },
    onError: () => toast.error("Status update failed")
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
        const receiverId = user?.role === 'student' ? selectedDissertation?.guide?.id : selectedDissertation?.student?.id;
        return apiClient.post('/chat', {
            content,
            receiver_id: receiverId,
            dissertation_id: selectedDissertationId,
            chapter_id: selectedChapterId || null
        });
    },
    onMutate: async (newContent) => {
        await queryClient.cancelQueries({ queryKey: ['chat', selectedDissertationId, selectedChapterId] });
        const previousMessages = queryClient.getQueryData(['chat', selectedDissertationId, selectedChapterId]);
        
        queryClient.setQueryData(['chat', selectedDissertationId, selectedChapterId], (old: any) => [
            ...(old || []),
            {
                id: Date.now().toString(),
                content: newContent,
                sender_id: user?.id,
                created_at: new Date().toISOString(),
                isOptimistic: true
            }
        ]);
        
        setChatInput("");
        return { previousMessages };
    },
    onError: (err, newContent, context) => {
        queryClient.setQueryData(['chat', selectedDissertationId, selectedChapterId], context?.previousMessages);
        toast.error("Failed to send message");
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['chat', selectedDissertationId, selectedChapterId] });
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: async (comments: string) => {
        return apiClient.post('/feedback', {
            dissertation_id: selectedDissertationId,
            comments
        });
    },
    onMutate: async (newComments) => {
        await queryClient.cancelQueries({ queryKey: ['feedback', selectedDissertationId] });
        const previousFeedback = queryClient.getQueryData(['feedback', selectedDissertationId]);
        
        queryClient.setQueryData(['feedback', selectedDissertationId], (old: any) => [
            ...(old || []),
            {
                id: Date.now().toString(),
                comments: newComments,
                created_at: new Date().toISOString(),
                faculty: { name: user?.name || 'Me' },
                isOptimistic: true
            }
        ]);
        
        setNewFeedback("");
        return { previousFeedback };
    },
    onError: (err, newComments, context) => {
        queryClient.setQueryData(['feedback', selectedDissertationId], context?.previousFeedback);
        toast.error("Failed to log feedback");
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['feedback', selectedDissertationId] });
        toast.success("Official feedback logged!");
    }
  });

  const meetingMutation = useMutation({
    mutationFn: async () => {
        return apiClient.post('/meetings', {
            dissertation_id: selectedDissertationId,
            student_id: selectedDissertation?.student?.id,
            faculty_id: selectedDissertation?.guide?.id,
            topic: meetingTopic,
            type: meetingType,
            scheduled_at: meetingDate,
            location: meetingType === 'virtual' ? 'Online' : meetingLocation
        });
    },
    onSuccess: () => {
        setShowMeetingModal(false);
        setMeetingTopic("");
        setMeetingDate("");
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
        toast.success("Meeting invitation sent!");
    },
    onError: () => toast.error("Scheduling failed")
  });

  // Effect for deep links
  useEffect(() => {
    if (search.dissertation_id && dissertations.length > 0) {
        const d = dissertations.find(item => String(item.id) === String(search.dissertation_id));
        if (d) setSelectedDissertationId(d.id);
    }
  }, [dissertations, search.dissertation_id]);

  useEffect(() => {
    if (selectedChapter) {
        setFacultyRemark(selectedChapter.guide_feedback || "");
    }
  }, [selectedChapterId, selectedChapter]);

  const openDissertation = (d: Dissertation) => {
    const activeStatuses = ['approved', 'viva_scheduled', 'completed', 'viva_failed'];
    if (!activeStatuses.includes(d.status)) {
        toast.error("Access Restricted", { description: "Hub opens after HOD topic approval." });
        return;
    }
    setSelectedDissertationId(d.id);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDissertationId) return;

    const formData = new FormData();
    formData.append('dissertation_id', selectedDissertationId);
    formData.append('file', file);
    
    if (selectedChapterId) {
        formData.append('title', selectedChapter?.title || "");
    } else {
        const nextTitle = CHAPTER_TEMPLATES[chapters.length] || `Chapter ${chapters.length + 1}`;
        formData.append('title', nextTitle);
    }
    uploadMutation.mutate(formData);
  };

  const handleMeetingResponse = async (id: number, status: 'scheduled' | 'rejected') => {
    try {
      let rejection_reason = null;
      if (status === 'rejected') {
        rejection_reason = prompt("Please provide a reason for rejection:");
        if (rejection_reason === null) return;
      }

      await apiClient.post(`/meetings/${id}/respond`, {
        status,
        rejection_reason
      });
      toast.success(`Meeting ${status === 'scheduled' ? 'approved' : 'rejected'}`);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch (err) {
      toast.error("Failed to respond to meeting");
    }
  };

  if (loadingDissertations) return <div className="p-20 text-center animate-pulse text-primary font-display">Opening Library...</div>;

  const isFaculty = user?.role === 'faculty';

  return (
    <>
      <PageHeader 
        kicker={selectedDissertation ? (isFaculty ? `Mentoring: ${selectedDissertation.student?.name}` : "Mentorship Portfolio") : "Academic Portal"} 
        title={selectedDissertation ? selectedDissertation.title : "Active Mentorship Hub"} 
        actions={
            <div className="flex gap-2">
                {selectedDissertation ? (
                    <>
                        <button onClick={() => { setSelectedDissertationId(null); setSelectedChapterId(null); }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm hover:bg-accent transition-all">
                            <ChevronLeft className="h-4 w-4" /> Portfolio
                        </button>
                        <button onClick={() => setShowMeetingModal(true)} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-white shadow-glow transition-all active:scale-95">
                            <Video className="h-4 w-4" /> Schedule
                        </button>
                    </>
                ) : (
                    <button onClick={() => queryClient.invalidateQueries({ queryKey: ['dissertations'] })} className="p-2 rounded-xl border border-border bg-card/60 hover:bg-accent transition-all">
                        <RefreshCw className={`h-4 w-4 ${loadingDissertations ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>
        }
      />

      {!selectedDissertation ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dissertations.length === 0 ? (
                <div className="col-span-full py-20 text-center rounded-[2.5rem] border-2 border-dashed border-border bg-background/20">
                    <Handshake className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-display font-semibold">No Submissions</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Topics will appear here after HOD approval.</p>
                </div>
            ) : (
                dissertations.map(d => (
                    <button key={d.id} onClick={() => openDissertation(d)} className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 text-left transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
                        <div className="flex items-start justify-between">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-success/30 text-success bg-success/5">Active</div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-display font-semibold line-clamp-2 min-h-[3.5rem]">{d.title}</h3>
                            <p className="mt-2 text-xs text-muted-foreground">{d.department} · {isFaculty ? `Student: ${d.student?.name}` : `Guide: ${d.guide?.name}`}</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
                             <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-accent border-2 border-card overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${isFaculty ? d.student?.name : d.guide?.name}`} />
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{isFaculty ? 'Scholar' : 'Guide'}</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-primary" />
                        </div>
                    </button>
                ))
            )}
        </div>
      ) : (
        <div className="space-y-6">
            {/* Professional Tab Navigation */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card/60 border border-border w-fit">
                {[
                    { id: 'overview', label: 'Overview', icon: LayoutGrid },
                    { id: 'chapters', label: 'Chapter Board', icon: FileCheck },
                    { id: 'chat', label: 'Collaboration', icon: MessageSquare },
                    { id: 'meetings', label: 'Sessions', icon: Video },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                            activeTab === tab.id ? "bg-primary text-white shadow-glow" : "text-muted-foreground hover:bg-accent"
                        )}
                    >
                        <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-[2.5rem] border border-border glass p-8">
                                <h3 className="text-2xl font-display font-semibold mb-4">Research Abstract</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground italic">"{selectedDissertation.abstract || 'No abstract provided yet.'}"</p>
                                <div className="mt-8 flex gap-4">
                                    <div className="flex-1 p-4 rounded-2xl bg-background/40 border border-border">
                                        <div className="text-[10px] uppercase font-bold text-primary mb-1">Student Scholar</div>
                                        <div className="text-sm font-bold">{selectedDissertation.student?.name}</div>
                                    </div>
                                    <div className="flex-1 p-4 rounded-2xl bg-background/40 border border-border">
                                        <div className="text-[10px] uppercase font-bold text-primary mb-1">Department</div>
                                        <div className="text-sm font-bold">{selectedDissertation.department}</div>
                                    </div>
                                </div>
                            </div>

                            {/* New: General Feedback Ledger */}
                            <div className="rounded-[2.5rem] border border-border bg-card p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" /> Dissertation Feedback Log
                                    </h3>
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Official Records</span>
                                </div>
                                
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                    {feedbackLog.length === 0 ? (
                                        <div className="py-10 text-center text-xs text-muted-foreground italic bg-background/20 rounded-2xl border border-dashed border-border">
                                            No official feedback records found for this dissertation.
                                        </div>
                                    ) : (
                                        feedbackLog.map((f, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl border border-border bg-background/40 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-[10px] font-bold text-primary uppercase">{f.faculty?.name || 'Guide'}</div>
                                                    <div className="text-[9px] text-muted-foreground uppercase">{new Date(f.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <p className="text-xs leading-relaxed text-slate-300">{f.comments}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {isFaculty && (
                                    <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                                        <textarea 
                                            value={newFeedback}
                                            onChange={e => setNewFeedback(e.target.value)}
                                            placeholder="Write high-level feedback or overall dissertation remarks..."
                                            className="w-full h-24 bg-background/50 border border-border rounded-xl p-4 text-xs outline-none focus:border-primary transition-all resize-none"
                                        />
                                    <button 
                                        onClick={() => feedbackMutation.mutate(newFeedback)}
                                        disabled={feedbackMutation.isPending || !newFeedback}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-glow hover:scale-[1.01] transition-all disabled:opacity-50"
                                    >
                                        {feedbackMutation.isPending ? "Logging Record..." : "Log Official Feedback"}
                                    </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 rounded-3xl border border-border bg-card/40">
                                    <div className="h-10 w-10 rounded-xl bg-success/10 text-success grid place-items-center mb-4"><CheckCircle2 className="h-6 w-6" /></div>
                                    <div className="text-2xl font-bold">{chapters.filter(c => c.status === 'approved').length} / 5</div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold">Chapters Approved</div>
                                </div>
                                <div className="p-6 rounded-3xl border border-border bg-card/40">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4"><History className="h-6 w-6" /></div>
                                    <div className="text-2xl font-bold">{chapters.length}</div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold">Drafts Submitted</div>
                                </div>
                            </div>
                             <div className="p-6 rounded-[2.5rem] border border-border bg-card">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Recent Activity</h4>
                                <div className="space-y-6">
                                    {chapters.slice(0,3).map(c => (
                                        <div key={c.id} className="flex gap-4">
                                            <div className="h-2 w-2 mt-1 rounded-full bg-primary" />
                                            <div>
                                                <div className="text-xs font-bold">{c.title}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{c.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'chapters' && (
                    <div className="grid gap-8 lg:grid-cols-12">
                         <div className="lg:col-span-4 space-y-3">
                             <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 px-2">Navigation Board</h3>
                             {chapters.map((ch, i) => {
                                const isPreviousApproved = i === 0 || chapters[i-1].status === 'approved';
                                const isLocked = !isPreviousApproved;
                                return (
                                    <button 
                                        key={ch.id}
                                        disabled={isLocked && !isFaculty}
                                        onClick={() => setSelectedChapterId(ch.id)}
                                        className={cn(
                                            "w-full group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                                            selectedChapter?.id === ch.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card/40",
                                            isLocked && !isFaculty && "opacity-40 grayscale pointer-events-none"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-8 w-8 rounded-lg grid place-items-center", ch.status === 'approved' ? "bg-success/10 text-success" : "bg-primary/10 text-primary")}>
                                                    {ch.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                </div>
                                                <div className="text-sm font-bold">{ch.title}</div>
                                            </div>
                                            <ChevronRight className={cn("h-4 w-4 text-muted-foreground", selectedChapter?.id === ch.id && "text-primary translate-x-1")} />
                                        </div>
                                        
                                        <div className="mt-3 flex items-center justify-between border-t border-border/20 pt-3">
                                            <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                                                <span className={cn("h-1 w-1 rounded-full", ch.status === 'approved' ? "bg-success" : "bg-warning")} />
                                                {ch.status}
                                            </div>
                                            <div className="text-[9px] font-bold uppercase tracking-tighter">
                                                {ch.due_date ? (
                                                    (() => {
                                                        const diff = new Date(ch.due_date).getTime() - new Date().getTime();
                                                        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                        return (
                                                            <span className={days < 0 ? "text-destructive" : days <= 3 ? "text-warning" : "text-success"}>
                                                                {days < 0 ? `Overdue ${Math.abs(days)}d` : days === 0 ? "Due Today" : `${days}d left`}
                                                            </span>
                                                        );
                                                    })()
                                                ) : (
                                                    <span className="text-muted-foreground/30 italic">Awaiting HOD Timeline</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                             })}
                         </div>
                         <div className="lg:col-span-8">
                             {selectedChapter ? (
                                 <div className="rounded-[2.5rem] border border-border glass p-8">
                                     <div className="flex items-start justify-between mb-8 pb-8 border-b border-border/50">
                                         <div>
                                             <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-1">Detailed Review</div>
                                             <h2 className="text-3xl font-display font-bold">{selectedChapter.title}</h2>
                                         </div>
                                         <div className="text-right">
                                             <div className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest", 
                                                selectedChapter.status === 'approved' ? "bg-success/20 text-success" : "bg-warning/20 text-warning")}>
                                                 <span className="h-1.5 w-1.5 rounded-full bg-current" /> {selectedChapter.status}
                                             </div>
                                         </div>
                                     </div>

                                     <div className="grid gap-8 lg:grid-cols-2">
                                         <div className="space-y-6">
                                             {selectedChapter.file_path ? (
                                                 <div className="rounded-3xl border border-border bg-background/50 p-6 flex flex-col gap-6">
                                                     <div className="flex items-center gap-4">
                                                         <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive grid place-items-center"><FileText className="h-7 w-7" /></div>
                                                         <div>
                                                             <div className="text-sm font-bold">Manuscript Draft</div>
                                                             <div className="text-xs text-muted-foreground">Portable Document Format (PDF)</div>
                                                         </div>
                                                     </div>
                                                     <div className="grid grid-cols-2 gap-2">
                                                        <a 
                                                            href={`${STORAGE_URL}/${selectedChapter.file_path}`} 
                                                            download={`${selectedChapter.title.replace(/\s+/g, '_')}.pdf`}
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all shadow-glow"
                                                        >
                                                            <Download className="h-4 w-4" /> Download Draft
                                                        </a>
                                                        {!isFaculty && (
                                                            <label className={cn("flex items-center justify-center gap-2 bg-card border border-border py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-accent transition-all", uploadMutation.isPending && "opacity-50 cursor-wait")}>
                                                                {uploadMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                                {uploadMutation.isPending ? "Updating..." : "Re-upload"}
                                                                <input type="file" className="hidden" accept="application/pdf" onChange={handleUpload} disabled={uploadMutation.isPending} />
                                                            </label>
                                                        )}
                                                     </div>
                                                 </div>
                                             ) : (
                                                 <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center bg-primary/5">
                                                     <Upload className="h-10 w-10 text-primary mx-auto mb-4" />
                                                     <h4 className="font-bold">No Submission Yet</h4>
                                                     {!isFaculty && (
                                                         <label className={cn("mt-6 inline-block cursor-pointer bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-glow", uploadMutation.isPending && "opacity-50 cursor-wait")}>
                                                            {uploadMutation.isPending ? "Uploading Manuscript..." : "Upload PDF"}
                                                            <input type="file" className="hidden" accept="application/pdf" onChange={handleUpload} disabled={uploadMutation.isPending} />
                                                         </label>
                                                     )}
                                                 </div>
                                             )}

                                             {/* Faculty Remarks Section */}
                                             <div className="p-6 rounded-3xl border border-border bg-card">
                                                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Official Remarks</h4>
                                                 {isFaculty ? (
                                                     <div className="space-y-3">
                                                         <textarea 
                                                            value={facultyRemark}
                                                            onChange={e => setFacultyRemark(e.target.value)}
                                                            placeholder="Add your feedback, suggestions, or correction requirements here..."
                                                            className="w-full h-32 bg-background/50 border border-border rounded-2xl p-4 text-sm outline-none focus:border-primary transition-all resize-none"
                                                         />
                                                         <button 
                                                            onClick={() => statusMutation.mutate({ status: selectedChapter.status, feedback: facultyRemark })}
                                                            disabled={statusMutation.isPending || facultyRemark === selectedChapter.guide_feedback}
                                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all disabled:opacity-50"
                                                         >
                                                            {statusMutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                                            Save Draft Notes
                                                         </button>
                                                     </div>
                                                 ) : (
                                                     <div className="text-sm text-slate-300 italic leading-relaxed">
                                                         {selectedChapter.guide_feedback || "The guide has not provided feedback for this draft yet."}
                                                     </div>
                                                 )}
                                             </div>
                                         </div>

                                         {isFaculty && (
                                             <div className="space-y-6">
                                                 <div className="p-8 rounded-[2.5rem] border border-primary/20 bg-primary/5 relative overflow-hidden">
                                                     <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-primary/10 rotate-12" />
                                                     <h4 className="text-lg font-display font-bold mb-2">Review Actions</h4>
                                                     <p className="text-xs text-muted-foreground mb-6">Review the draft and update the chapter status accordingly. This will notify the student instantly.</p>
                                                     
                                                     <div className="space-y-3">
                                                         <button 
                                                            disabled={statusMutation.isPending}
                                                            onClick={() => statusMutation.mutate({ status: 'approved', feedback: facultyRemark })}
                                                            className="w-full flex items-center justify-center gap-2 bg-success text-success-foreground py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow disabled:opacity-50"
                                                         >
                                                             {statusMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                                             {statusMutation.isPending ? "Updating..." : "Approve Chapter"}
                                                         </button>
                                                         <button 
                                                            disabled={statusMutation.isPending}
                                                            onClick={() => statusMutation.mutate({ status: 'feedback_provided', feedback: facultyRemark })}
                                                            className="w-full flex items-center justify-center gap-2 bg-card border border-border py-4 rounded-2xl font-bold hover:bg-accent active:scale-[0.98] transition-all disabled:opacity-50"
                                                         >
                                                             <FileEdit className="h-5 w-5 text-primary" /> Request Revisions
                                                         </button>
                                                     </div>
                                                 </div>

                                                 <div className="p-6 rounded-3xl border border-border bg-card/60">
                                                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Version Info</h4>
                                                     <div className="space-y-4">
                                                         <div className="flex justify-between items-center text-xs">
                                                             <span className="text-muted-foreground">Last Updated</span>
                                                             <span className="font-bold">Today, 02:45 PM</span>
                                                         </div>
                                                         <div className="flex justify-between items-center text-xs">
                                                             <span className="text-muted-foreground">Revision Cycle</span>
                                                             <span className="font-bold">V1.2</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             ) : (
                                 <div className="h-full flex flex-col items-center justify-center py-32 text-center space-y-4 rounded-[3rem] border-2 border-dashed border-border bg-background/20">
                                     <Presentation className="h-16 w-16 text-primary/30" />
                                     <h3 className="text-xl font-bold">Selection Required</h3>
                                     <p className="text-sm text-muted-foreground max-w-xs">Select a chapter from the board on the left to begin the review process.</p>
                                 </div>
                             )}
                         </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="rounded-[2.5rem] border border-border glass p-8 flex flex-col h-[600px]">
                         <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><MessageSquare className="h-5 w-5" /></div>
                            <div>
                                <h3 className="text-xl font-bold">Research Collaboration</h3>
                                <p className="text-xs text-muted-foreground">Direct secure channel for {selectedChapter?.title || 'Chapter Support'}</p>
                            </div>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 scrollbar-thin min-h-[400px]">
                             {messages.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-xs">No discussion history found.</div>
                             ) : (
                                     messages.map((m: any, idx) => {
                                         const sId = m.sender_id ?? m.senderId;
                                         const isMe = String(sId) === String(user?.id);
                                         const msgContent = m.content ?? m.message ?? m.text ?? m['content'];
                                         const displayContent = msgContent || (m.id ? `[Ref #${m.id}]` : JSON.stringify(m).substring(0, 20));
                                         
                                         return (
                                             <div key={idx} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                                 <div 
                                                    className={cn("max-w-[80%] min-w-[80px] px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl", 
                                                        isMe ? "bg-primary text-white rounded-tr-none" : "bg-slate-800 text-white border border-slate-700 rounded-tl-none",
                                                        m.isOptimistic && "opacity-70 italic")
                                                    }
                                                    style={{ color: 'white' }}
                                                 >
                                                     {displayContent}
                                                 </div>
                                                 <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-2 px-2 opacity-50">
                                                     {new Date(m.created_at || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                 </span>
                                             </div>
                                         );
                                     })
                             )}
                         </div>

                         <form onSubmit={(e) => { e.preventDefault(); messageMutation.mutate(chatInput); }} className="flex gap-3 bg-background/50 border border-border p-2 rounded-2xl">
                             <input 
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                                placeholder="Share thoughts or corrections..." 
                             />
                             <button type="submit" disabled={messageMutation.isPending || !chatInput} className="px-6 rounded-xl bg-primary text-white font-bold text-xs hover:shadow-glow transition-all active:scale-95 disabled:opacity-50">
                                {messageMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Send Message"}
                             </button>
                         </form>
                    </div>
                )}

                {activeTab === 'meetings' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-[2.5rem] border border-border glass p-10 flex flex-col items-center justify-center text-center space-y-6">
                            <Video className="h-16 w-16 text-primary animate-pulse" />
                            <h3 className="text-2xl font-display font-bold">Mentorship Sessions</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">Coordinate with your {isFaculty ? 'student' : 'guide'} for one-on-one research reviews.</p>
                            <button onClick={() => setShowMeetingModal(true)} className="gradient-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Plus className="h-4 w-4" /> {isFaculty ? 'Create New Invite' : 'Request Meeting'}
                            </button>
                        </div>
                        <div className="p-8 rounded-[2.5rem] border border-border bg-card/40">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Upcoming & Pending Agenda</h4>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                {meetings.filter(m => String(m.dissertation_id) === String(selectedDissertation.id)).length === 0 ? (
                                    <div className="py-10 text-center text-xs text-muted-foreground italic">No meetings scheduled for this dissertation.</div>
                                ) : (
                                    meetings.filter(m => String(m.dissertation_id) === String(selectedDissertation.id)).map((m, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl border border-border bg-background/40 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Clock className="h-5 w-5" /></div>
                                                    <div>
                                                        <div className="text-sm font-bold">{m.topic}</div>
                                                        <div className="text-[10px] text-muted-foreground">{new Date(m.scheduled_at).toLocaleString()} · {m.type}</div>
                                                    </div>
                                                </div>
                                                <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold uppercase", 
                                                    m.status === 'scheduled' ? "bg-success/10 text-success" : 
                                                    m.status === 'pending' ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive")}>
                                                    {m.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {m.status === 'scheduled' && (
                                                    <button className="flex-1 bg-primary/10 text-primary py-2 rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all">Join Session</button>
                                                )}
                                                {isFaculty && m.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleMeetingResponse(m.id, 'scheduled')} className="flex-1 bg-success text-white py-2 rounded-lg text-[10px] font-bold">Approve</button>
                                                        <button onClick={() => handleMeetingResponse(m.id, 'rejected')} className="flex-1 bg-destructive text-white py-2 rounded-lg text-[10px] font-bold">Reject</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-display font-bold">Invite for Session</h2>
                    <button onClick={() => setShowMeetingModal(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Meeting Topic</label>
                        <input type="text" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Chapter 1 Discussion" value={meetingTopic} onChange={e => setMeetingTopic(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setMeetingType('virtual')} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all", meetingType === 'virtual' ? "border-primary bg-primary/5 text-primary" : "border-border opacity-50")}>
                            <Video className="h-6 w-6" /> <span className="text-xs font-bold">Virtual</span>
                        </button>
                        <button onClick={() => setMeetingType('in_person')} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all", meetingType === 'in_person' ? "border-primary bg-primary/5 text-primary" : "border-border opacity-50")}>
                            <MapPin className="h-6 w-6" /> <span className="text-xs font-bold">In-Person</span>
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date & Time</label>
                        <input type="datetime-local" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                    </div>
                    {meetingType === 'in_person' && (
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Location</label>
                            <input type="text" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="Room 201" value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)} />
                        </div>
                    )}
                    <button 
                        onClick={() => meetingMutation.mutate()} 
                        disabled={meetingMutation.isPending}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {meetingMutation.isPending ? "Sending..." : (isFaculty ? 'Send Invitation' : 'Request Session')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
