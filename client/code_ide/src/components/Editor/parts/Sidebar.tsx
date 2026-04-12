import { useState } from 'react'
import { File, Folder, X, ChevronDown, ChevronRight, GitBranch, Blocks } from 'lucide-react'
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
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-[#252526] border-r border-[#1e1e1e] h-full overflow-hidden select-none"
        >
            <div className="h-9 flex items-center justify-between px-4 text-[11px] uppercase tracking-wider text-[#bbbbbb] font-medium">
                <span>{activeTab === 'explorer' ? 'Explorer' : activeTab}</span>
                <button onClick={onCloseSidebar} className="hover:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
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
                                className="px-2 py-1 flex items-center justify-between bg-[#37373d]/30 cursor-pointer group"
                                onClick={() => setIsExplorerExpanded(!isExplorerExpanded)}
                            >
                                <div className="flex items-center gap-1 text-[11px] font-bold text-[#cccccc]">
                                    {isExplorerExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    <span>PROJECT</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onNewFile("FILE")
                                        }}
                                        className="p-1 hover:bg-[#454545] rounded text-[#cccccc]"
                                        title="New File"
                                    >
                                        <File size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onNewFile("FOLDER")
                                        }}
                                        className="p-1 hover:bg-[#454545] rounded text-[#cccccc]"
                                        title="New Folder"
                                    >
                                        <Folder size={14} />
                                    </button>
                                </div>
                            </div>

                            {isExplorerExpanded && (
                                <div className="mt-1">
                                    {files.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => setActiveFileId(file.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-[3px] cursor-pointer text-[13px] transition-all",
                                                activeFileId === file.id
                                                    ? "bg-[#37373d] text-white"
                                                    : "hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white"
                                            )}
                                        >
                                            <div className="w-4 flex justify-center">
                                                {file.type === 'FOLDER' ? (
                                                    <Folder size={16} className="text-blue-300" fill="currentColor" />
                                                ) : (
                                                    <File size={16} className={cn(
                                                        file.name.endsWith('.js') || file.name.endsWith('.jsx') ? "text-yellow-400" : 
                                                        file.name.endsWith('.tsx') || file.name.endsWith('.ts') ? "text-blue-400" : 
                                                        file.name.endsWith('.css') ? "text-blue-500" : 
                                                        file.name === 'package.json' ? "text-red-400" : "text-gray-400"
                                                    )} />
                                                )}
                                            </div>
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    ))}
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
                            <div className="relative">
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-7 text-[13px] bg-[#3c3c3c] border-[#3c3c3c] rounded-none focus-visible:ring-1 focus-visible:ring-primary text-white"
                                />
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
                            <GitBranch className="mx-auto mb-4 text-[#454545]" size={48} />
                            <p className="text-[13px] text-[#858585]">Source Control integration coming soon.</p>
                        </motion.div>
                    )}

                    {activeTab === 'extensions' && (
                        <motion.div
                            key="extensions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center"
                        >
                            <Blocks className="mx-auto mb-4 text-[#454545]" size={48} />
                            <p className="text-[13px] text-[#858585]">Marketplace extension search.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
