import { documentation } from "./Documentation.js";
import {
  BookOpen,
  Sparkles,
  Code2,
  Palette,
  Shield,
  Rocket,
  HelpCircle,
  Layout,
  Check
} from "lucide-react";
import { motion } from "framer-motion";



const iconMap: Record<string, any> = {
  introduction: BookOpen,
  features: Sparkles,
  languages: Code2,
  "getting-started": Rocket,
  editor: Layout,
  ai: Sparkles,
  themes: Palette,
  security: Shield,
  faq: HelpCircle,
  roadmap: Rocket
};



const IconList = ({ items }: { items: string[] }) => (
  <div className="space-y-3 mt-4">
    {items.map((item, i) => (
      <div key={i} className="flex gap-3">
        <Check className="text-primary mt-1" size={18} />
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const CardList = ({ items }: { items: string[] }) => (
  <div className="grid sm:grid-cols-2 gap-3 mt-4">
    {items.map((item, i) => (
      <div
        key={i}
        className="rounded-lg border border-border bg-muted/40 px-4 py-3 transition hover:bg-accent/10"
      >
        {item}
      </div>
    ))}
  </div>
);

const StepList = ({ steps }: { steps: string[] }) => (
  <div className="space-y-4 mt-4">
    {steps.map((step, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
          {i + 1}
        </div>
        <p>{step}</p>
      </div>
    ))}
  </div>
);

const BorderList = ({ items }: { items: string[] }) => (
  <div className="space-y-3 mt-4">
    {items.map((item, i) => (
      <div
        key={i}
        className="border-l-2 border-primary pl-4 text-foreground"
      >
        {item}
      </div>
    ))}
  </div>
);


export default function Docs() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ---------------- HERO ---------------- */}
      <div className="bg-primary-pattern border-b border-border">
        <div className="text-start mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            {documentation.title}
          </h1>
          <p className="mt-4 p-2 xt-muted-foreground max-w-2xl">
            {documentation.description}
          </p>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {documentation.sections.map((section, index) => {
          const Icon = iconMap[section.id] ?? BookOpen;

          return (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="bg-card border border-border rounded-xl p-8"
            >
              {/* Header */}
              <div className="flex gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon size={22} />
                </div>
                <h2 className="text-2xl font-semibold">
                  {section.title}
                </h2>
              </div>

              {/* Description */}
              {"description" in section && section.description && (
                <p className="text-muted-foreground mb-4">
                  {section.description}
                </p>
              )}

              {/* String Content */}
              {typeof section.content === "string" && (
                <p className="text-muted-foreground">
                  {section.content}
                </p>
              )}

              {/* Object Content (Editor Overview) */}
              {typeof section.content === "object" && (
                <div className="mt-4 space-y-2">
                  {Object.entries(section.content).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* FEATURES */}
              {section.id === "features" && section.items && (
                <IconList items={section.items} />
              )}

              {/* LANGUAGES */}
              {section.id === "languages" && section.items && (
                <CardList items={section.items} />
              )}

              {/* GETTING STARTED */}
              {section.id === "getting-started" && section.steps && (
                <StepList steps={section.steps} />
              )}

              {/* SECURITY */}
              {section.id === "security" && section.items && (
                <BorderList items={section.items} />
              )}

              {/* ROADMAP */}
              {section.id === "roadmap" && section.items && (
                <CardList items={section.items} />
              )}

              {/* AI EXAMPLES */}
              {section.examples && (
                <div className="mt-4 space-y-2">
                  {section.examples.map((ex, i) => (
                    <code
                      key={i}
                      className="block bg-muted p-3 rounded-md text-sm"
                    >
                      {ex}
                    </code>
                  ))}
                </div>
              )}

              {/* THEMES */}
              {section.themes && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {section.themes.map((theme) => (
                    <span
                      key={theme}
                      className="px-3 py-1 text-sm rounded-full bg-secondary"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {section.tokens && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {section.tokens.map((token) => (
                    <span
                      key={token}
                      className="px-3 py-1 text-xs rounded-md border border-border"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              )}

              {/* FAQ */}
              {section.questions && (
                <div className="mt-6 space-y-4">
                  {section.questions.map((q, i) => (
                    <div key={i}>
                      <p className="font-medium">{q.q}</p>
                      <p className="text-muted-foreground">{q.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
