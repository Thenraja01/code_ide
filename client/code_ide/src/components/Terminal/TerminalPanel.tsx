import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { webcontainerService } from '@/services/WebContainerService';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  projectId: string;
}

export default function TerminalPanel({ projectId }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      theme: {
        background: '#0c0c0c',
        foreground: '#cccccc',
        cursor: '#ffffff',
        selectionBackground: '#333333',
        black: '#000000',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#bfbfbf',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Initial greeting
    term.writeln('\x1b[34mWelcome to CodeSphere Terminal\x1b[0m');
    term.writeln(`\x1b[90mConnected to project: ${projectId}\x1b[0m`);
    term.write('\r\n$ ');

    // Handle Resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    // Connect to WebContainer
    let shellProcess: any = null;

    const startShell = async () => {
      try {
        const wc = await webcontainerService.load();
        shellProcess = await wc.spawn('jsh', {
           terminal: {
               cols: term.cols,
               rows: term.rows
           }
        });

        shellProcess.output.pipeTo(new WritableStream({
          write(data) {
            term.write(data);
          }
        }));

        const input = shellProcess.input.getWriter();
        term.onData((data) => {
          input.write(data);
        });

        term.onResize((size) => {
           shellProcess.resize(size);
        });

      } catch (err) {
        term.writeln('\x1b[31mFailed to boot WebContainer shell.\x1b[0m');
      }
    };

    startShell();

    return () => {
      term.dispose();
      resizeObserver.disconnect();
      if (shellProcess) shellProcess.kill();
    };
  }, [projectId]);

  return (
    <div className="h-full w-full bg-[#0c0c0c] p-2">
      <div 
        ref={terminalRef} 
        className="h-full w-full transition-opacity duration-300"
      />
      <style>{`
        .xterm-viewport::-webkit-scrollbar {
          width: 8px;
        }
        .xterm-viewport::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .xterm-viewport::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .xterm-viewport::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .xterm .xterm-screen {
            padding: 8px;
        }
      `}</style>
    </div>
  );
}
