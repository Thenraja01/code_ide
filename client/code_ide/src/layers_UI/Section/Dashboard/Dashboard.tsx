import { Code2, FolderOpen, Rocket, Star } from "lucide-react";
import StatsCard from "./components/StatsCard";
import QuickActions from "./components/QuickActions";
import ProjectTable from "./components/ProjectTable/ProjectTable";
import RecentActivity from "./components/RecentActivity";
import Chart from "./Chart";
import { useAuth } from "@/layers_UI/utils/Context/AuthContext";
import { useStatsQuery } from "@/hooks/useStats.hooks";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: statsData, isLoading } = useStatsQuery();
  const location = useLocation();

  // Determine view based on path
  const getViewInfo = () => {
    const path = location.pathname;
    if (path.endsWith("/starred")) return { view: "starred" as const, title: "Starred Workspaces", subtitle: "Your bookmarked and favorite projects." };
    if (path.endsWith("/projects")) return { view: "all" as const, title: "All Projects", subtitle: "Manage and explore all your active workspaces." };
    if (path.endsWith("/recent")) return { view: "recent" as const, title: "Recent Activity", subtitle: "Jump back into your most recently edited files." };
    return { view: "all" as const, title: "Project Command Center", subtitle: "Here's what's happening in your workspace today." };
  };

  const { view, title, subtitle } = getViewInfo();


  const dynamicStats = [
    {
      title: "Projects Hub",
      value: isLoading ? "..." : String(statsData?.totalProjects ?? 0),
      subtext: "active workspaces",
      icon: FolderOpen,
      gradient: "purple" as const,
      trend: 0,
      delay: 0,
    },
    {
      title: "Cloud Deployments",
      value: isLoading ? "..." : String(statsData?.totalDeployments ?? 0),
      subtext: "successful pushes",
      icon: Rocket,
      gradient: "cyan" as const,
      trend: 0,
      delay: 100,
    },
    {
      title: "Total Line Count",
      value: isLoading ? "..." : (statsData?.totalLines ? (statsData.totalLines > 1000 ? `${(statsData.totalLines / 1000).toFixed(1)}k` : String(statsData.totalLines)) : "0"),
      subtext: "written in project",
      icon: Code2,
      gradient: "green" as const,
      trend: 0,
      delay: 200,
    },
    {
      title: "Starred Workspace",
      value: isLoading ? "..." : "0",
      subtext: "bookmarked favorites",
      icon: Star,
      gradient: "amber" as const,
      trend: 0,
      delay: 300,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 space-y-8 min-h-screen">


      {/* Page Header */}
      <div className="fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-muted-foreground/70">
            {title}
          </h1>
            <span className="text-4xl font-extrabold bg-linear-to-br from-green-600 via-orange-400 to-cyan-800  text-transparent bg-clip-text ">
              {user?.name ?? "Developer"} 
            </span>
          <p className="text-muted-foreground text-sm mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      <ProjectTable view={view} />

      {/* Quick Actions */}
      <section className="fade-in-up delay-200">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </section>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {dynamicStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
      {/* Chart + Activity — side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Project Table */}
    </div>
  );
}
