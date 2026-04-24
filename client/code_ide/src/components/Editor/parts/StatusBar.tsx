import { Terminal, RefreshCw, CheckCircle2, GitBranch, Globe } from 'lucide-react'

interface StatusBarProps {
    language: string
    lineCount: number
    onToggleTerminal: () => void
}

export default function StatusBar({ language, lineCount, onToggleTerminal }: StatusBarProps) {
    return (
        <div className="h-6 flex items-center justify-between px-3 bg-primary text-white text-[10px] font-medium transition-colors border-t border-primary-foreground/10">
            <div className="flex items-center h-full">
                <div className="flex items-center gap-1.5 px-3 hover:bg-white/10 h-full cursor-pointer transition-colors border-r border-white/5">
                    <GitBranch size={12} />
                    <span>main</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 hover:bg-white/10 h-full cursor-pointer transition-colors border-r border-white/5">
                    <RefreshCw size={12} className="opacity-80" />
                </div>
                <div className="flex items-center gap-1.5 h-full px-3 transition-colors border-r border-white/5">
                    <CheckCircle2 size={12} className="text-emerald-300" />
                    <span className="opacity-90">No issues</span>
                </div>
                <div className="flex items-center gap-1.5 h-full px-3 transition-colors">
                    <Globe size={11} className="opacity-80" />
                    <span>Connected</span>
                </div>
            </div>

            <div className="flex items-center h-full">
                <div className="hover:bg-white/10 h-full px-3 flex items-center cursor-pointer transition-colors border-l border-white/5">
                    <span>Spaces: 2</span>
                </div>
                <div className="hover:bg-white/10 h-full px-3 flex items-center cursor-pointer transition-colors border-l border-white/5">
                    <span>UTF-8</span>
                </div>
                <div className="hover:bg-white/10 h-full px-3 flex items-center cursor-pointer uppercase transition-colors border-l border-white/5">
                    <span>{language}</span>
                </div>
                <div className="hover:bg-white/10 h-full px-3 flex items-center cursor-pointer transition-colors border-l border-white/5">
                    <span>Ln {lineCount}, Col 1</span>
                </div>
                <button 
                  onClick={onToggleTerminal}
                  className="hover:bg-white/20 bg-white/5 h-full px-3 flex items-center transition-all gap-1.5 text-white border-l border-white/5 active:bg-white/30"
                >
                    <Terminal size={12} />
                    <span className="font-bold">TERMINAL</span>
                </button>
            </div>
        </div>
    )
}
