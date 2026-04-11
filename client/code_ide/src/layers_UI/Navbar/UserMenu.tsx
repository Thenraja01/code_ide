import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useMeQuery } from "@/hooks/useAuth.hooks";
import { useHandleNavigate } from "../utils/CustomFunction/HandleNavigate";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

export default function UserMenu() {
  const handleNavigate = useHandleNavigate();
  const { data: user } = useMeQuery();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    handleNavigate("login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer">
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleNavigate("dashboard/profile")}>
          <User size={16} className="mr-2" />
          <div>Profile</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          <LogOut size={16} className="mr-2" />
          <div>Logout</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
