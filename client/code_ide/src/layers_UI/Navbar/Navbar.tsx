import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import codespace_logo from "@/../public/icons/codespace_icon_logo.svg"
import codespacelight from "@/../public/icons/light_code_space.svg"
import { AlignHorizontalDistributeCenter, Dock, Home, } from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/Provider/themeprovider"
import { ModeToggle } from "./toggletheme"

const pages: {
    title: string,
    href: string, description: string,
    icons: JSX.Element
}[] = [{
    title: "home",
    icons:<Home size={18}/>,
    description: "a interface for a best development",
    href: "/"

}, {
    title: "about",
     icons:<AlignHorizontalDistributeCenter size={18}/>,
    description: "the home page ",
    href: "/about"
}, {
    title: "docs",
     icons:<Dock size={18}/>,
    description: "the documentaion page",
    href: "/docs"
}
    ]
export default function Navbar() {
    
    const { theme } = useTheme()
    const logo = theme === "light" ? codespace_logo : codespacelight;
    return (
        <>
            <div className='flex  justify-between items-center w-auto sm:grid sm:grid-cols-3 p-4'>
                <img src={logo} alt="codespace_ide" />
            
                <div className="">
                    <NavigationMenu >
                        <NavigationMenuList>
                            <NavigationMenuItem className="flex items-center gap-12 w-auto">
                                {pages.map((component) => (
                                    <div className="flex items-center gap-1 font-medium text-pretty cursor-pointer hover:text-chart-1">
                                        {component.icons}
                                    <NavigationMenuItem>{component.title}</NavigationMenuItem>
                                    </div>
                                ))}
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="gap-3 flex">
                        
                    <Button variant={"ghost"} className="bg-chart-2 text-sm">login</Button>
                    <Button variant={"ghost"} className="bg-blue-600">Sign Up</Button>
                    </div>
                    <ModeToggle/>
                </div>
            </div>
        </>
    )

};
