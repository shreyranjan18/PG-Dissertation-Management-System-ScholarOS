import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/StatCard";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Upload, FileText, Landmark } from "lucide-react";

export const Route = createFileRoute("/_app/dissertation/new")({
  head: () => ({ meta: [{ title: "Submit Topic — ScholarOS" }] }),
  component: NewTopic,
});

const DOMAINS = ["AI/ML", "Systems", "Networks", "Cybersecurity", "Bio-Tech", "Sustainability", "Finance", "Other"];
const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "EEE", "MBA", "MCA"];

function NewTopic() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [area, setArea] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  if (user.role !== "student") {
    return <div className="rounded-2xl border border-border glass p-6 text-sm">Only students can submit a dissertation topic.</div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('abstract', abstract.trim());
      formData.append('domain', domain);
      formData.append('department', department);
      formData.append('research_area', area.trim());
      if (file) {
        formData.append('file', file);
      }

      await apiClient.post('/dissertations', formData);
      
      toast.success("Topic submitted", { description: "Department HOD has been notified for guide assignment." });
      navigate({ to: "/dissertation" });
    } catch (err: any) {
      toast.error("Submission failed", { description: err.response?.data?.message || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader kicker="Phase 1: Initiation" title="Submit Topic Proposal" />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={submit} className="flex-1 rounded-[2rem] border border-border glass p-8 space-y-6 animate-in slide-in-from-left duration-700">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Dissertation Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="e.g. Enhancing Deepfake Detection using Vision Transformers"
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary/40 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Core Abstract</label>
            <textarea 
              value={abstract} 
              onChange={e => setAbstract(e.target.value)} 
              required 
              rows={6} 
              placeholder="Summarize your research goals and methodology..."
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none" 
            />
            <div className="text-right text-[10px] text-muted-foreground">{abstract.length}/2500</div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Assign to Department</label>
              <select 
                value={department} 
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
              >
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Specialization Domain</label>
              <select 
                value={domain} 
                onChange={e => setDomain(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
              >
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Specific Research Area</label>
            <input 
              value={area} 
              onChange={e => setArea(e.target.value)} 
              placeholder="e.g. Computer Vision, Cryptography"
              className="w-full rounded-2xl border border-border bg-background/40 px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary/40 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Synopsis Manuscript (PDF)</label>
            <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-border bg-background/20 p-8 transition-all hover:bg-background/40 hover:border-primary/50">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                  {file ? file.name : "Drop your synopsis PDF here or click to browse"}
                </span>
                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground/50">Max size 10MB</span>
              </div>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && f.size > 10 * 1024 * 1024) { toast.error("File too large (max 10 MB)"); return; }
                  setFile(f);
                }} 
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => navigate({ to: "/dissertation" })}
              className="rounded-2xl border border-border px-8 py-3.5 text-sm font-bold hover:bg-accent transition-all"
            >
              Discard Draft
            </button>
            <button 
              type="submit" 
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl gradient-primary px-10 py-3.5 text-sm font-bold text-primary-foreground shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Upload className="h-4 w-4" /> {busy ? "Publishing..." : "Submit Topic Proposal"}
            </button>
          </div>
        </form>

        <div className="w-full lg:w-80 space-y-6 animate-in slide-in-from-right duration-700">
           <div className="rounded-[2rem] border border-border bg-primary/5 p-6 space-y-4">
             <Landmark className="h-6 w-6 text-primary" />
             <h4 className="text-sm font-bold uppercase tracking-widest">Next Step</h4>
             <p className="text-xs leading-relaxed text-muted-foreground">
               Once submitted, your **HOD** will review your topic and assign a Faculty Guide. Check the **Timeline** to track the approval status.
             </p>
           </div>
           
           <div className="rounded-[2rem] border border-border p-6 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Guidance</h4>
             <ul className="text-xs space-y-3 list-disc list-inside text-muted-foreground/80">
               <li>Ensure your title is concise.</li>
               <li>Abstract should include goals.</li>
               <li>PDF must be under 10MB.</li>
               <li>Choose your department carefully.</li>
             </ul>
           </div>
        </div>
      </div>
    </>
  );
}
