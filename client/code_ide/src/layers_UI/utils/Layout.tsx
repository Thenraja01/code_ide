// import Footer from "../components/ui/Footer";
import Navbar from "../Navbar/MarketingNavbar";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/Provider/themeprovider";

export default function Layout({ children}:any) {


  return (
    
    <div className="min-h-screen flex flex-col">

      {/* NAVBAR */}
     <Navbar/>

      {/* MAIN CONTENT */}
      <ThemeProvider
      defaultTheme='dark' storageKey="vite-ui-theme">
      <main className="grow">
        
        <Outlet/>
      </main>
      </ThemeProvider>

      {/* FOOTER */}
      {/* <Footer/> */}
      
    </div>
  );
}