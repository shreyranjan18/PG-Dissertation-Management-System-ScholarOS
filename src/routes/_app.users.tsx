import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/StatCard";
import { UserPlus, Search } from "lucide-react";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Users — ScholarOS" }] }),
  component: Page,
});

const users = [
  { name: "Aarav Sharma", email: "aarav@pgdms.edu", role: "Student", dept: "CSE", status: "Active" },
  { name: "Dr. Neha Patel", email: "neha@pgdms.edu", role: "Faculty", dept: "CSE", status: "Active" },
  { name: "Dr. Rohan Khan", email: "rohan@pgdms.edu", role: "Evaluator", dept: "ECE", status: "Active" },
  { name: "Prof. Meera Iyer", email: "meera@pgdms.edu", role: "HOD", dept: "CSE", status: "Active" },
  { name: "Dr. Linus Park", email: "linus@external.edu", role: "Examiner", dept: "External", status: "Invited" },
  { name: "K. Rao", email: "admin@pgdms.edu", role: "Admin", dept: "Registry", status: "Active" },
];

function Page() {
  return (
    <>
      <PageHeader
        kicker="Administration"
        title="User management"
        actions={<button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"><UserPlus className="h-4 w-4" /> Invite user</button>}
      />
      <div className="rounded-2xl border border-border glass p-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search users…" className="w-full rounded-xl border border-border bg-background/40 pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Department</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className="border-b border-border/60 last:border-0 hover:bg-accent/30">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground">{u.name.split(" ").slice(-2).map(s=>s[0]).join("")}</div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3"><span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{u.role}</span></td>
                  <td className="py-3 pr-3 text-muted-foreground">{u.dept}</td>
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.status === "Active" ? "bg-success/15 text-success" : "bg-warning/20 text-warning"}`}>{u.status}</span>
                  </td>
                  <td className="py-3 pr-3 text-right"><button className="text-xs text-primary hover:underline">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
