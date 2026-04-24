import { HomeIcon, AlignHorizontalDistributeCenter, Dock } from "lucide-react";
import type { ReactNode } from "react";

export interface Page {
    title: string;
    icons: ReactNode;
    description: string;
    href: string;
}

export const pages: Page[] = [
    {
        title: "home",
        icons: <HomeIcon size={18} />,
        description: "a interface for a best development",
        href: "/",
    },
    {
        title: "about",
        icons: <AlignHorizontalDistributeCenter size={18} />,
        description: "the home page",
        href: "/about",
    },
    {
        title: "docs",
        icons: <Dock size={18} />,
        description: "the documentation page",
        href: "/docs",
    },
];
