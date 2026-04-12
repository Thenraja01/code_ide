import { Card } from "@/components/ui/card";
import { FolderOpen, Sparkles, Clock, FileText } from "lucide-react";
import { useRecentActivityQuery } from "@/hooks/useStats.hooks";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
    const { data: activities, isLoading } = useRecentActivityQuery();

    const getIcon = (type: string) => {
        switch (type) {
            case 'folder': return FolderOpen;
            case 'sparkles': return Sparkles;
            case 'ai': return Sparkles;
            default: return FileText;
        }
    };

    const getIconClass = (type: string) => {
        switch (type) {
            case 'project': return "icon-glow-purple";
            case 'ai': return "icon-glow-cyan";
            default: return "icon-glow-amber";
        }
    };

    if (isLoading) {
        return (
            <Card className="rounded-2xl p-5 fade-in-up animate-pulse">
                <div className="h-6 w-32 bg-white/5 rounded mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="h-8 w-8 bg-white/5 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-full bg-white/5 rounded" />
                                <div className="h-2 w-20 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl p-5 fade-in-up delay-400 border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Recent Activity
            </h2>

            {(!activities || activities.length === 0) ? (
                <div className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">No recent activity found.</p>
                </div>
            ) : (
                <ul className="relative space-y-6">
                    {activities.map((item, i) => {
                        const Icon = getIcon(item.iconType);
                        return (
                            <li key={i} className="flex items-start gap-4 relative">
                                {/* Connector line (not last) */}
                                {i < activities.length - 1 && (
                                    <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-white/5" />
                                )}

                                {/* Icon */}
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 z-10 ${getIconClass(item.type)}`}>
                                    <Icon className="h-4 w-4 text-indigo-400" />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/80 font-medium leading-tight">{item.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">
                                        {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}
