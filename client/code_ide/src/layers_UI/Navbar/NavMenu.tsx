import { Button } from "@/components/ui/button";
import { pages } from "./MarketingNavbar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NavMenu() {
  const navigate = useNavigate();

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44 animate-in fade-in zoom-in-95
">
          {pages.map((page) => (
            <DropdownMenuItem
              key={page.title}
              onClick={() => navigate(page.href)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {page.icons}
              <span className="capitalize">{page.title}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
