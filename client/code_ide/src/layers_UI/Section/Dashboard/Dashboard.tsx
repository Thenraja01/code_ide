import { Code2, FolderOpen, Rocket, Star } from "lucide-react";
import StatsCard from "./components/StatsCard";
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 space-y-8 md:space-y-12 min-h-screen">


      {/* Page Header */}
      <div className="fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
        <div className="space-y-1">
          <h1 className="text-sm md:text-base font-black tracking-[0.2em] uppercase text-muted-foreground/50">
            {title}
          </h1>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl md:text-5xl lg:text-6xl font-black bg-linear-to-br from-green-400 via-orange-400 to-cyan-500 text-transparent bg-clip-text">
              {user?.name ?? "Developer"}
            </span>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm font-medium mt-2 max-w-lg">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dynamicStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        <ProjectTable view={view} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          <div className="lg:col-span-2">
            <Chart />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
