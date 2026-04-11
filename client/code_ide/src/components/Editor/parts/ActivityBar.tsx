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
            "w-full h-12 flex items-center justify-center relative transition-all group",
            active ? "text-[#ffffff]" : "text-[#858585] hover:text-[#ffffff]",
            bottom && "mt-auto"
        )}
    >
        {active && indicator && (
            <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 w-0.5 h-full bg-[#ffffff]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        )}
        <Icon size={24} strokeWidth={active ? 1.5 : 1.2} />
    </button>
)

export default function ActivityBar({ activeTab, setActiveTab, isAiOpen, toggleAi }: ActivityBarProps) {
    return (
        <div className="w-[48px] flex flex-col bg-[#333333] border-r border-[#1e1e1e] h-full py-2 z-20">
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

            <div className="h-px bg-[#444] mx-3 my-2 opacity-30" />

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
