import * as React from "react";
import { StatCard, PageHeader } from "@/components/dashboard/StatCard";
import { useAuth } from "@/lib/auth";
import { Users, ClipboardCheck, UserPlus, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { 
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, 
  Bar, BarChart, Pie, PieChart, Cell 
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function HODDashboard() {
  const { user } = useAuth();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [assignments, setAssignments] = React.useState<Record<number, string>>({});

  const loadData = React.useCallback(async () => {
    try {
      const res = await apiClient.get('/dashboard/hod');
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load department data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (dissertationId: number) => {
    const guideId = assignments[dissertationId];
    if (!guideId) {
      toast.error("Please select a faculty member first");
      return;
    }

    try {
      await apiClient.post(`/dissertations/${dissertationId}/assign-guide`, { guide_id: guideId });
      toast.success("Topic approved and Guide assigned!");
      loadData(); // Refresh list
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  const researchData = [
    { name: 'AI/ML', value: 400 },
    { name: 'Cyber', value: 300 },
    { name: 'IOT', value: 300 },
    { name: 'Cloud', value: 200 },
  ];

  if (loading) return <div className="p-8 text-center animate-pulse">Syncing Department Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border glass p-8 md:p-10">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2 opacity-80">Department Oversight</div>
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
               {user?.name.split(' ')[0]}'s HOD Suite
            </h1>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Managing <span className="text-primary font-bold">{data?.total_students} researchers</span> across <span className="text-primary font-bold">{data?.total_faculty} faculty</span> leads.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="h-12 px-6 rounded-2xl gradient-primary text-white font-bold text-sm shadow-glow transition-transform hover:scale-105 active:scale-95">
                Department Report
             </button>
             <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-border glass hover:bg-accent transition-all">
                <RefreshCw className="h-5 w-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={String(data?.total_students || 0)} delta={12} icon={Users} />
        <StatCard label="Total Faculty" value={String(data?.total_faculty || 0)} delta={2} icon={Users} tone="success" />
        <StatCard label="Pending Topics" value={String(data?.unassigned_topics || 0)} delta={-5} icon={ShieldAlert} tone="warning" />
        <StatCard label="Dept. Health" value="Stable" icon={CheckCircle} tone="success" sub="98% Approval Rate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2.5rem] border border-border glass p-8">
           <h3 className="text-lg font-bold mb-6">Research Distribution</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={researchData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {researchData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{background: '#0f0f0f', border: '1px solid var(--color-border)', borderRadius: '12px'}} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-4 grid grid-cols-2 gap-2">
              {researchData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase">
                    <div className="h-2 w-2 rounded-full" style={{background: COLORS[i]}} />
                    {d.name}
                 </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-2 rounded-[2.5rem] border border-border glass p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <UserPlus className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Topic Approval & Mentorship Assignment</h3>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">
                  <th className="pb-6">Thesis Topic</th>
                  <th className="pb-6">Researcher</th>
                  <th className="pb-6">Assign Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data?.pending_proposals?.length > 0 ? (
                  data.pending_proposals.map((p: any) => (
                    <tr key={p.id} className="group transition-colors">
                      <td className="py-6 pr-4">
                        <div className="text-xs font-bold text-primary uppercase tracking-tighter mb-1 opacity-70">{p.research_area || 'General'}</div>
                        <div className="font-semibold text-sm max-w-xs truncate group-hover:text-primary transition-colors">{p.title}</div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl border border-border bg-background grid place-items-center text-[10px] font-bold">
                              {p.student?.name?.charAt(0) || 'S'}
                           </div>
                           <div className="text-sm font-medium">{p.student?.name || "Unknown"}</div>
                        </div>
                      </td>
                      <td className="py-6 pl-4">
                        <div className="flex items-center justify-end gap-3">
                          <select 
                            className="bg-card/40 border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]"
                            value={assignments[p.id] || ""}
                            onChange={(e) => setAssignments({ ...assignments, [p.id]: e.target.value })}
                          >
                            <option value="">Select Faculty...</option>
                            {data.faculty_list?.map((f: any) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleAssign(p.id)}
                            className="h-10 px-5 rounded-xl gradient-primary text-white text-[10px] font-black uppercase tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all"
                          >
                            Confirm
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-20 text-center opacity-30 italic text-xs">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-10" />
                      Department is up-to-date. All research tracks are mentored.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
