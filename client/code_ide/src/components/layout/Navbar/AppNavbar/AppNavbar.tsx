import { useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/Provider/Theme/toggletheme.tsx";
import SearchBar from "../Searchbar.tsx";
import UserMenu from "../UserMenu.tsx";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppNavbarProps {
  onMenuClick?: () => void;
}

export function AppNavbar({ onMenuClick }: AppNavbarProps) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-black text-xs">CS</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">
              CodeSpace
            </h1>
          </div>
        </div>

        {/* Show search only on dashboard, hide on mobile */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          {isDashboard && <SearchBar />}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
