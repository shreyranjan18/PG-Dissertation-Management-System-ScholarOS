import * as React from "react";
import { StatCard, PageHeader } from "@/components/dashboard/StatCard";
import { Users, GraduationCap, ShieldCheck, FileText, Filter, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { departmentSplit, facultyWorkload, recentDissertations, submissionTrend } from "@/lib/mock";
import apiClient from "@/lib/apiClient";

const COLORS = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)","var(--color-chart-5)"];

export function AdminDashboard() {
  const [stats, setStats] = React.useState({
    total_students: 0,
    total_faculty: 0,
    dissertations_in_review: 0,
    avg_plagiarism: 0,
  });

  React.useEffect(() => {
    apiClient.get('/dashboard/admin').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <PageHeader
        kicker="Administration"
        title="Department command center"
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm hover:bg-accent">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              <Download className="h-4 w-4" /> Export report
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={String(stats.total_students)} delta={0} icon={GraduationCap} />
        <StatCard label="Faculty guides" value={String(stats.total_faculty)} delta={0} icon={Users} tone="success" />
        <StatCard label="Dissertations in review" value={String(stats.dissertations_in_review)} delta={0} icon={FileText} tone="warning" />
        <StatCard label="Avg plagiarism" value={`${stats.avg_plagiarism}%`} delta={0} icon={ShieldCheck} tone="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border glass p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Submissions vs approvals</div>
              <div className="mt-1 font-display text-lg font-semibold">Monthly throughput</div>
            </div>
            <div className="text-xs text-muted-foreground">Last 8 months</div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={submissionTrend} barCategoryGap={20}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="submitted" fill="var(--color-primary)" radius={[8,8,0,0]} />
                <Bar dataKey="approved" fill="var(--color-success)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border glass p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Department mix</div>
          <div className="mt-1 font-display text-lg font-semibold">Active dissertations</div>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={departmentSplit} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" stroke="var(--color-background)" strokeWidth={3}>
                  {departmentSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border glass p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Faculty workload</div>
          <div className="mt-1 font-display text-lg font-semibold">Active guidances</div>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <BarChart data={facultyWorkload} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="load" fill="var(--color-primary)" radius={[0,8,8,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border glass p-5">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg font-semibold">Recent dissertations</div>
            <button className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Student</th>
                  <th className="py-2 pr-3">Dept</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Progress</th>
                  <th className="py-2 pr-3">Plag</th>
                </tr>
              </thead>
              <tbody>
                {recentDissertations.map(d => (
                  <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-accent/30">
                    <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{d.id}</td>
                    <td className="py-3 pr-3 max-w-[260px] truncate font-medium">{d.title}</td>
                    <td className="py-3 pr-3">{d.student}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{d.dept}</td>
                    <td className="py-3 pr-3">
                      <StatusPill v={d.status} />
                    </td>
                    <td className="py-3 pr-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full gradient-primary" style={{ width: `${d.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{d.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${d.plag <= 7 ? "bg-success/15 text-success" : d.plag <= 12 ? "bg-warning/20 text-warning" : "bg-destructive/15 text-destructive"}`}>{d.plag}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusPill({ v }: { v: string }) {
  const tone = v === "Approved" ? "bg-success/15 text-success" : v === "Revisions" ? "bg-warning/20 text-warning" : v === "Submitted" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{v}</span>;
}
