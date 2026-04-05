import MarketingNavbar from "./MarketingNavbar/MarketingNavbar";
import { AppNavbar } from "./AppNavbar/AppNavbar";
import { useMeQuery } from "@/hooks/useAuth.hooks";

export default function Navbar() {
  const { data: user } = useMeQuery();

  return user ? <AppNavbar /> : <MarketingNavbar />;
}
