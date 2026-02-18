
import MarketingNavbar from "./MarketingNavbar/MarketingNavbar";
import { AppNavbar } from "./AppNavbar/AppNavbar";
import { useAuth } from "../utils/Context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return user ? <AppNavbar /> : <MarketingNavbar />;
}
