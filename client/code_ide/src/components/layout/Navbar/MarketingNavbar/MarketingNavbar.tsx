import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/Provider/themeprovider";
import { ModeToggle } from "@/components/Provider/Theme/toggletheme";
import NavMenu from "../NavMenu";
import { Separator } from "@/components/ui/separator";
import { pages } from "../constants";
import { useNavigate } from "react-router-dom";
export default function MarketingNavbar() {
    const { theme } = useTheme()
    const handleNavigate = useNavigate()
    const logo = theme === "light" ? "/icons/bg_light.svg" : "/icons/bg_light_1.svg";

    return (
        <>
            <div className="flex md:grid items-center px-2 justify-between md:justify-normal border-b-neutral-400">
                <div className="md:flex items-center justify-between space-x-3">
                    <img src={logo} alt="codespace_ide" className="h-12 m-5" />
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem className="md:flex hidden items-center gap-12 w-auto">
                                {pages.map((component: any) => (
                                    <div
                                        key={component.title}
                                        className="flex items-center gap-1 font-medium text-pretty cursor-pointer hover:text-chart-1"
                                        onClick={() => handleNavigate(component.href)}
                                    >
                                        {component.icons}
                                        <span>{component.title}</span>
                                    </div>
                                ))}
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="hidden md:flex space-x-3 place-items-center-safe">
                        <div className="gap-3 flex">
                            <Button variant={"ghost"} className="bg-chart-2 text-sm" onClick={() => handleNavigate("login")}>login</Button>
                            <Button variant={"ghost"} className="bg-blue-600" onClick={() => handleNavigate("signup")}>Sign Up</Button>
                        </div>
                        <ModeToggle />
                    </div>
                </div>

                <div className="md:hidden">
                    <NavMenu />
                </div>
                <Separator />
            </div>
        </>
    )
}
