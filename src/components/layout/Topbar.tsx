import * as React from "react";
import { Bell, Search, Sun, Moon, ChevronDown, Menu, Sparkles, LogOut, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [openNotif, setOpenNotif] = React.useState(false);
  const [openMenuU, setOpenMenuU] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      if (response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds for faster testing
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notification: any) => {
    try {
      await apiClient.post(`/notifications/${notification.id}/read`);
      fetchNotifications();
      if (notification.link) {
        setOpenNotif(false);
        navigate({ to: notification.link as any });
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass-strong px-4 md:px-6">
      <button onClick={onMenu} className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-border bg-card">
        <Menu className="h-4 w-4" />
      </button>

      <div className="relative hidden md:flex flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search dissertations, students, citations…"
          className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-24 py-2.5 text-sm placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/50"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button 
          onClick={() => navigate({ to: "/chat" as any })}
          className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Ask AI
        </button>

        <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card/60 hover:text-primary" aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button onClick={() => { setOpenNotif(v => !v); setOpenMenuU(false); }} className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card/60">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border glass-strong p-2 shadow-glow animate-float-up max-h-[400px] overflow-y-auto">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="text-primary capitalize">{unreadCount} New</span>}
              </div>
              <ul className="space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground italic">No new alerts</div>
                ) : notifications.map(n => (
                  <li 
                    key={n.id} 
                    onClick={() => markAsRead(n)}
                    className={cn("flex flex-col gap-1 rounded-xl px-3 py-2 cursor-pointer transition-colors hover:bg-accent/60", !n.is_read && "bg-primary/5")}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full shadow-sm", 
                        n.type === 'approval' ? 'bg-success' : 
                        n.type === 'chat' ? 'bg-primary' : 
                        n.type === 'dissertation' ? 'bg-info' : 'bg-warning'
                      )} />
                      <div className="text-sm font-medium">{n.title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                    <div className="text-[9px] text-muted-foreground/60 text-right uppercase tracking-tighter">
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setOpenMenuU(v => !v); setOpenNotif(false); }} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-2 py-1.5 pr-3">
            <div className="grid h-7 w-7 place-items-center rounded-lg gradient-primary text-[11px] font-bold text-primary-foreground uppercase">{user?.name?.substring(0,2)}</div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user?.role}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {openMenuU && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border glass-strong p-2 shadow-glow animate-float-up">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-[11px] text-muted-foreground">{user?.email}</div>
                {user?.department && <div className="mt-0.5 text-[11px] text-muted-foreground">{user.department}</div>}
              </div>
              <div className="my-1 h-px bg-border" />
              <button onClick={() => { setOpenMenuU(false); navigate({ to: "/settings" }); }}
                className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-accent/60")}>
                <User className="h-4 w-4" /> Profile & settings
              </button>
              <button onClick={async () => { setOpenMenuU(false); await logout(); navigate({ to: "/login" }); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
