import type { LucideIcon } from 'lucide-react'
import { Files, Search, Blocks, Settings, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ActivityBarProps {
    activeTab: string
    setActiveTab: (tab: string) => void
    onRun: () => void
}

interface NavItemProps {
    icon: LucideIcon
    id: string
    active: boolean
    onClick: () => void
    bottom?: boolean
}

const NavItem = ({ icon: Icon, active, onClick, bottom }: NavItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full h-12 flex items-center justify-center relative transition-colors group",
            active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            bottom && "mt-auto"
        )}
    >
        {active && (
            <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 w-0.5 h-full bg-primary"
            />
        )}
        <Icon size={24} strokeWidth={active ? 2 : 1.5} />
    </button>
)

export default function ActivityBar({ activeTab, setActiveTab, onRun }: ActivityBarProps) {
    return (
        <div className="w-[50px] flex flex-col bg-card border-r border-border h-full py-2">
            <NavItem
                icon={Files}
                id="explorer"
                active={activeTab === 'explorer'}
                onClick={() => setActiveTab('explorer')}
            />
            <NavItem
                icon={Search}
                id="search"
                active={activeTab === 'search'}
                onClick={() => setActiveTab('search')}
            />
            <NavItem
                icon={Blocks}
                id="extensions"
                active={activeTab === 'extensions'}
                onClick={() => setActiveTab('extensions')}
            />

            <div className="h-px bg-border mx-2 my-2 opacity-50" />

            <button
                onClick={onRun}
                className="w-full h-12 flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                title="Run Code"
            >
                <Play size={24} fill="currentColor" />
            </button>

            <NavItem
                icon={Settings}
                id="settings"
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
                bottom
            />
        </div>
    )
}
