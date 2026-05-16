import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Plus, Video, MapPin, Clock, CalendarClock, X } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({ meta: [{ title: "Meetings — ScholarOS" }] }),
  component: Page,
});

const days = Array.from({ length: 35 }, (_, i) => i - 2);

function Page() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [hasApproved, setHasApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dissertations, setDissertations] = useState<any[]>([]);
  
  // Form State
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("virtual");
  const [location, setLocation] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [meetRes, dissRes] = await Promise.all([
        apiClient.get('/meetings'),
        apiClient.get('/dissertations')
      ]);
      setMeetings(meetRes.data);
      const dissData = Array.isArray(dissRes.data) ? dissRes.data : [dissRes.data];
      setDissertations(dissData);
      const approved = dissData.some((d: any) => d.status === 'approved');
      setHasApproved(approved);

      if (user?.role === 'student') {
        const myDiss = dissData.find((d: any) => d.student_id === user.id);
        if (myDiss?.guide) {
          setSelectedFacultyId(myDiss.guide.id);
          setSelectedStudentId(user.id.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !topic) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/meetings', {
        topic,
        scheduled_at: date,
        type,
        location: type === 'virtual' ? 'Online' : location,
        student_id: user?.role === 'student' ? user.id : selectedStudentId,
        faculty_id: user?.role === 'faculty' ? user.id : selectedFacultyId,
      });
      toast.success("Meeting requested successfully!");
      setShowModal(false);
      loadData();
      // Reset form
      setTopic("");
      setDate("");
    } catch (err) {
      toast.error("Failed to schedule meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponse = async (id: number, status: 'scheduled' | 'rejected') => {
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
      loadData();
    } catch (err) {
      toast.error("Failed to respond to meeting");
    }
  };

  if (loading) return <div className="p-8 text-center font-display text-lg animate-pulse text-primary">Syncing Calendar...</div>;

  return (
    <>
      <PageHeader
        kicker="Calendar"
        title="Meetings & defenses"
        actions={
          <div className="flex flex-col items-end gap-1">
            <button 
              disabled={!hasApproved && user?.role === 'student'}
              onClick={() => setShowModal(true)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                (hasApproved || user?.role !== 'student')
                  ? "gradient-primary text-primary-foreground shadow-glow hover:shadow-primary/40 active:scale-95" 
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              }`}
            >
              <Plus className="h-4 w-4" /> Schedule meeting
            </button>
            {!hasApproved && user?.role === 'student' && (
              <span className="text-[10px] text-warning animate-pulse">Requires Approved Dissertation</span>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border glass p-5">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg font-semibold">November 2026</div>
            <div className="flex items-center gap-1 text-xs">
              {["Day","Week","Month"].map(v => (
                <button key={v} className={`rounded-lg border border-border px-3 py-1 ${v==="Month"?"bg-primary/15 text-primary":"text-muted-foreground hover:text-foreground"}`}>{v}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className="px-2">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              const inMonth = d > 0 && d <= 30;
              return (
                <div key={i} className={`min-h-[88px] rounded-xl border p-2 text-xs transition-all ${inMonth ? "border-border bg-background/40 hover:bg-background/60" : "border-border/40 bg-background/20 text-muted-foreground/50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`${d === 11 ? "grid h-5 w-5 place-items-center rounded-md bg-primary text-primary-foreground font-semibold" : ""}`}>{inMonth ? d : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border glass p-5 flex flex-col h-full">
          <div className="font-display text-lg font-semibold">Upcoming & Pending</div>
          <ul className="mt-3 space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {meetings.length > 0 ? (
              meetings.map((e, i) => (
                <li key={i} className="rounded-xl border border-border bg-background/40 p-4 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary"><Clock className="h-3.5 w-3.5" /> {new Date(e.scheduled_at).toLocaleString()}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      e.status === 'scheduled' ? 'bg-success/10 text-success' : 
                      e.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="mt-1 font-medium">{e.topic}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Video className="h-3.5 w-3.5" /> {user?.role === 'student' ? (e.faculty?.name || "Faculty Member") : (e.student?.name || "Student")}
                  </div>
                  
                  {e.status === 'rejected' && e.rejection_reason && (
                    <div className="mt-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20 text-[10px] text-destructive italic">
                      Reason: {e.rejection_reason}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    {e.status === 'scheduled' && (
                      <button className="rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition-all active:scale-95">Join</button>
                    )}
                    
                    {user?.role === 'faculty' && e.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleResponse(e.id, 'scheduled')}
                          className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleResponse(e.id, 'rejected')}
                          className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    <button className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs transition-all hover:bg-muted">Details</button>
                  </div>
                </li>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <CalendarClock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No meetings found.</p>
                </div>
              </div>
            )}
          </ul>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">Schedule Session</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSchedule} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Topic / Agenda</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. Literature Review Feedback"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setType('virtual')} 
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${type === 'virtual' ? "border-primary bg-primary/5 text-primary" : "border-border opacity-50"}`}
                >
                  <Video className="h-6 w-6" /> <span className="text-xs font-bold">Virtual</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setType('in_person')} 
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${type === 'in_person' ? "border-primary bg-primary/5 text-primary" : "border-border opacity-50"}`}
                >
                  <MapPin className="h-6 w-6" /> <span className="text-xs font-bold">In-Person</span>
                </button>
              </div>

              {type === 'in_person' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Location</label>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="e.g. Room 302, Block A"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              )}

              {user?.role === 'faculty' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Select Student</label>
                  <select 
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">Select a student...</option>
                    {dissertations.map((d: any) => (
                      <option key={d.id} value={d.student_id}>{d.student?.name} ({d.title})</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : user?.role === 'student' ? "Request Meeting" : "Schedule Meeting"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
