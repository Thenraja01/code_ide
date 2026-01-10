import { ThemeProvider } from "@/components/Provider/themeprovider";
import Navbar from "../Navbar/Navbar";
import Home from "../Home/Home";

export default function Layout() {
    return(
        <div className="">

          <ThemeProvider
    defaultTheme='dark' storageKey="vite-ui-theme">

        <Navbar/>
    </ThemeProvider>

        <Home/>
        </div>
    )
};
