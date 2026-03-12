import { Github, Plus, Rocket, Upload } from "lucide-react";
import { useHandleNavigate } from "@/layers_UI/utils/CustomFunction/HandleNavigate";

interface Action {
    icon: React.ElementType;
    title: string;
    description: string;
    iconClass: string;
    onClick?: () => void;
}

export default function QuickActions() {
    const navigate = useHandleNavigate();

    const actions: Action[] = [
        {
            icon: Plus,
            title: "New Playground",
            description: "Start coding instantly with AI assistance",
            iconClass: "icon-glow-purple",
            onClick: () => navigate("dashboard/editor"),
        },
        {
            icon: Github,
            title: "Import from GitHub",
            description: "Clone and edit repositories directly",
            iconClass: "icon-glow-cyan",
        },
        {
            icon: Rocket,
            title: "Deploy Project",
            description: "One-click deployment to production",
            iconClass: "icon-glow-green",
        },
        {
            icon: Upload,
            title: "Upload Files",
            description: "Drag and drop files to your workspace",
            iconClass: "icon-glow-amber",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={action.onClick}
                    className="hover-lift fade-in-up text-left flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-colors cursor-pointer w-full"
                    style={{ animationDelay: `${i * 0.08}s` }}
                >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${action.iconClass}`}>
                        <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
