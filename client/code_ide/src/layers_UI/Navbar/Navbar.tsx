
import MarketingNavbar from "./MarketingNavbar";
import { AppNavbar } from "./AppNavbar";
import { useAuth } from "./AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return user ? <AppNavbar /> : <MarketingNavbar />;
}
