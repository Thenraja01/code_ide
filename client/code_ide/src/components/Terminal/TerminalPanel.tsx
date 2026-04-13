import { useEffect, useRef, useState } from 'react';
import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Maximize2, Minimize2, Plus, Terminal as TerminalIcon, X, ChevronDown, Command } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface TerminalPanelProps {
  projectId: string;
  onCommand?: (command: string) => void;
}

export default function TerminalPanel({ projectId, onCommand }: TerminalPanelProps) {
  const queryClient = useQueryClient();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!terminalRef.current || !projectId) return;

    // Windows Terminal "Campbell" Theme + Acrylic Style
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"Cascadia Code", "JetBrains Mono", "Fira Code", monospace',
      letterSpacing: 0.5,
      lineHeight: 1.2,
      scrollback: 5000, // Large scrollback for reading previous logs
      theme: {
        background: 'rgba(12, 12, 12, 0.0)', // Transparent so we can see the backdrop-blur
        foreground: '#CCCCCC',
        cursor: '#FFFFFF',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#0C0C0C',
        red: '#C50F1F',
        green: '#13A10E',
        yellow: '#C19C00',
        blue: '#0037DA',
        magenta: '#881798',
        cyan: '#3A96DD',
        white: '#CCCCCC',
        brightBlack: '#767676',
        brightRed: '#E74856',
        brightGreen: '#16C60C',
        brightYellow: '#F9F1A5',
        brightBlue: '#3B78FF',
        brightMagenta: '#B4009E',
        brightCyan: '#61D6D6',
        brightWhite: '#F2F2F2',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    
    // Initial fit with a small delay to ensure DOM is ready
    setTimeout(() => {
        try { fitAddon.fit(); } catch(e) {}
    }, 100);

    const wsUrl = `ws://YOUR_VPS_IP:5000?projectId=${projectId}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
        term.writeln('Microsoft Windows [Version 10.0.22631.3296]');
        term.writeln('(c) Microsoft Corporation. All rights reserved.');
        term.writeln('');
        term.write('\x1b[1;36m[System]\x1b[0m Connected to workspace: ' + projectId);
        term.write('\r\nC:\\app> ');
    };

    socket.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'output') {
                const data = (payload.data || payload.error);
                term.write(data);
            } else if (payload.type === 'filesChanged') {
                // Invalidate files query to refresh the explorer
                queryClient.invalidateQueries({ queryKey: ['files', projectId] });
            } else if (payload.type === 'error') {
                term.writeln(`\r\n\x1b[1;31m[Error]: ${payload.message}\x1b[0m`);
            }
        } catch (err) {
            console.error("[Terminal] Message Parse Error:", err);
        }
    };

    socket.onerror = () => {
        if (term) term.writeln('\r\n\x1b[1;31m[System]: CONNECTION ERROR\x1b[0m');
    };
    
    socket.onclose = () => {
        if (term) term.writeln('\r\n\x1b[1;33m[System]: SESSION TERMINATED\x1b[0m');
    };

    term.onData((data: string) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'input', data }));
      }
    });

    // Handle Resize
    const handleResize = () => {
      try {
        fitAddon.fit();
        if (xtermRef.current && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ 
            type: 'resize', 
            cols: xtermRef.current.cols, 
            rows: xtermRef.current.rows 
          }));
        }
      } catch (e) {}
    };
    window.addEventListener('resize', handleResize);

    xtermRef.current = term;
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      socket.close();
    };
  }, [projectId]);

  return (
    <div className={`flex flex-col w-full h-full bg-black/90 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-[100] w-auto h-auto rounded-2xl' : 'rounded-t-xl'}`}>
      
      {/* Windows Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 h-10 bg-white/5 border-b border-white/5 select-none">
        <div className="flex items-center gap-1 h-full pt-1">
          {/* Active Tab - Command Prompt Style */}
          <div className="flex items-center gap-2 px-4 h-[32px] bg-[#0c0c0c] border-x border-t border-white/20 rounded-t-md text-xs font-semibold self-end shadow-[0_-2px_10px_rgba(0,0,0,0.5)]">
            <div className="w-3.5 h-3.5 bg-white/10 flex items-center justify-center rounded-sm">
                <span className="text-[8px] font-bold">C:{'>'}</span>
            </div>
            <span>Command Prompt</span>
            <X size={10} className="ml-2 opacity-40 hover:opacity-100 cursor-pointer" />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center px-2 self-center hover:bg-white/5 rounded-md h-7 cursor-pointer transition-colors group">
            <Plus size={14} className="opacity-60 group-hover:opacity-100" />
            <ChevronDown size={12} className="opacity-40 ml-1" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
                setIsExpanded(!isExpanded);
                setTimeout(() => xtermRef.current?.focus(), 300);
            }}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button className="p-1.5 hover:bg-red-500/80 rounded-md transition-colors text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 p-3 overflow-hidden group">
        <div 
            ref={terminalRef} 
            className="w-full h-full terminal-container" 
        />
      </div>
      
      {/* Footer / Hint */}
      {!isExpanded && (
        <div className="px-4 py-1 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1"><Command size={10} /> + C to copy</span>
                <span className="flex items-center gap-1"><Command size={10} /> + V to paste</span>
            </div>
            <div className="text-[10px] text-white/30 font-medium">
                Connected: 127.0.0.1
            </div>
        </div>
      )}
    </div>
  );
}


