import { useState } from 'react'
import { File, Folder, X, ChevronDown, ChevronRight, GitBranch, Blocks, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface SidebarProps {
    activeTab: string
    files: any[]
    activeFileId: string
    setActiveFileId: (id: string) => void
    onNewFile: (type: "FILE" | "FOLDER") => void
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
    const [isExplorerExpanded, setIsExplorerExpanded] = useState(true)

    if (activeTab === 'none') return null

    return (
        <div className="flex flex-col bg-zinc-900 border-r border-zinc-800 h-full overflow-hidden select-none">
            <div className="h-10 flex items-center justify-between px-4 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800/50">
                <span>{activeTab === 'explorer' ? 'Explorer' : activeTab}</span>
                <button onClick={onCloseSidebar} className="hover:text-white transition-colors p-1">
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'explorer' && (
                        <motion.div
                            key="explorer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-0"
                        >
                            <div 
                                className="px-2 py-1.5 flex items-center justify-between hover:bg-zinc-800/50 cursor-pointer group transition-colors"
                                onClick={() => setIsExplorerExpanded(!isExplorerExpanded)}
                            >
                                <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
                                    {isExplorerExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    <span>Workspace</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onNewFile("FILE")
                                        }}
                                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                                        title="New File"
                                    >
                                        <File size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onNewFile("FOLDER")
                                        }}
                                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                                        title="New Folder"
                                    >
                                        <Folder size={14} />
                                    </button>
                                </div>
                            </div>

                            {isExplorerExpanded && (
                                <div className="py-1">
                                    {files.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => setActiveFileId(file.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-1 cursor-pointer text-[13px] transition-all relative border-l-2",
                                                activeFileId === file.id
                                                    ? "bg-zinc-800 border-primary text-white"
                                                    : "hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border-transparent"
                                            )}
                                        >
                                            <div className="w-4 flex justify-center">
                                                {file.type === 'FOLDER' ? (
                                                    <Folder size={16} className="text-blue-400/80" fill="currentColor" fillOpacity={0.2} />
                                                ) : (
                                                    <File size={16} className={cn(
                                                        file.name.endsWith('.js') || file.name.endsWith('.jsx') ? "text-amber-400" : 
                                                        file.name.endsWith('.tsx') || file.name.endsWith('.ts') ? "text-blue-400" : 
                                                        file.name.endsWith('.css') ? "text-cyan-400" : 
                                                        file.name === 'package.json' ? "text-rose-400" : "text-zinc-400"
                                                    )} />
                                                )}
                                            </div>
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    ))}
                                    {files.length === 0 && (
                                        <div className="px-8 py-4 text-xs text-zinc-500 italic">
                                            No files in project
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 space-y-4"
                        >
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold px-1">Search</span>
                                <div className="relative group">
                                    <Input
                                        placeholder="Search files..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-8 text-[13px] bg-zinc-800 border-zinc-700 rounded focus-visible:ring-1 focus-visible:ring-primary text-zinc-200"
                                    />
                                    <Search size={14} className="absolute right-2 top-2 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'git' && (
                        <motion.div
                            key="git"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <GitBranch className="mx-auto mb-4 text-zinc-700" size={48} />
                            <h3 className="text-zinc-300 font-medium mb-1">Source Control</h3>
                            <p className="text-[12px] text-zinc-500">Coming soon.</p>
                        </motion.div>
                    )}

                    {activeTab === 'extensions' && (
                        <motion.div
                            key="extensions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <Blocks className="mx-auto mb-4 text-zinc-700" size={48} />
                            <h3 className="text-zinc-300 font-medium mb-1">Marketplace</h3>
                            <p className="text-[12px] text-zinc-500">Extensions coming soon.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
