import { Code2, FolderOpen, Rocket, Star } from "lucide-react";
import StatsCard from "./components/StatsCard";
import QuickActions from "./components/QuickActions";
import ProjectTable from "./components/ProjectTable/ProjectTable";
import RecentActivity from "./components/RecentActivity";
import Chart from "./Chart";
import { useAuth } from "@/layers_UI/utils/Context/AuthContext";

const stats = [
  {
    title: "Total Projects",
    value: "24",
    subtext: "across all workspaces",
    icon: FolderOpen,
    gradient: "purple" as const,
    trend: 12,
    delay: 0,
  },
  {
    title: "Deployments",
    value: "138",
    subtext: "this month",
    icon: Rocket,
    gradient: "cyan" as const,
    trend: 8,
    delay: 100,
  },
  {
    title: "Lines of Code",
    value: "42k",
    subtext: "written this week",
    icon: Code2,
    gradient: "green" as const,
    trend: 21,
    delay: 200,
  },
  {
    title: "Starred Projects",
    value: "7",
    subtext: "bookmarked for quick access",
    icon: Star,
    gradient: "amber" as const,
    trend: -2,
    delay: 300,
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 space-y-8 min-h-screen">

      {/* Page Header */}
      <div className="fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome back 
          </h1>
            <span className="text-2xl bg-linear-to-br from-green-600 via-orange-400 to-cyan-800  text-transparent bg-clip-text ">{user?.name ?? "Developer"} 
              </span>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="fade-in-up delay-200">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </section>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
      <ProjectTable />
    </div>
  );
}
