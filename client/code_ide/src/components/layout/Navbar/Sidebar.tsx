import { Button } from "@/components/ui/button";
import {
  Bot,
  CheckSquare,
  ChevronRight,
  Clock,
  Code2,
  FolderOpen,
  Home,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/dashboard/home" },
  { icon: FolderOpen, label: "Projects", path: "/dashboard/projects" },
  { icon: Star, label: "Starred", path: "/dashboard/starred" },
  { icon: Clock, label: "Templates", path: "/dashboard/templates" },
  { icon: CheckSquare, label: "Todo", path: "/dashboard/todo" },
  { icon: Bot, label: "CodeSpace AI", path: "/dashboard/ai-chat" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 z-50 md:z-auto
          h-screen md:h-[calc(100vh-4rem)]
          w-72 shrink-0
          bg-sidebar border-r border-sidebar-border
          flex flex-col p-4 gap-1
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-sidebar-foreground">CodeSpace</span>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Logo area — desktop only */}
        <div className="hidden md:flex items-center gap-3 px-3 py-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black text-sidebar-foreground tracking-tight">CodeSpace</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group
                  ${active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/50 pt-4 mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-3">
          Powered by code/space
        </div>
      </aside>
    </>
  );
}
