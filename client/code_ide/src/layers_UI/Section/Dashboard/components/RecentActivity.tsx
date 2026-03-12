import { Card } from "@/components/ui/card";
import { GitCommit, GitPullRequest, Rocket, Star, Upload } from "lucide-react";

interface ActivityItem {
    icon: React.ElementType;
    iconClass: string;
    message: string;
    time: string;
}

const activities: ActivityItem[] = [
    { icon: GitCommit, iconClass: "icon-glow-purple", message: "Committed to AI Code Editor", time: "2m ago" },
    { icon: Rocket, iconClass: "icon-glow-green", message: "Deployed Portfolio Builder", time: "18m ago" },
    { icon: Star, iconClass: "icon-glow-amber", message: "Starred E-Commerce Dashboard", time: "1h ago" },
    { icon: GitPullRequest, iconClass: "icon-glow-cyan", message: "Merged PR #12 in API Gateway", time: "3h ago" },
    { icon: Upload, iconClass: "icon-glow-purple", message: "Uploaded 3 files to Portfolio", time: "5h ago" },
];

export default function RecentActivity() {
    return (
        <Card className="rounded-2xl p-5 fade-in-up delay-400">
            <h2 className="text-base font-semibold mb-4">Recent Activity</h2>

            <ul className="space-y-3">
                {activities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.iconClass}`}>
                            <item.icon className="h-4 w-4" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.message}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                        </div>

                        {/* Connector line (not last) */}
                        {i < activities.length - 1 && (
                            <div className="absolute left-[1.85rem] h-5 w-px bg-border/50" style={{ marginTop: "2rem" }} />
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
