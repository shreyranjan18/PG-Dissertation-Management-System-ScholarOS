import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/StatCard";
import { CheckCheck } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ScholarOS" }] }),
  component: Page,
});

function Page() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => toast.error("Failed to load notifications"));
  }, []);

  const markAllRead = () => {
    // Implement mark all read API if available
  };

  return (
    <>
      <PageHeader
        kicker="Inbox"
        title="Notifications"
        actions={<button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm"><CheckCheck className="h-4 w-4" /> Mark all read</button>}
      />
      <ul className="rounded-2xl border border-border glass divide-y divide-border">
        {notifications.length === 0 && <li className="p-4 text-center text-sm text-muted-foreground">No new notifications.</li>}
        {notifications.map((n, i) => (
          <li key={i} className={`flex items-start gap-4 p-4 hover:bg-accent/30 ${n.is_read ? 'opacity-50' : ''}`}>
            <span className={`mt-1.5 h-2 w-2 rounded-full ${n.is_read ? 'bg-muted' : 'bg-primary'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {!n.is_read && (
              <button onClick={() => {
                apiClient.post(`/notifications/${n.id}/read`).then(() => {
                  setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, is_read: true } : p));
                });
              }} className="text-xs text-primary hover:underline">Mark read</button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
