import { useState } from 'react'
import { File, Plus, Search as SearchIcon, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface SidebarProps {
    activeTab: string
    files: any[]
    activeFileId: string
    setActiveFileId: (id: string) => void
    onNewFile: () => void
    onCloseSidebar: () => void
}

export default function Sidebar({
    activeTab,
    files,
    activeFileId,
    setActiveFileId,
    onNewFile,
    onCloseSidebar
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')

    if (activeTab === 'none') return null

    return (
        <div className="w-[260px] flex flex-col bg-secondary/30 border-r border-border h-full">
            <div className="h-10 flex items-center justify-between px-4 text-[11px] uppercase tracking-wider text-muted-foreground font-bold font-sans">
                <span>{activeTab}</span>
                <button onClick={onCloseSidebar} className="hover:text-foreground">
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'explorer' && (
                        <motion.div
                            key="explorer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="py-2"
                        >
                            <div className="px-4 mb-2 flex items-center justify-between group">
                                <div className="flex items-center gap-1 text-[13px] font-semibold">
                                    <ChevronDown size={16} />
                                    <span>PROJECT</span>
                                </div>
                                <button
                                    onClick={onNewFile}
                                    className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="space-y-[1px]">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={() => setActiveFileId(file.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-1 cursor-pointer text-[13px] transition-colors",
                                            activeFileId === file.id
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <File size={14} className={cn(activeFileId === file.id ? "text-primary" : "")} />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="p-4 space-y-4"
                        >
                            <div className="relative">
                                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-9 text-[13px] bg-background border-none focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="text-[12px] text-muted-foreground">
                                {searchQuery ? `Found 0 results in ${files.length} files` : 'Type to search across files...'}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'extensions' && (
                        <motion.div
                            key="extensions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <Blocks className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
                            <p className="text-[13px] text-muted-foreground">Marketplace searching coming soon.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

import { Blocks } from 'lucide-react'
