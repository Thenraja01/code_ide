import { motion } from "framer-motion";
import { Bot, Code2, Gauge, GitBranch, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHandleNavigate } from "../utils/CustomFunction/HandleNavigate";
import { useAuth } from "../utils/Context/AuthContext";

const featureCards = [
  {
    icon: Bot,
    title: "AI Code Assistant",
    description: "Real-time suggestions and intelligent debugging powered by AI.",
  },
  {
    icon: GitBranch,
    title: "GitHub Integration",
    description: "Manage repositories and commits directly in your workspace.",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description: "Deploy instantly with built-in CI/CD pipelines.",
  },
  {
    icon: Gauge,
    title: "Live Analytics",
    description: "Monitor performance and activity in real-time.",
  },
];

const steps = [
  { num: "01", title: "Create a Project", desc: "Start instantly with templates or blank canvas." },
  { num: "02", title: "Code with AI", desc: "Accelerate development with smart suggestions." },
  { num: "03", title: "Collaborate", desc: "Work with your team in real-time." },
  { num: "04", title: "Deploy", desc: "Ship your product globally in seconds." },
];

export default function DashHome() {
  const navigate = useHandleNavigate();
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-20 bg-background min-h-screen">

      {/* HERO */}
      <section className="max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider"
        >
          <Sparkles className="h-4 w-4" />
          Workspace
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold leading-tight"
        >
          <span className="block text-3xl md:text-5xl">
            Welcome back, {user?.name ?? "Developer"}
          </span>

          <span className="block text-4xl md:text-6xl bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-400 text-transparent bg-clip-text mt-2">
            CodeSpace Dashboard
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl"
        >
          Build, collaborate and deploy modern applications faster with your AI-powered development environment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <Button size="lg" onClick={() => navigate("dashboard/editor")} className="gap-2">
            <Code2 className="h-4 w-4" />
            Open Editor
          </Button>

          <Button size="lg" variant="outline" onClick={() => navigate("dashboard/projects")}>
            View Projects
          </Button>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Features
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-5 rounded-2xl border bg-white/5 backdrop-blur-md hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {card.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Workflow
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <span className="text-3xl font-bold text-primary/20">{step.num}</span>
              <p className="font-medium text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Setup Progress
        </h2>

        <Card className="p-6 rounded-2xl space-y-5 bg-white/5 backdrop-blur-md">
          {[
            { label: "Profile setup", pct: 100 },
            { label: "First project", pct: 100 },
            { label: "GitHub connected", pct: 60 },
            { label: "Deployment", pct: 20 },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.pct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}