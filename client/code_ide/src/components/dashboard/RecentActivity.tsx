import { Card } from "@/components/ui/card";
import { FolderOpen, Sparkles, Clock, FileText } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function ActivityPage() {
  const { user } = useAuth();
  const activities = useQuery(api.projects.getRecentActivity, {
     userId: user?.id as any
  });
  
  const isLoading = activities === undefined;

  const getIcon = (type: string) => {
    switch (type) {
      case "project_created":
        return FolderOpen;
      case "file_edited":
        return FileText;
      default:
        return Sparkles;
    }
  };

  const getIconClass = (type: string) => {
    switch (type) {
      case "project_created":
        return "bg-purple-500/10 text-purple-400";
      default:
        return "bg-blue-500/10 text-blue-400";
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-500" />
          Activity Timeline
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track everything happening across your projects and AI workspace.
        </p>
      </div>

      {/* Content */}
      <Card className="p-6 rounded-2xl border bg-white/[0.02] backdrop-blur-sm">

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 bg-white/5 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Start a project to see updates here.
            </p>
          </div>
        ) : (
          <div className="relative">
            <ul className="space-y-8">
              {activities.map((item, i) => {
                const Icon = getIcon(item.type);

                return (
                  <li key={i} className="flex gap-4 relative">

                    {/* Timeline Line */}
                    {i < activities.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-[-28px] w-px bg-border" />
                    )}

                    {/* Icon */}
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${getIconClass(
                        item.type
                      )}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div>
                      <p className="text-sm font-medium text-white">
                        Created project "{item.title}"
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(item.timestamp), {
                          addSuffix: true
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
