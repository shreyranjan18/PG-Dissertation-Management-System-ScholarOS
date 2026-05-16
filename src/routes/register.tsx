import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/mock";
import { GraduationCap, ArrowRight, Sparkles, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — ScholarOS" }] }),
  component: Register,
});

const DEPARTMENTS = ["CSE", "ECE", "Mech", "Civil", "MBA", "Bio-Tech", "Math", "Physics"];
const SIGNUP_ROLES = ROLES.filter(r => ["student", "faculty", "hod"].includes(r.id));

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
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
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters"); return;
    }
    setBusy(true);

    try {
      const res = await apiClient.post('/auth/register', {
        name: fullName.trim(),
        email: email.trim(),
        password,
        role,
        department,
      });
      setAuth(res.data.access_token, res.data.user);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error("Sign up failed", { description: err.response?.data?.message || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`grid min-h-screen md:grid-cols-2 transition-colors duration-700 ${isDark ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar */}
      <div className={`relative hidden md:flex flex-col justify-between overflow-hidden border-r transition-colors duration-700 p-10 ${isDark ? 'border-white/5 bg-[#020617]' : 'border-black/5 bg-white'}`}>
        <Link to="/" className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 15 }} className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <GraduationCap className="h-5 w-5" />
          </motion.div>
          <div className={`font-display text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>ScholarOS</div>
        </Link>
        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/20 bg-primary/5 text-primary'}`}>
            <Sparkles className="h-3.5 w-3.5" /> Fast Onboarding
          </div>
          <h2 className={`mt-5 font-display text-4xl font-black leading-[1.1] tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Join your department in <span className="text-gradient">under a minute</span>.
          </h2>
          <p className={`mt-4 max-w-md text-sm font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Pick your role, drop in your details, and your dashboard is ready. Admin accounts are provisioned by your institution.
          </p>
        </div>
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          © ScholarOS
        </div>
        <div className={`pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full blur-3xl opacity-20 transition-colors ${isDark ? 'bg-primary' : 'bg-primary/40'}`} />
      </div>

      {/* Form Area */}
      <div className="relative flex items-center justify-center p-6">
        
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
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Create account</div>
          <h1 className={`mt-2 font-display text-3xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Get started</h1>

          <div className="mt-8 space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Role</label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {SIGNUP_ROLES.map(r => (
                  <button type="button" key={r.id} onClick={() => setRole(r.id)}
                    className={`rounded-xl border px-2 py-2.5 text-[10px] font-black uppercase tracking-tighter transition-all ${role === r.id ? "border-primary/60 bg-primary/15 text-primary shadow-glow-sm" : isDark ? "border-white/5 bg-white/5 text-slate-500" : "border-black/5 bg-black/5 text-slate-400"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" value={fullName} onChange={setFullName} required isDark={isDark} />
              <Field label="Email" type="email" value={email} onChange={setEmail} required isDark={isDark} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 ${isDark ? 'border-white/5 bg-white/5 text-white' : 'border-black/10 bg-black/5 text-slate-900'}`}>
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                </select>
              </div>
              <Field
                label={role === "student" ? "Roll number" : "Employee ID"}
                value={identifier}
                onChange={setIdentifier}
                required
                isDark={isDark}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" type="tel" value={phone} onChange={setPhone} isDark={isDark} />
              <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={8} isDark={isDark} />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl gradient-primary px-4 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {busy ? "Registering..." : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </motion.button>

            <p className={`text-center text-xs font-bold transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, minLength, isDark }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; minLength?: number; isDark: boolean;
}) {
  return (
    <div>
      <label className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type} required={required} minLength={minLength}
        className={`mt-2 w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/20 ${isDark ? 'border-white/5 bg-white/5 text-white' : 'border-black/10 bg-black/5 text-slate-900'}`} />
    </div>
  );
}
