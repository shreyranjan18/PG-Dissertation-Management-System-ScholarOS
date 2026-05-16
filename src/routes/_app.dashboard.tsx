import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { StudentDashboard } from "@/components/dashboard/views/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/views/AdminDashboard";
import { HODDashboard } from "@/components/dashboard/views/HODDashboard";
import { GenericRoleDashboard } from "@/components/dashboard/views/GenericRoleDashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ScholarOS" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "student") return <StudentDashboard />;
  if (user.role === "hod") return <HODDashboard />;
  return <GenericRoleDashboard />;
}
