import { motion } from "framer-motion";
import { Bot, Code2, Gauge, GitBranch, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHandleNavigate } from "@/hooks/HandleNavigate";
import { useAuth } from "@/context/AuthContext";

const featureCards = [
  {
    icon: Bot,
    title: "AI Code Assistant",
    description: "Real-time suggestions, auto-completions and bug explanations powered by AI.",
    iconClass: "icon-glow-purple",
    gradient: "stat-gradient-purple",
  },
  {
    icon: GitBranch,
    title: "GitHub Integration",
    description: "Import, commit and manage repositories directly inside the browser.",
    iconClass: "icon-glow-cyan",
    gradient: "stat-gradient-cyan",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description: "Push to production in seconds with built-in CI/CD pipelines.",
    iconClass: "icon-glow-green",
    gradient: "stat-gradient-green",
  },
  {
    icon: Gauge,
    title: "Live Analytics",
    description: "Track commits, deployments and performance metrics in real-time.",
    iconClass: "icon-glow-amber",
    gradient: "stat-gradient-amber",
  },
];

const steps = [
  { num: "01", title: "Create a Project", desc: "Start from a template or blank canvas in seconds." },
  { num: "02", title: "Write Code with AI", desc: "Let the AI assistant guide you through complex problems." },
  { num: "03", title: "Collaborate & Share", desc: "Invite teammates and iterate together in real time." },
  { num: "04", title: "Deploy Anywhere", desc: "Ship to the cloud with zero configuration required." },
];

export default function DashHome() {
  const navigate = useHandleNavigate();
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 md:px-14 space-y-16 min-h-screen">

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="flex flex-col gap-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-sm text-primary font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          <span>Welcome to your workspace</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-black leading-tight tracking-tight"
        >
          <span className="block text-3xl font-serif sm:text-5xl md:text-6xl">
            Hello, {user?.name ?? "Developer"} 
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl bg-linear-to-br from-purple-600 via-violet-500 to-cyan-400 text-transparent bg-clip-text mt-1">
            CODE SPACE
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-lg text-muted-foreground max-w-xl leading-relaxed"
        >
          The AI-powered developer platform to build, scale and deploy modern
          software — right from your browser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex flex-wrap gap-3"
        >
          <Button size="lg" onClick={() => navigate("dashboard/editor")} className="gap-2">
            <Code2 className="h-4 w-4" /> Open Editor
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate("dashboard")}>
            Go to Dashboard
          </Button>
        </motion.div>
      </section>

      {/* ── FEATURE CARDS ───────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
            >
              <Card
                className={`hover-lift h-full p-5 rounded-2xl border-border/60 ${card.gradient} cursor-default`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${card.iconClass}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 + 0.1, duration: 0.5 }}
              className="flex flex-col gap-3"
            >
              <span className="text-4xl font-black text-primary/20">{step.num}</span>
              <div>
                <p className="font-semibold text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PROGRESS SECTION ─────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Getting Started Checklist
        </h2>
        <Card className="rounded-2xl p-6 space-y-5">
          {[
            { label: "Set up your profile", done: true, pct: 100 },
            { label: "Create your first project", done: true, pct: 100 },
            { label: "Connect GitHub account", done: false, pct: 60 },
            { label: "Deploy a project", done: false, pct: 0 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.done ? "border-primary bg-primary text-white" : "border-border"
                  }`}
              >
                {item.done && (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                  {item.label}
                </p>
                <div className="progress-bar-track mt-1.5">
                  <div className="progress-bar-fill" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{item.pct}%</span>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
