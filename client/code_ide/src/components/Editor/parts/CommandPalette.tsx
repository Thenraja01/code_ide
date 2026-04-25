import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandAction {
    id: string
    label: string
    icon: any
    shortcut?: string
    action: () => void
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    actions: CommandAction[]
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
    const [search, setSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)

    const filteredActions = actions.filter(a => 
        a.label.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        if (isOpen) {
            setSearch('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(i => (i + 1) % filteredActions.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(i => (i - 1 + filteredActions.length) % filteredActions.length)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].action()
                    onClose()
                }
            } else if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, filteredActions, selectedIndex, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-[600px] bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                            <Search size={18} className="text-zinc-500" />
                            <input 
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Type a command or search..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-600"
                            />
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Esc</span>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                            {filteredActions.length > 0 ? (
                                filteredActions.map((action, i) => (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            action.action()
                                            onClose()
                                        }}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
                                            selectedIndex === i ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <action.icon size={16} className={cn(
                                                selectedIndex === i ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                            )} />
                                            <span className="text-sm font-medium">{action.label}</span>
                                        </div>
                                        {action.shortcut && (
                                            <span className={cn(
                                                "text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize",
                                                selectedIndex === i ? "border-white/20 bg-white/10" : "border-zinc-800 bg-zinc-900"
                                            )}>
                                                {action.shortcut}
                                            </span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-zinc-600 gap-3">
                                    <Command size={32} strokeWidth={1} />
                                    <p className="text-sm">No commands matching "{search}"</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2 bg-[#09090b]/50 border-t border-zinc-800 flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                <div className="p-0.5 rounded border border-zinc-800 bg-zinc-900">↑↓</div>
                                <span>Navigate</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                <div className="p-0.5 rounded border border-zinc-800 bg-zinc-900">Enter</div>
                                <span>Select</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
