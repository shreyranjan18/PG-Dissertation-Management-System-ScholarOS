import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { 
  Sparkles, ShieldCheck, BarChart3, ArrowRight, GraduationCap, 
  Rocket, Cpu, CheckCircle2, Lightbulb, PenTool, ClipboardCheck, 
  Users2, ShieldAlert, Moon, Sun, Github, Twitter, Linkedin
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScholarOS — The Elite Research Operating System" },
      { name: "description", content: "Orchestrate your dissertation lifecycle with AI-native precision and cinematic dual-theme clarity." },
    ],
  }),
  component: Landing,
});

const CertIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15L15 18L20 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 11V5C15 3.89543 14.1046 3 13 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("scholaros-theme");
    return saved ? saved === "dark" : true;
  });

  const { scrollYProgress } = useScroll({ target: containerRef });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("scholaros-theme", newTheme ? "dark" : "light");
  };

  return (
    <div ref={containerRef} className={`relative min-h-screen transition-colors duration-1000 font-sans selection:bg-primary/30 overflow-x-hidden ${isDark ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Cinematic Background Elements - Optimized for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isDark ? [0.03, 0.05, 0.03] : [0.01, 0.03, 0.01],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={`absolute h-[30rem] w-[30rem] rounded-full blur-[100px] ${i % 2 === 0 ? 'bg-primary/20' : 'bg-indigo-600/20'}`}
            style={{ top: `${20 + i * 30}%`, left: `${10 + i * 25}%` }}
          />
        ))}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-10' : 'opacity-5'}`} 
             style={{ backgroundImage: `radial-gradient(${isDark ? '#ffffff' : '#000000'} 1px, transparent 0)`, backgroundSize: '60px 60px' }} />
      </div>

      {/* Persistent Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl transition-all duration-700 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white/60 border-black/5'}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ rotate: 180, scale: 1.1 }} className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow transition-all">
              <GraduationCap className="h-5 w-5" />
            </motion.div>
            <span className={`font-display text-2xl font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>ScholarOS</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {['Vision', 'Process', 'Intelligence'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-primary ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item}
                </a>
              ))}
            </div>
            <div className="h-6 w-px bg-border/40 hidden md:block" />
            <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all hover:scale-110 ${isDark ? 'border-white/10 bg-white/5 text-amber-400' : 'border-black/10 bg-black/5 text-indigo-600'}`}>
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link to="/login" className={`hidden md:block text-[10px] font-black uppercase tracking-widest transition-colors hover:text-primary ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Sign In
            </Link>
            <Link to="/register" className="rounded-xl gradient-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 pt-20">
        
        {/* Cinematic Hero */}
        <section id="vision" className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
          <motion.div style={{ opacity, scale }} className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-auto inline-flex items-center gap-3 rounded-full border px-4 py-1.5 transition-all ${isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/5 border-black/10'}`}
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">v2.0 Neural Research Update</span>
            </motion.div>

            <motion.h1 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
              }}
              className={`max-w-5xl mx-auto font-display text-7xl md:text-[10rem] font-black leading-[0.85] tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {"The OS for Elite Researchers.".split(" ").map((word, i) => (
                <motion.span 
                  key={i}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                  className={`inline-block ${word === "OS" ? "text-gradient" : ""}`}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.h1>

            <p className={`mx-auto max-w-2xl text-xl md:text-2xl font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Orchestrate your dissertation lifecycle with AI-native precision. Built for students, 
              supervisors, and departments who demand excellence.
            </p>

            <div className="flex flex-col items-center justify-center gap-6 pt-10 sm:flex-row">
              <MagneticButton className="px-12 py-6 rounded-[2rem] gradient-primary text-lg font-black uppercase tracking-widest text-primary-foreground shadow-glow-lg">
                <Link to="/register">Start Your Journey</Link>
              </MagneticButton>
              <MagneticButton className={`px-12 py-6 rounded-[2rem] border-2 font-black uppercase tracking-widest transition-all ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-slate-900 hover:bg-black/5'}`}>
                <Link to="/login">Access Dashboard</Link>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Interactive Status Floaties */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <FloatingCard isDark={isDark} top="20%" left="10%" delay={0} icon={Cpu} label="AI Processing" status="98%" />
            <FloatingCard isDark={isDark} top="65%" right="12%" delay={1} icon={ShieldCheck} label="IP Secured" status="Verified" />
            <FloatingCard isDark={isDark} bottom="15%" left="15%" delay={2} icon={BarChart3} label="Global Rank" status="#1" />
          </div>
        </section>

        {/* Process Roadmap */}
        <section id="process" className="mx-auto max-w-7xl px-6 py-32">
           <div className="text-center mb-32 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">The Workflow</h2>
              <h3 className={`text-4xl md:text-7xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>The Research Odyssey.</h3>
           </div>
           
           <motion.div 
             variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid grid-cols-1 md:grid-cols-3 gap-10"
           >
              {[
                { icon: Lightbulb, title: "01. Topic Onboarding", text: "Submit your research proposal. AI performs an instant gap-analysis against existing literature to ensure novelty." },
                { icon: GraduationCap, title: "02. Guide Match", text: "Sync with your supervisor. Our neural engine matches you with guides who possess the exact technical expertise for your topic." },
                { icon: Cpu, title: "03. Neural Review", text: "Automated plagiarism scans against 40B+ documents. Get an instant AI Score that predicts supervisor approval readiness." },
                { icon: Users2, title: "04. Supervisor Sync", text: "Submit chapters for real-time review. Supervisor comments are threaded directly into your workspace for instant revisions." },
                { icon: ShieldAlert, title: "05. Final Approval", text: "HOD review and department-wide topic validation. Once approved, your work is locked and ready for the final graduation event." },
                { icon: CertIcon, title: "06. Defense & Graduation", text: "Use AI to generate potential viva questions. Complete your final defense, receive your transcript, and celebrate your academic victory." }
              ].map((step, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <ProcessStep isDark={isDark} {...step} />
                </motion.div>
              ))}
           </motion.div>
        </section>

        {/* Intelligence Bento */}
        <section id="intelligence" className={`py-40 border-y transition-colors ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
           <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-24 space-y-4">
                 <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Intelligence Core</h2>
                 <h3 className={`text-4xl md:text-6xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Engineered for Precision.</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <BentoCard 
                    isDark={isDark}
                    className="md:col-span-2"
                    icon={Cpu}
                    title="The Neural Infrastructure"
                    text="ScholarOS isn't just a dashboard; it's an intelligent core. Our infrastructure handles heavy-duty AI summarization, real-time citation matching, and plagiarism heatmaps."
                 />
                 <BentoCard 
                    isDark={isDark}
                    icon={ShieldCheck}
                    title="Research Sovereignty"
                    text="Your research is your IP. We use military-grade encryption and isolated data environments to ensure privacy."
                 />
                 <BentoCard 
                    isDark={isDark}
                    icon={BarChart3}
                    title="Predictive Analytics"
                    text="Our system analyzes your writing velocity to predict your exact graduation date with surgical precision."
                 />
                 <BentoCard 
                    isDark={isDark}
                    className="md:col-span-2"
                    icon={Users2}
                    title="Global Mentorship Sync"
                    text="Connect with guides from across the globe. Our synchronized bridge handles time-zone management and document annotation."
                 />
              </div>
           </div>
        </section>

        {/* Philosophy Section */}
        <section className={`py-40 transition-colors ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>
           <div className="mx-auto max-w-7xl px-6">
              <div className="grid md:grid-cols-2 gap-24 items-center">
                 <div className="space-y-10">
                    <div className={`p-5 rounded-3xl border inline-block transition-colors ${isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/5 border-primary/10'}`}>
                       <Rocket className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className={`text-6xl font-black leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Built by the Elite.</h3>
                    <p className={`text-2xl font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                       ScholarOS removes the administrative friction, allowing you to focus on your contribution to human knowledge.
                    </p>
                    <ul className="space-y-6">
                       {[
                          "Automated formatting (APA, MLA, Chicago)",
                          "One-click HOD submission protocols",
                          "Real-time plagiarism heatmaps",
                          "Interactive AI-powered peer reviews"
                       ].map((item) => (
                          <motion.li 
                            whileInView={{ x: [0, 10, 0] }}
                            key={item} 
                            className="flex items-center gap-4"
                          >
                             <CheckCircle2 className="h-6 w-6 text-success" />
                             <span className={`text-lg font-bold transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item}</span>
                          </motion.li>
                       ))}
                    </ul>
                 </div>
                 <motion.div 
                    whileHover={{ scale: 1.02, rotateY: -5 }}
                    className={`p-12 rounded-[4rem] border transition-all ${isDark ? 'bg-white/[0.02] border-white/5 shadow-glow' : 'bg-white border-black/5 shadow-2xl shadow-black/5'}`}
                 >
                    <div className="space-y-8">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-full gradient-primary p-0.5"><div className="h-full w-full rounded-full bg-black" /></div>
                          <div>
                             <div className={`text-xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Dr. Sarah Chen</div>
                             <div className="text-xs font-bold text-primary uppercase tracking-widest">Head of Research @ EliteTech</div>
                          </div>
                       </div>
                       <p className={`italic text-2xl font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          "ScholarOS transformed our departmental dissertation flow. The AI analysis isn't a shortcut—it's a high-resolution lens."
                       </p>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-6 py-52 text-center overflow-hidden">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="space-y-12"
           >
              <h2 className={`text-6xl md:text-[12rem] font-black leading-[0.8] tracking-[-0.05em] transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to <br /> Graduate?</h2>
              <p className={`max-w-2xl mx-auto text-2xl font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                 Join the elite circle of researchers who have mastered their dissertation quest.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-6 pt-10">
                 <Link to="/register" className="px-20 py-8 rounded-[2.5rem] gradient-primary text-2xl font-black uppercase tracking-widest text-primary-foreground shadow-glow-lg transition-transform hover:scale-105 active:scale-95">
                    Register Now
                 </Link>
                 <Link to="/login" className={`px-20 py-8 rounded-[2.5rem] border-2 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-slate-900 hover:bg-black/5'}`}>
                    Sign In
                 </Link>
              </div>
           </motion.div>
        </section>
      </main>

      <footer className={`mx-auto max-w-7xl px-6 py-24 border-t transition-colors ${isDark ? 'border-white/10' : 'border-black/10'}`}>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <GraduationCap className={`h-8 w-8 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`} />
                  <span className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>ScholarOS</span>
               </div>
               <p className={`max-w-xs text-sm font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  The definitive operating system for postgraduate research and dissertation excellence.
               </p>
               <div className="flex gap-4">
                  {[Github, Twitter, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className={`p-2 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-500 hover:text-white' : 'border-black/10 text-slate-400 hover:text-slate-900'}`}>
                       <Icon className="h-5 w-5" />
                    </a>
                  ))}
               </div>
            </div>
            <div className="space-y-6">
               <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform</h4>
               <ul className={`space-y-4 text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <li><a href="#" className="hover:text-primary transition-colors">Neural Hub</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Mentorship Network</a></li>
               </ul>
            </div>
            <div className="space-y-6">
               <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Legal</h4>
               <ul className={`space-y-4 text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
               </ul>
            </div>
         </div>
         <div className={`mt-24 pt-8 border-t text-center text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-white/5 text-slate-700' : 'border-black/5 text-slate-300'}`}>
            © 2026 ScholarOS · All Rights Reserved
         </div>
      </footer>
    </div>
  );
}

function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingCard({ top, left, right, bottom, delay, icon: Icon, label, status, isDark }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      style={{ top, left, right, bottom }}
      className={`absolute z-20 p-6 rounded-[2rem] border backdrop-blur-md transition-all ${isDark ? 'bg-white/[0.03] border-white/10 shadow-glow' : 'bg-white border-black/10 shadow-2xl shadow-black/5'}`}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
          <div className={`text-sm font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{status}</div>
        </div>
      </div>
    </motion.div>
  );
}

function ProcessStep({ icon: Icon, title, text, isDark }: { icon: any; title: string; text: string; isDark: boolean }) {
  return (
    <motion.div 
       whileInView={{ opacity: 1, y: 0 }}
       initial={{ opacity: 0, y: 30 }}
       viewport={{ once: true }}
       whileHover={{ y: -10, rotateX: 5, rotateY: -5 }}
       style={{ perspective: 1000 }}
       className={`p-10 rounded-[3.5rem] border transition-all hover:border-primary/40 group ${isDark ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] shadow-glow' : 'border-black/5 bg-white shadow-xl shadow-black/[0.05] hover:shadow-2xl'}`}
    >
       <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-glow-sm">
          <Icon className="h-8 w-8 text-primary" />
       </div>
       <h4 className={`text-2xl font-black mb-4 leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
       <p className={`text-base font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{text}</p>
    </motion.div>
  );
}

function BentoCard({ icon: Icon, title, text, className, extra, isDark }: { icon: any; title: string; text: string; className?: string; extra?: any; isDark?: boolean }) {
  return (
    <motion.div 
       whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
       style={{ perspective: 1000 }}
       className={cn("group p-12 rounded-[4rem] border backdrop-blur-3xl transition-all", isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] shadow-glow' : 'border-black/5 bg-white shadow-2xl shadow-black/5 hover:shadow-black/10', className)}
    >
       <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-10">
          <Icon className="h-7 w-7 text-primary" />
       </div>
       <h4 className={`text-3xl font-black mb-6 tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
       <p className={`text-lg font-medium leading-relaxed transition-colors ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{text}</p>
       {extra}
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
