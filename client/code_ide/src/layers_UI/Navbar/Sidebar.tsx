import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  ChevronRight,
  Clock,
  Code2,
  FolderOpen,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/dashboard/home" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Code2, label: "Editor", path: "/dashboard/editor" },
  { icon: Star, label: "Starred", path: "/dashboard/starred" },
  { icon: FolderOpen, label: "Projects", path: "/dashboard/projects" },
  { icon: Clock, label: "Recent", path: "/dashboard/recent" },
  { icon: CheckSquare, label: "Todo", path: "/dashboard/todo" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-20 left-4 z-50 md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-card border border-border shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-16 z-50 md:z-auto
          h-screen md:h-[calc(100vh-4rem)]
          w-64 shrink-0
          bg-sidebar border-r border-sidebar-border
          flex flex-col p-4 gap-1
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <span className="text-sm font-semibold text-sidebar-foreground">Navigation</span>
          <Button size="icon" variant="ghost" onClick={() => setOpen(false)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Logo area — desktop only */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">CodeSpace</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${active
                    ? "sidebar-link-active font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border pt-4 mt-2 text-xs text-muted-foreground px-3">
          CodeSpace v1.0
        </div>
      </aside>
    </>
  );
}
