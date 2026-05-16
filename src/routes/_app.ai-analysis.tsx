import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Sparkles, BookOpen, Quote, Wand2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/ai-analysis")({
  head: () => ({ meta: [{ title: "AI Analysis — ScholarOS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const [dissertations, setDissertations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [dissertation, setDissertation] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/dissertations');
        setDissertations(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedId) return;
    setAnalyzing(true);
    try {
      const mine = dissertations.find(d => d.id.toString() === selectedId);
      setDissertation(mine);
      const aiRes = await apiClient.get(`/ai/summary/${selectedId}`);
      setAnalysis(aiRes.data);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (sug: any) => {
    try {
      const res = await apiClient.post(`/ai/apply/${dissertation.id}`, {
        target_field: sug.target_field,
        new_value: sug.new_value
      });
      setDissertation(res.data.dissertation);
      toast.success(`Applied: ${sug.type} updated!`);
    } catch (err) {
      toast.error("Failed to apply suggestion.");
    }
  };

  const [chat, setChat] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  const sendCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    const userMsg = { sender_id: user?.id, content: msg };
    setChat(prev => [...prev, userMsg]);
    setMsg("");

    try {
      await apiClient.post('/chat', { content: msg, receiver_id: 0 });
      setTimeout(async () => {
        const refresh = await apiClient.get('/chat?contact_id=0');
        setChat(refresh.data);
      }, 1500);
    } catch (e) { 
      toast.error("Failed to reach AI");
    }
  };

  useEffect(() => {
    const loadChat = async () => {
      try {
        const res = await apiClient.get('/chat?contact_id=0');
        if (res.data.length > 0) setChat(res.data);
      } catch (e) { console.error(e); }
    };
    loadChat();
    const interval = setInterval(loadChat, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center font-display text-lg animate-pulse">Initializing ScholarOS AI...</div>;

  return (
    <>
      <PageHeader kicker="Intelligence" title="AI dissertation analysis" />

      {/* Dissertation Selector */}
      <div className="mb-6 rounded-2xl border border-border glass p-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Select Dissertation to Analyze</label>
            <select 
              value={selectedId} 
              onChange={e => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select a dissertation...</option>
              {dissertations.map(d => (
                <option key={d.id} value={d.id}>{d.title} ({d.domain})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={!selectedId || analyzing}
            className="rounded-xl gradient-primary px-8 py-3 font-display font-semibold text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : (analysis ? "Re-run Analysis" : "Apply Analysis")}
          </button>
        </div>
      </div>

      {dissertation ? (
        <div className="grid gap-4 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border glass p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                  <BookOpen className="h-3.5 w-3.5" /> AI Summary
                </div>
                {analysis && (
                  <button onClick={handleAnalyze} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <Wand2 className="h-3 w-3" /> Refresh Metrics
                  </button>
                )}
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold">"{dissertation.title}"</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {analysis?.summary || "Click Apply Analysis to generate insights..."}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { l: "Originality", v: 92 },
                  { l: "Clarity", v: 78 },
                  { l: "Methodology", v: 88 },
                ].map(s => (
                  <div key={s.l} className="rounded-xl border border-border bg-background/40 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                    <div className="mt-1 font-display text-2xl font-semibold">{s.v}<span className="text-sm text-muted-foreground">/100</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full gradient-primary" style={{ width: `${s.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border glass p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary"><Wand2 className="h-3.5 w-3.5" /> Smart suggestions</div>
                <button className="text-xs text-primary hover:underline">Apply all ({analysis?.suggestions?.length || 0})</button>
              </div>
              <ul className="mt-4 space-y-3">
                {(analysis?.suggestions || []).map((s: any, i: number) => (
                  <li key={i} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider">
                      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-primary">{s.type}</span>
                      <span className="text-muted-foreground">{Math.round(s.confidence * 100)}% confidence</span>
                    </div>
                    <p className="mt-2 text-sm">{s.text}</p>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => handleApplySuggestion(s)}
                        className="rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md hover:shadow-primary/20 transition-all active:scale-95"
                      >
                        Apply Suggestion
                      </button>
                      <button className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs transition-all hover:bg-muted">Dismiss</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border glass p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary"><Quote className="h-3.5 w-3.5" /> Citation suggestions</div>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  `Smith et al. (2024) — Recent Advances in ${dissertation.domain}`,
                  `Doe & Lee (2023) — Foundations of ${dissertation.domain}`,
                  `Journal of Academic Research — Special Issue on ${dissertation.department}`,
                ].map((c, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5">
                    <span>{c}</span>
                    <button className="text-xs text-primary hover:underline">Insert</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="rounded-2xl border border-border glass p-5 flex flex-col h-[640px]">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-lg"><Sparkles className="h-4 w-4" /></div>
              <div>
                <div className="font-display font-semibold">ScholarOS Copilot</div>
                <div className="text-xs text-success">● Online · AI-grade</div>
              </div>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto scrollbar-thin pr-1">
              <Bubble who="ai">Hi {user?.name?.split(' ')[0]} — I've reviewed your dissertation on "{dissertation.title}". How can I help you refine it today?</Bubble>
              {chat.map((c, i) => (
                <Bubble key={i} who={c.sender_id === 0 ? "ai" : "me"}>{c.content}</Bubble>
              ))}
            </div>

            <form onSubmit={sendCopilot} className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/40 p-2 shadow-inner">
              <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ask Copilot…" className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70" />
              <button type="submit" className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground shadow-sm hover:shadow-primary/20 transition-all active:scale-95"><Send className="h-4 w-4" /></button>
            </form>
          </aside>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-background/20">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
              <Wand2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">Select a dissertation and click <b>Apply Analysis</b> to unlock AI insights.</p>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ who, children }: { who: "me" | "ai"; children: React.ReactNode }) {
  const me = who === "me";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm transition-all duration-300 ${
        me 
          ? "gradient-primary text-primary-foreground rounded-tr-none" 
          : "bg-slate-800/80 text-slate-100 border border-slate-700 rounded-tl-none"
      }`}>
        {children}
      </div>
    </div>
  );
}
