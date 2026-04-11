import { X, Trash2, ChevronRight, Terminal as TerminalIcon, Info, Bug, Settings, Maximize2, Command, Plus, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import TerminalPanel from '../../Terminal/TerminalPanel'

interface TerminalProps {
    output: string
    isVisible: boolean
    onClose: () => void
    onClear: () => void
    projectId?: string
}

type TabType = 'output' | 'terminal' | 'debug'

export default function Terminal({ output, isVisible, onClose, onClear, projectId }: TerminalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('terminal')
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isExpanded ? '80vh' : 280 }}
                    exit={{ height: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                    className={`bg-black/85 backdrop-blur-2xl border-t border-white/10 flex flex-col min-h-0 relative z-[50] ${isExpanded ? 'fixed bottom-4 left-4 right-4 z-[999] rounded-2xl border' : ''}`}
                >
                    {/* Glassmorphic Header / Title Bar */}
                    <div className="h-10 flex items-center justify-between px-3 border-b border-white/5 bg-white/5 select-none">
                        <div className="flex items-center gap-1 h-full pt-1">
                            {/* Tab System mimicking Windows Terminal */}
                            <div 
                                onClick={() => setActiveTab('output')}
                                className={`flex items-center gap-2 px-4 h-[32px] rounded-t-md text-[11px] font-semibold transition-all cursor-pointer self-end ${activeTab === 'output' ? 'bg-[#0c0c0c] border-x border-t border-white/20 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}
                            >
                                <Info size={12} className={activeTab === 'output' ? 'text-blue-400' : ''} />
                                <span>Output</span>
                            </div>

                            <div 
                                onClick={() => setActiveTab('terminal')}
                                className={`flex items-center gap-2 px-4 h-[32px] rounded-t-md text-[11px] font-semibold transition-all cursor-pointer self-end ${activeTab === 'terminal' ? 'bg-[#0c0c0c] border-x border-t border-white/20 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}
                            >
                                <TerminalIcon size={12} className={activeTab === 'terminal' ? 'text-green-400' : ''} />
                                <span>Terminal (sh)</span>
                                <X size={10} className="ml-1 opacity-20" />
                            </div>

                            <div 
                                onClick={() => setActiveTab('debug')}
                                className={`flex items-center gap-2 px-4 h-[32px] rounded-t-md text-[11px] font-semibold transition-all cursor-pointer self-end ${activeTab === 'debug' ? 'bg-[#0c0c0c] border-x border-t border-white/20 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}
                            >
                                <Bug size={12} className={activeTab === 'debug' ? 'text-orange-400' : ''} />
                                <span>Debug Console</span>
                            </div>

                            <div className="flex items-center px-1.5 self-center hover:bg-white/5 rounded-md h-7 cursor-pointer transition-colors group">
                                <Plus size={14} className="opacity-40 group-hover:opacity-100 text-white" />
                                <ChevronDown size={11} className="opacity-20 ml-1 text-white" />
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={onClear}
                                className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-all"
                                title="Clear Terminal"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-all"
                            >
                                <Maximize2 size={14} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-red-500/80 rounded-md text-white/40 hover:text-white transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'terminal' && projectId ? (
                            <TerminalPanel projectId={projectId} />
                        ) : activeTab === 'output' ? (
                            <div className="h-full overflow-y-auto p-4 font-mono text-[13px] leading-relaxed selection:bg-white/20 scrollbar-thin scrollbar-thumb-white/10">
                                {output ? (
                                    <div className="text-[#cccccc] animate-in fade-in slide-in-from-bottom-2 duration-500 group">
                                        <div className="flex items-center gap-2 text-white/40 mb-3 border-b border-white/5 pb-2">
                                            <ChevronRight size={14} />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">Execution Stream - Output</span>
                                        </div>
                                        <pre className="whitespace-pre-wrap font-mono text-zinc-300">{output}</pre>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-white/20 gap-2 select-none">
                                        <Info size={32} strokeWidth={1} />
                                        <span className="text-xs italic">No execution output available. Run your project to see logs.</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/10 select-none">
                                <Bug size={48} strokeWidth={1} />
                                <span className="text-sm font-medium mt-2">Debug Console is inactive</span>
                                <span className="text-[10px] uppercase tracking-widest mt-1">Start a debugging session to begin</span>
                            </div>
                        )}
                    </div>

                    {/* Hint Bar */}
                    <div className="h-6 flex items-center justify-between px-4 bg-white/[0.02] border-t border-white/5 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><Command size={10} /> + C Copy</span>
                            <span className="flex items-center gap-1.5"><Command size={10} /> + V Paste</span>
                        </div>
                        <div className="flex gap-4">
                            <span>Status: {projectId ? 'Ready' : 'No Project'}</span>
                            <Settings size={10} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

