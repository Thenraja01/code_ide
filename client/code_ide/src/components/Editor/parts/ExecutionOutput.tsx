import { Terminal, Trash2, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutionOutputProps {
  output: string | null;
  isRunning: boolean;
  onClear: () => void;
}

export default function ExecutionOutput({ output, isRunning, onClear }: ExecutionOutputProps) {
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0c0c0c] text-zinc-500 gap-4 animate-in fade-in duration-500">
        <div className="relative">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Play size={12} className="text-blue-400 fill-blue-400 ml-0.5" />
            </div>
        </div>
        <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-blue-400/80">Executing Code</span>
            <span className="text-[10px] text-zinc-600 animate-pulse italic">Running via Piston API Engine...</span>
        </div>
      </div>
    );
  }

  if (output === null) return null;

  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border-t border-[#222]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/20">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-blue-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Execution Output</span>
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-red-400 flex items-center gap-1.5 group"
          title="Clear Output"
        >
          <span className="text-[9px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Clear</span>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm custom-scrollbar bg-black/30">
        <pre className="text-zinc-300 whitespace-pre-wrap break-words leading-relaxed selection:bg-blue-500/30">
          {output || <span className="text-zinc-600 italic">No output returned from execution.</span>}
        </pre>
      </div>
    </div>
  );
}
