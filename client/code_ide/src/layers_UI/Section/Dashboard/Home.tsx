import { motion } from "framer-motion";
import { 
  FolderOpen, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Zap,
  ArrowRight,
  LayoutGrid,
  Image as ImageIcon
} from "lucide-react";
import RecentActivity from "./components/RecentActivity";
import { useAuth } from "@/layers_UI/utils/Context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useStatsQuery } from "@/hooks/useStats.hooks";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dashboardStats } = useStatsQuery();

  const stats = [
    { label: "Active Projects", value: dashboardStats?.totalProjects ?? "0", icon: FolderOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "AI Interactions", value: dashboardStats?.totalAiPrompts ?? "0", icon: ImageIcon, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Starred Items", value: dashboardStats?.starredProjects ?? "0", icon: CheckCircle2, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Total Files", value: dashboardStats?.totalFiles ?? "0", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 min-h-screen bg-linear-to-b from-[#0a0b1e] to-[#04050c]"
    >
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-linear-to-br from-white/10 to-transparent backdrop-blur-3xl p-8 md:p-12 lg:p-16">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
          <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-black border-4 border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-500/20 overflow-hidden ring-4 ring-indigo-500/10 hover:scale-105 transition-transform duration-500 shrink-0">
             <div className="h-full w-full bg-linear-to-br from-[#1a1c3d] to-[#0a0b1e] flex items-center justify-center text-3xl md:text-5xl font-black text-white">
                {user?.name?.[0] ?? "D"}
             </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Welcome back, <br className="sm:hidden" />
              <span className="bg-linear-to-r from-cyan-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text">
                {user?.name?.split(' ')[0] ?? "Developer"}
              </span>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
              <Sparkles className="h-4 w-4 fill-indigo-400" />
              Secure Dashboard Active
            </div>
          </div>

          <div className="md:ml-auto w-full md:w-auto pt-4 md:pt-0">
             <Button 
                onClick={() => navigate('/dashboard/projects')}
                className="w-full md:w-auto rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-14 px-10 shadow-xl shadow-indigo-500/20 group"
             >
                <Plus className="mr-2 h-5 w-5" />
                Initialize Project
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
             </Button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 md:w-96 md:h-96 bg-indigo-600/20 blur-[80px] md:blur-[120px] rounded-full" />
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
          >
            <Card className="border border-white/5 bg-white/[0.03] backdrop-blur-sm group-hover:bg-white/[0.08] group-hover:border-white/10 group-hover:translate-y-[-4px] transition-all duration-300 rounded-[1.5rem] overflow-hidden">
               <CardContent className="p-6">
                  <div className={`h-11 w-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                     <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                    <p className="text-xs md:text-sm font-medium text-white/40 uppercase tracking-widest">{stat.label}</p>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 pb-10">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
           <RecentActivity />
        </div>

        <div className="space-y-6 md:space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-white">
                 <Zap className="h-6 w-6 text-indigo-400" />
                 Quick Access
              </h2>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {[
                { label: "New Project", icon: Plus, sub: "Create a new workspace", color: "from-blue-600 to-indigo-600" },
                { label: "Manage Files", icon: LayoutGrid, sub: "Organize your collection", color: "from-purple-600 to-pink-600" }
              ].map((action, i) => (
                <Button 
                  key={i}
                  variant="ghost" 
                  className="h-auto p-5 justify-start text-left bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-3xl group transition-all w-full"
                >
                  <div className={`h-12 w-12 rounded-2xl bg-linear-to-br ${action.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white text-base">{action.label}</p>
                    <p className="text-xs text-white/30 uppercase tracking-wider">{action.sub}</p>
                  </div>
                </Button>
              ))}
           </div>
           
           <Card className="relative overflow-hidden border-none bg-linear-to-br from-indigo-600/30 to-purple-600/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-indigo-500/20 shadow-2xl mt-4">
              <div className="relative z-10">
                <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4">Pro Cloud features</h3>
                <p className="text-white font-black text-xl md:text-2xl mb-6 leading-tight">
                  Infinite storage <br />& AI performance.
                </p>
                <Button className="w-full bg-white text-indigo-900 hover:bg-white/90 font-black h-12 rounded-2xl transition-transform active:scale-95 shadow-xl">
                  GO PRO
                </Button>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-indigo-500/30 blur-[60px] rounded-full" />
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
