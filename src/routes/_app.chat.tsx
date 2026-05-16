import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { Send, Paperclip, Phone, Video, Search, User as UserIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "Chat — ScholarOS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadContacts = async () => {
    try {
      const res = await apiClient.get('/chat');
      setContacts(res.data);
    } catch (e) { console.error(e); }
  };

  const loadMessages = async () => {
    if (!active) return;
    try {
      const res = await apiClient.get(`/chat?contact_id=${active.id}`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadContacts(); }, []);
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000); // Poll every 4s
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy || !active) return;
    setBusy(true);
    try {
      await apiClient.post('/chat', { receiver_id: active.id, content: text });
      setText("");
      loadMessages();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr] h-[calc(100vh-9rem)]">
      <aside className="rounded-2xl border border-border glass p-3 overflow-hidden flex flex-col">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search contacts…" className="w-full rounded-xl border border-border bg-background/40 pl-10 pr-3 py-2 text-sm outline-none" />
        </div>
        <ul className="mt-3 space-y-1 overflow-y-auto scrollbar-thin">
          <li>
            <button onClick={() => setActive({ id: 0, name: "ScholarOS AI", role: "AI Assistant" })} className={`w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 ${active?.id === 0 ? "bg-accent" : "hover:bg-accent/60"}`}>
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">ScholarOS AI</div>
                <div className="text-xs text-success truncate">Online · Copilot</div>
              </div>
            </button>
          </li>
          {contacts.filter(c => c.id !== 0).map(c => (
            <li key={c.id}>
              <button onClick={() => setActive(c)} className={`w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 ${active?.id === c.id ? "bg-accent" : "hover:bg-accent/60"}`}>
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-xs font-bold">
                    {c.name.split(" ").map((s:any)=>s[0]).join("")}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{c.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate capitalize">{c.role}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="rounded-2xl border border-border glass flex flex-col overflow-hidden">
        {active ? (
          <>
            <header className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-xs font-bold text-primary-foreground">
                  {active.name.split(" ").map((s:any)=>s[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold">{active.name}</div>
                  <div className="text-xs text-success">● Online · {active.role}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent"><Phone className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent"><Video className="h-4 w-4" /></button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-xs">No conversation history.</div>
              ) : (
                messages.map((m: any, i) => {
                  const sId = m.sender_id ?? m.senderId;
                  const isMe = String(sId) === String(user?.id);
                  const msgContent = m.content ?? m.message ?? m.text ?? m['content'];
                  const displayContent = msgContent || (m.id ? `[Ref #${m.id}]` : "...");
                  
                  return (
                    <div key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div 
                         className={cn("max-w-[80%] min-w-[80px] px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl", 
                             isMe ? "bg-primary text-white rounded-tr-none" : "bg-slate-800 text-white border border-slate-700 rounded-tl-none")
                         }
                         style={{ color: 'white' }}
                      >
                         {displayContent}
                      </div>
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-2 px-2 opacity-50">
                          {new Date(m.created_at || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <footer className="border-t border-border p-3">
              <form onSubmit={send} className="flex items-center gap-2 rounded-xl border border-border bg-background/40 p-2">
                <button type="button" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-accent"><Paperclip className="h-4 w-4 text-muted-foreground" /></button>
                <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…" className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70" />
                <button type="submit" disabled={busy} className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-white disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-center p-8">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-semibold">Your Messages</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">Select a contact from the left to start a conversation or ask your guide for feedback.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Bubble({ who, children }: { who: "me" | "them"; children: React.ReactNode }) {
  const me = who === "me";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div className={cn(
        "max-w-[70%] min-w-[80px] rounded-2xl px-5 py-2.5 text-sm font-medium shadow-sm",
        me ? "gradient-primary text-white" : "border border-border bg-slate-800 text-white"
      )}>
        {children}
      </div>
    </div>
  );
}
