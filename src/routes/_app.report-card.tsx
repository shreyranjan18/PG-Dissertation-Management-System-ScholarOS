import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { 
  FileText, GraduationCap, Award, CheckCircle2, 
  BarChart3, User, ShieldCheck, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/report-card")({
  head: () => ({ meta: [{ title: "My Report Card — ScholarOS" }] }),
  component: ReportCard,
});

function ReportCard() {
  const { user } = useAuth();
  const [dissertations, setDissertations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dissertations')
      .then(res => setDissertations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-display">Generating Transcript...</div>;

  return (
    <>
      <PageHeader 
        kicker="Academic Record" 
        title="Dissertation Report Card" 
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm hover:bg-accent transition-all">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        }
      />

      <div className="mb-10 grid gap-6 md:grid-cols-3">
         <div className="rounded-[2rem] border border-border glass p-8 text-center relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Overall GPA</div>
            <div className="text-5xl font-display font-bold text-primary">
               {dissertations.length > 0 
                  ? (dissertations.reduce((acc, d) => acc + (d.total_marks || 0), 0) / (dissertations.length * 10)).toFixed(2) 
                  : '0.00'}
            </div>
            <div className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Scale: 10.0</div>
            <BarChart3 className="absolute -right-4 -bottom-4 h-20 w-20 opacity-5 text-primary" />
         </div>
         <div className="rounded-[2rem] border border-border glass p-8 text-center relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Units Cleared</div>
            <div className="text-5xl font-display font-bold text-success">
               {dissertations.filter(d => d.status === 'completed').length} / 4
            </div>
            <div className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Core Research Units</div>
            <GraduationCap className="absolute -right-4 -bottom-4 h-20 w-20 opacity-5 text-success" />
         </div>
         <div className="rounded-[2rem] border border-border glass p-8 text-center relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Academic Standing</div>
            <div className="text-xl font-display font-bold mt-3">
               {dissertations.filter(d => d.status === 'completed').length >= 4 ? 'Eligible for Degree' : 'In Progress'}
            </div>
            <div className="text-[10px] text-muted-foreground mt-4 uppercase font-bold">Verification Status</div>
            <ShieldCheck className="absolute -right-4 -bottom-4 h-20 w-20 opacity-5 text-muted-foreground" />
         </div>
      </div>

      <div className="space-y-8">
        {dissertations.length === 0 ? (
          <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed border-border bg-background/20">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No dissertation records found.</p>
          </div>
        ) : (
          dissertations.map(d => (
            <div key={d.id} className="rounded-[3rem] border border-border glass overflow-hidden bg-card/40">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Official Transcript
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">{d.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> Mentor: {d.guide?.name || 'N/A'}</span>
                       <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Dept: {d.department}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center p-8 rounded-[2rem] bg-primary/10 border border-primary/20 min-w-[200px]">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Final Grade</div>
                    <div className="text-6xl font-display font-bold text-primary">
                      {d.total_marks !== null ? d.total_marks : '--'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-medium">Weighted Average</div>
                  </div>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                   <GradeSlot label="Guide Assessment" value={d.guide_marks} sub="Technical & Process" />
                   <GradeSlot label="HOD Review" value={d.hod_marks} sub="Departmental Compliance" />
                   <GradeSlot label="Viva Examiner" value={d.examiner_marks} sub="Online Viva Voce" />
                </div>

                <div className="mt-12 p-8 rounded-3xl border border-border bg-background/20 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-success/10 text-success grid place-items-center"><CheckCircle2 className="h-6 w-6" /></div>
                      <div>
                         <div className="font-bold text-lg">Official Status</div>
                         <div className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                            {d.status === 'completed' ? 'Successfully Graduated' : 'Assessment in Progress'}
                         </div>
                      </div>
                   </div>
                   <div className="text-right text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                      This is an electronically generated report.<br />
                      Verified by the PG Dissertation Committee.
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function GradeSlot({ label, value, sub }: { label: string; value: number | null; sub: string }) {
  return (
    <div className="p-6 rounded-3xl border border-border bg-background/40 relative group transition-all hover:border-primary/30">
       <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">{label}</div>
       <div className="flex items-end gap-2">
          <div className="text-4xl font-display font-bold">
             {value !== null ? value : '--'}
          </div>
          <div className="text-sm text-muted-foreground mb-1">/ 100</div>
       </div>
       <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
       <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-all">
          <Award className="h-10 w-10" />
       </div>
    </div>
  );
}
