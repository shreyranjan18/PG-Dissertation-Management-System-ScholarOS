import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ArrowRight, Sparkles, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import apiClient from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ScholarOS" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("scholaros-theme");
    return saved ? saved === "dark" : true;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("scholaros-theme", newTheme ? "dark" : "light");
  };

  const { login: setAuth } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await apiClient.post('/auth/login', { email: email.trim(), password });
      setAuth(res.data.access_token, res.data.user);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error("Sign in failed", { description: err.response?.data?.message || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`grid min-h-screen md:grid-cols-2 transition-colors duration-700 ${isDark ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Info */}
      <div className={`relative hidden md:flex flex-col justify-between overflow-hidden border-r transition-colors duration-700 p-10 ${isDark ? 'border-white/5 bg-[#020617]' : 'border-black/5 bg-white'}`}>
        <Link to="/" className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 15 }} className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <GraduationCap className="h-5 w-5" />
          </motion.div>
          <div className={`font-display text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>ScholarOS</div>
        </Link>

        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/20 bg-primary/5 text-primary'}`}>
            <Sparkles className="h-3.5 w-3.5" /> AI-native Lifecycle
          </div>
          <h2 className={`mt-5 font-display text-4xl font-black leading-[1.1] tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Run every research like a <span className="text-gradient">production system</span>.
          </h2>
          <p className={`mt-4 max-w-md text-sm font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Multi-role workflows, AI-assisted reviews, plagiarism intelligence and analytics — in one elite workspace.
          </p>
        </div>

        <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          © ScholarOS · The Elite Research Suite
        </div>

        {/* Ambient Blobs */}
        <div className={`pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full blur-3xl opacity-20 transition-colors ${isDark ? 'bg-primary' : 'bg-primary/40'}`} />
        <div className={`pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full blur-3xl opacity-10 transition-colors ${isDark ? 'bg-success' : 'bg-success/30'}`} />
      </div>

      {/* Main Login Area */}
      <div className="relative flex items-center justify-center p-6">
        
        {/* Theme Toggle (Absolute) */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/10 bg-white/5 text-amber-400' : 'border-black/10 bg-black/5 text-indigo-600'}`}
        >
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </motion.button>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit} 
          className={`w-full max-w-md rounded-[2.5rem] border p-10 backdrop-blur-3xl transition-all duration-700 ${isDark ? 'border-white/10 bg-white/[0.02] shadow-glow' : 'border-black/10 bg-white shadow-2xl shadow-black/5'}`}
        >
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Sign in</div>
          <h1 className={`mt-2 font-display text-3xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome back</h1>
          <p className={`mt-2 text-sm font-medium transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Enter your credentials to enter the workspace.</p>

          <div className="mt-8 space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required autoComplete="email"
                className={`mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 ${isDark ? 'border-white/5 bg-white/5 text-white' : 'border-black/10 bg-black/5 text-slate-900'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required autoComplete="current-password"
                className={`mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 ${isDark ? 'border-white/5 bg-white/5 text-white' : 'border-black/10 bg-black/5 text-slate-900'}`} />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl gradient-primary px-4 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {busy ? "Authorizing..." : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </motion.button>

            <p className={`text-center text-xs font-bold transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              New researcher? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
