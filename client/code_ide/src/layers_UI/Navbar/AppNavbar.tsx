import { useLocation } from "react-router-dom";
import UserMenu from "./UserMenu.tsx";
import { ModeToggle } from "./toggletheme";
import SearchBar from "./Searchbar.tsx";

export function AppNavbar() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <h1 className="text-xl font-semibold">CodeSpace</h1>

      {/* Show search only on dashboard */}
      {isDashboard && <SearchBar />}

      <div className="flex items-center gap-4">
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
