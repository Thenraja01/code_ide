import MarketingNavbar from "./MarketingNavbar/MarketingNavbar";
import { AppNavbar } from "./AppNavbar/AppNavbar";
import { useMeQuery } from "@/hooks/useAuth.hooks";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: user } = useMeQuery();

  return user ? <AppNavbar onMenuClick={onMenuClick} /> : <MarketingNavbar />;
}
