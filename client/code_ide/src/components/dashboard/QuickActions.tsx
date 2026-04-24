import { Github, Plus, Rocket, Upload } from "lucide-react";
import { useHandleNavigate } from "@/hooks/HandleNavigate";

interface Action {
  icon: React.ElementType;
  title: string;
  description: string;
  iconClass: string;
  onClick: () => void;
}

export default function QuickActions() {
  const navigate = useHandleNavigate();

  const handleNewProject = () => {
    navigate("/dashboard/project");
  };

  const handleImportGithub = () => {
    // TODO: open GitHub import modal or route
    navigate("/dashboard/github-import");
  };

  const handleDeploy = () => {
    // TODO: connect deployment pipeline (Vercel/Netlify/Inngest)
    navigate("/dashboard/deploy");
  };

  const handleUpload = () => {
    // TODO: file upload modal / drag-drop handler
    navigate("/dashboard/upload");
  };

  const actions: Action[] = [
    {
      icon: Plus,
      title: "New Playground",
      description: "Start coding instantly with AI assistance",
      iconClass: "icon-glow-purple",
      onClick: handleNewProject,
    },
    {
      icon: Github,
      title: "Import from GitHub",
      description: "Clone and edit repositories directly",
      iconClass: "icon-glow-cyan",
      onClick: handleImportGithub,
    },
    {
      icon: Rocket,
      title: "Deploy Project",
      description: "One-click deployment to production",
      iconClass: "icon-glow-green",
      onClick: handleDeploy,
    },
    {
      icon: Upload,
      title: "Upload Files",
      description: "Drag and drop files to your workspace",
      iconClass: "icon-glow-amber",
      onClick: handleUpload,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((action, i) => (
        <button
          key={action.title}
          onClick={action.onClick}
          className="hover-lift fade-in-up text-left flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-colors cursor-pointer w-full"
          style={{ animationDelay: `${i * 0.08}s` }}
          type="button"
        >
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${action.iconClass}`}
          >
            <action.icon className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-sm">{action.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {action.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
