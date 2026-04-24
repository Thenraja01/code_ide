import type { LucideIcon } from 'lucide-react'
import { Files, Search, GitBranch, Blocks, Settings, MessageSquareShare } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ActivityBarProps {
    activeTab: string
    setActiveTab: (tab: string) => void
    isAiOpen: boolean
    toggleAi: () => void
}

interface NavItemProps {
    icon: LucideIcon
    id: string
    active: boolean
    onClick: () => void
    bottom?: boolean
    indicator?: boolean
}

const NavItem = ({ icon: Icon, active, onClick, bottom, indicator }: NavItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full h-12 flex items-center justify-center relative transition-all group outline-none",
            active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            bottom && "mt-auto"
        )}
    >
        {active && indicator && (
            <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        )}
        <Icon size={22} strokeWidth={active ? 2 : 1.5} className={cn("transition-transform group-active:scale-90", active && "drop-shadow-[0_0_8px_rgba(114,0,171,0.5)]")} />
        
        {/* Tooltip-like effect on hover */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-zinc-200 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl border border-zinc-700">
            {Icon.name}
        </div>
    </button>
)

export default function ActivityBar({ activeTab, setActiveTab, isAiOpen, toggleAi }: ActivityBarProps) {
    return (
        <div className="w-[48px] flex flex-col bg-zinc-950 border-r border-zinc-900 h-full py-2 z-20">
            <NavItem
                icon={Files}
                id="explorer"
                active={activeTab === 'explorer'}
                onClick={() => setActiveTab('explorer')}
                indicator
            />
            <NavItem
                icon={Search}
                id="search"
                active={activeTab === 'search'}
                onClick={() => setActiveTab('search')}
                indicator
            />
            <NavItem
                icon={GitBranch}
                id="git"
                active={activeTab === 'git'}
                onClick={() => setActiveTab('git')}
                indicator
            />
            <NavItem
                icon={Blocks}
                id="extensions"
                active={activeTab === 'extensions'}
                onClick={() => setActiveTab('extensions')}
                indicator
            />

            <div className="h-px bg-zinc-800 mx-3 my-2 opacity-50" />

            {/* AI Assistant Toggle Button */}
            <NavItem
                icon={MessageSquareShare}
                id="ai"
                active={isAiOpen}
                onClick={toggleAi}
                indicator={false}
            />

            <NavItem
                icon={Settings}
                id="settings"
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
                bottom
                indicator
            />
        </div>
    )
}
