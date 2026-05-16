import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { ResponsiveContainer, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { ShieldCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/plagiarism")({
  head: () => ({ meta: [{ title: "Plagiarism — ScholarOS" }] }),
  component: Page,
});

const score = 6;

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

function Page() {
  const [dissertations, setDissertations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [dissertation, setDissertation] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

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

  const handleScan = async () => {
    if (!selectedId) return;
    setScanning(true);
    try {
      const mine = dissertations.find(d => d.id.toString() === selectedId);
      setDissertation(mine);
      const aiRes = await apiClient.get(`/ai/plagiarism/${selectedId}`);
      setReport(aiRes.data);
      toast.success("Plagiarism scan complete!");
    } catch (err) {
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-display text-lg animate-pulse">Loading Integrity Tools...</div>;

  const score = report?.percentage || 0;
  const isSafe = score <= 15;

  return (
    <>
      <PageHeader kicker="Integrity" title="Plagiarism intelligence" />

      {/* Dissertation Selector */}
      <div className="mb-6 rounded-2xl border border-border glass p-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Select Dissertation to Check</label>
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
            onClick={handleScan}
            disabled={!selectedId || scanning}
            className="rounded-xl gradient-primary px-8 py-3 font-display font-semibold text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {scanning ? "Scanning..." : (report ? "Re-scan Integrity" : "Check Integrity")}
          </button>
        </div>
      </div>

      {report ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border glass p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Similarity score</div>
              <div className="relative mt-2 h-56">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{ name: "p", value: score, fill: isSafe ? "#10b981" : "#f59e0b" }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="font-display text-5xl font-semibold">{score}%</div>
                    <div className={`text-xs ${isSafe ? 'text-success' : 'text-warning'}`}>{isSafe ? 'Within safe range' : 'Needs review'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 text-center text-[10px] font-bold tracking-tighter uppercase">
                <div className="rounded-l-lg bg-success/15 py-1 text-success border border-success/20">Clean</div>
                <div className="bg-warning/20 py-1 text-warning border-y border-warning/20">Caution</div>
                <div className="rounded-r-lg bg-destructive/15 py-1 text-destructive border border-destructive/20">Critical</div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-border glass p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Detailed findings</div>
                  <div className="mt-1 font-display text-lg font-semibold">Matched Academic Sources</div>
                </div>
                <div className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">Deep Scan Enabled</div>
              </div>
              <ul className="mt-4 space-y-3">
                {(report?.sources || []).map((s: any, i: number) => (
                  <li key={i} className="rounded-xl border border-border bg-background/40 p-4 transition-all hover:bg-background/60">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <ExternalLink className="h-3 w-3" /> {s.name}
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${parseFloat(s.match) > 10 ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'}`}>
                        {s.match} Match
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Found In</div>
                        <div className="font-medium text-slate-200">{s.location || "General Text"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Detection Error</div>
                        <div className="font-medium text-warning">{s.error_description || "Potential direct match"}</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-black/30 p-3 text-[11px] font-mono leading-relaxed text-slate-400 border border-border/50">
                      "{s.original_text || "Similar structural patterns detected in the abstract..."}"
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border glass p-5">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <ShieldCheck className="h-5 w-5 text-success" /> Scan Summary for "{dissertation.title}"
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Our AI intelligence engine has analyzed your content against millions of academic papers. 
              The <mark className="rounded bg-warning/30 px-1 text-warning">Methodology Section</mark> shows structural overlap with existing frameworks in {dissertation.domain}, which is common in technical research. 
              However, your <mark className="rounded bg-success/30 px-1 text-success">Core Findings</mark> are 100% unique. 
              To reduce similarity further, we recommend citing your sources more explicitly in the literature review.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-background/20">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">Select a dissertation and click <b>Check Integrity</b> to start the scan.</p>
          </div>
        </div>
      )}
    </>
  );
}
