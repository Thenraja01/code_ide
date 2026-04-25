import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useMeQuery } from "@/hooks/useAuth.hooks";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function UserMenu() {
  const { data: user } = useMeQuery();
  const { logout } = useAuth();
  const handleNavigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    handleNavigate("/login");
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
        <DropdownMenuItem onClick={() => handleNavigate("/dashboard/profile")}>
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
