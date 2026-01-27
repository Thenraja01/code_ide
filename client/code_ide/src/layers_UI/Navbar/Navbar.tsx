import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { AlignHorizontalDistributeCenter, Dock, HomeIcon } from "lucide-react"
import codespace_logo from "@/../public/icons/codespace_icon_logo.svg"
import codespacelight from "@/../public/icons/light_code_space.svg"
import type { JSX } from "react/jsx-runtime"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/Provider/themeprovider"
import { ModeToggle } from "./toggletheme"
// import { useState } from "react"
import NavMenu from './NavMenu'
import { useNavigate } from 'react-router-dom'
export const pages: {
    title: string,
    href: string, description: string,
    icons: JSX.Element
}[] = [{
    title: "home",
    icons: <HomeIcon size={18} />,
    description: "a interface for a best development",
    href: "/"

}, {
    title: "about",
    icons: <AlignHorizontalDistributeCenter size={18} />,
    description: "the home page ",
    href: "/about"
}, {
    title: "docs",
    icons: <Dock size={18} />,
    description: "the documentation page",
    href: "/docs"
}
    ]
export default function Navbar() {
    // const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme()
    const logo = theme === "light" ? codespace_logo : codespacelight;
    const navigate = useNavigate()
    return (
        <>
            <div className="flex md:grid items-center justify-between md:justify-normal border-b-neutral-300">
                <div className=" md:flex items-center justify-between space-x-3">
                    <img src={logo} alt="codespace_ide" className="max-w-fit" />
                    <NavigationMenu >
                        <NavigationMenuList>
                            <NavigationMenuItem className="md:flex hidden  items-center  gap-12 w-auto">
                                {pages.map((component) => (
                                    <div className="flex   items-center gap-1 font-medium text-pretty cursor-pointer hover:text-chart-1" onClick={() => navigate(`${component.href}`)}>
                                        {component.icons}
                                        <NavigationMenuItem>{component.title}</NavigationMenuItem>
                                    </div>
                                ))}
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="hidden md:flex space-x-3 place-items-center-safe">
                        <div className="gap-3 flex">

                            <Button variant={"ghost"} className="bg-chart-2 text-sm">login</Button>
                            <Button variant={"ghost"} className="bg-blue-600">Sign Up</Button>
                        </div>

                        <ModeToggle />
                    </div>
                </div>
                <div className="md:hidden">

               <NavMenu/>
                </div>
            </div>
        </>
    )

};
