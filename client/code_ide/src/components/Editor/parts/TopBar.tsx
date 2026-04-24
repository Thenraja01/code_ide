import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Play, Square, Github, Sparkles, Layout } from "lucide-react";

interface TopBarProps {
  onPlay?: () => void;
  isPreviewRunning?: boolean;
  onToggleTerminal?: () => void;
  activeView?: 'code' | 'preview';
  onViewChange?: (view: 'code' | 'preview') => void;
  projectName?: string;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function TopBar({
  projectName = "overseas-snipe-copper",
  onPlay,
  isPreviewRunning,
  onToggleTerminal,
  activeView,
  onViewChange,
  onSave,
  isSaving
}: TopBarProps) {
  const navigate = useNavigate();
  return (
    <div className="h-12 flex items-center bg-[#151515] text-[#8b8b8b] text-[13px] px-4 border-b border-zinc-900 select-none justify-between pl-3 pr-3">
      {/* Left Section - Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center p-1 hover:bg-zinc-800/50 rounded-md transition-colors text-blue-500"
        >
          <Sparkles size={16} className="fill-blue-500" />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span 
            onClick={() => navigate('/dashboard')}
            className="text-[#8b8b8b] hover:text-white cursor-pointer transition-colors font-bold tracking-tight"
          >
            Code Sphere
          </span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-200 font-semibold">{projectName}</span>
        </div>
      </div>

      {/* Middle Section - Tabs */}
      <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
        <div className="flex bg-[#1e1e1e] p-[2px] rounded-lg border border-zinc-800/50">
          <button
            onClick={() => onViewChange?.('code')}
            className={cn(
              "px-6 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              activeView === 'code'
                ? "bg-[#2d2d2d] text-zinc-100 shadow-sm"
                : "text-[#8b8b8b] hover:text-zinc-300"
            )}
          >
            Code
          </button>
          <button
            onClick={() => onViewChange?.('preview')}
            className={cn(
              "px-6 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
              activeView === 'preview'
                ? "bg-[#2d2d2d] text-zinc-100 shadow-sm"
                : "text-[#8b8b8b] hover:text-zinc-300"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Right Section - Run/Export/Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPlay}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
            isPreviewRunning
              ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          )}
        >
          {isPreviewRunning ? (
            <><Square className="w-3.5 h-3.5 fill-current" /> Stop</>
          ) : (
            <><Play className="w-3.5 h-3.5 fill-current" /> Run</>
          )}
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
            isSaving ? "text-[#555] cursor-not-allowed" : "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          )}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={onToggleTerminal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[#8b8b8b] hover:text-zinc-300 hover:bg-white/5 transition-colors"
          title="Toggle Terminal"
        >
          <Layout className="w-4 h-4" />
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#8b8b8b] hover:text-zinc-300 transition-colors">
          <Github className="w-4 h-4" />
          Export
        </button>

        <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-zinc-700 ml-1">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="avatar" 
            className="w-full h-full object-cover" 
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  )
}

