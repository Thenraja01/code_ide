import {  X, } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FileExpression from './FileExpression'

interface SidebarProps {
    activeTab: string
    projectId: string
    onCloseSidebar: () => void
    onFileSelect: (fileId: string) => void
    activeFileId?: string
}

export default function Sidebar({
    activeTab,
    projectId,
    onCloseSidebar,
    onFileSelect,
    activeFileId
}: SidebarProps) {

    if (activeTab === 'none') return null

    return (
        <div className="flex h-full flex-col bg-zinc-900 border-r border-zinc-800 h-full overflow-hidden select-none">
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
                                <div className="py-1">
                                    <FileExpression 
                                        projectId={projectId as any} 
                                        onFileSelect={onFileSelect}
                                        activeFileId={activeFileId}
                                    />
                                </div>
                          
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
