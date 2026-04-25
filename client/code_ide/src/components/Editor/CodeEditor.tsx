
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useQuery, useMutation } from 'convex/react'
import { api } from "@convex/_generated/api"
import type { Id } from '@convex/_generated/dataModel'

import MonacoEditor from './parts/MonacoEditor'
import StatusBar from './parts/StatusBar'
import TopBar from './parts/TopBar'
import AIPanel from './parts/AIPanel'
import TerminalPanel from '../Terminal/TerminalPanel'
import PreviewPanel from '../Preview/PreviewPanel'

import {
  useCommandMutation,
  useStartPreviewMutation,
  useStopPreviewMutation,
  useRunCodeMutation
} from '@/hooks/useExecution.hooks'

import { Link as LinkIcon, Loader2 } from 'lucide-react'
import { webcontainerService } from '@/services/WebContainerService'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './parts/Sidebar'
import axios from 'axios'
import { useEditor } from '@/hooks/useEditor'
import TabStructure from './parts/TabStructure'
import ExecutionOutput from './parts/ExecutionOutput'
import CommandPalette from './parts/CommandPalette'
import { Play, Terminal, Sparkles, FileCode, Zap } from 'lucide-react'

const WEB_FRAMEWORKS = ['react', 'vanilla', 'express', 'fastapi', 'node', 'nextjs']

export default function CodeEditor() {
  const { projectId } = useParams()
  const { user } = useAuth()

  const {
    openTab,
    activeTabId,
    openFile,
  } = useEditor((projectId ?? '') as any)

  const projectFiles = useQuery(
    api.files.getFilesByProject,
    projectId ? { projectId: projectId as any, userId: user?.firebaseUid } : 'skip'
  )

  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { projectId: projectId as any } : 'skip'
  )

  const updateFileContent = useMutation(api.files.updateFileContent)

  const { mutate: executeCommand } = useCommandMutation()
  const { mutate: startPreview } = useStartPreviewMutation()
  const { mutate: stopPreview } = useStopPreviewMutation()
  const { mutate: runCodeMutation, isPending: isRunningCode } = useRunCodeMutation()
  const [pistonOutput, setPistonOutput] = useState<string | null>(null)

  const [sessionId] = useState(() => crypto.randomUUID())
  const [showTerminal, setShowTerminal] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code')
  const [sidebarTab, setSidebarTab] = useState('explorer')

  const [buffers, setBuffers] = useState<Record<string, string>>({})
  const [injectedUrl, setInjectedUrl] = useState('')
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // ---------------- Shortcuts ----------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ---------------- Load Files ----------------
  useEffect(() => {
    if (!projectFiles?.length) return

    setBuffers(prev => {
      const next = { ...prev }
      let hasNew = false
      projectFiles.forEach((f: any) => {
        if (next[f._id] === undefined) {
          next[f._id] = f.content || ''
          hasNew = true
        }
      })
      return hasNew ? next : prev
    })
  }, [projectFiles])

  useEffect(() => {
    if (projectFiles && projectFiles.length > 0 && openTab.length === 0) {
      openFile(projectFiles[0]._id)
    }
  }, [projectFiles, openTab.length, openFile])

  // ---------------- Active File ----------------
  const activeFile = useMemo(() => {
    if (!projectFiles) return null
    return projectFiles.find((f: any) => f._id === activeTabId)
  }, [projectFiles, activeTabId])

  // ---------------- Editor Change ----------------
  const handleContentChange = useCallback((value: string | undefined) => {
    if (!activeTabId || typeof value !== 'string') return

    setBuffers(prev => ({
      ...prev,
      [activeTabId]: value
    }))
  }, [activeTabId])

  // ---------------- Auto Save ----------------
  useEffect(() => {
    if (!activeTabId || !activeFile || !user) return

    const timer = setTimeout(async () => {
      try {
        const content = buffers[activeTabId] || ''

        await updateFileContent({
          fileId: activeTabId as any,
          content,
          userId: user.firebaseUid
        })

        // Sync to WebContainer
        const wc = await webcontainerService.load()
        await wc.fs.writeFile(activeFile.name, content)
      } catch (e) {
        console.error('Auto-save error:', e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [buffers, activeTabId, activeFile, user, updateFileContent])

  // ---------------- Sync Project to WebContainer ----------------
  useEffect(() => {
    if (!projectFiles?.length) return

    const syncAll = async () => {
      try {
        const wc = await webcontainerService.load()
        for (const file of projectFiles) {
          if (file.type === 'file') {
            // Ensure parent directory exists (simplistic for now)
            await wc.fs.writeFile(file.name, file.content || '')
          }
        }
      } catch (err) {
        console.error("WebContainer sync error:", err)
      }
    }
    syncAll()
  }, [projectFiles])

  // ---------------- Command ----------------
  const handleCommand = useCallback((command: string) => {
    if (!projectId) return

    executeCommand({ projectId, command }, {
      onSuccess: () => toast.success('Command executed'),
      onError: () => toast.error('Execution failed')
    })
  }, [projectId, executeCommand])

  // ---------------- Run ----------------
  const handleRun = useCallback(() => {
    if (!projectId) return

    const lang = project?.language?.toLowerCase() || 'vanilla'
    const isWeb = WEB_FRAMEWORKS.includes(lang)

    if (isWeb) {
      if (showPreview) {
        stopPreview(projectId)
        setShowPreview(false)
        setPreviewUrl('')
      } else {
        // Option A: Use backend preview
        startPreview({ projectId, framework: lang }, {
          onSuccess: (data) => {
            setPreviewUrl(data.url)
            setShowPreview(true)
            setActiveView('preview')
          }
        })

        // Option B: Also start in WebContainer for Terminal consistency
        webcontainerService.load().then(async (wc) => {
            // Check if package.json exists and run install if needed
            const files = await wc.fs.readdir('.');
            if (files.includes('package.json')) {
                const installProcess = await wc.spawn('npm', ['install']);
                installProcess.output.pipeTo(new WritableStream({
                    write(data) { console.log(data) }
                }));
                await installProcess.exit;

                await wc.spawn('npm', ['run', 'dev']);
                wc.on('server-ready', (_port, url) => {
                    setPreviewUrl(url);
                    setShowPreview(true);
                    setActiveView('preview');
                });
            }
        });
      }
    } else if (lang === 'node' || lang === 'javascript') {
        const fileName = activeFile?.name || 'app.js'
        toast.info(`Executing ${fileName} via WebContainer...`)
        setShowTerminal(true)
        webcontainerService.load().then(async (wc) => {
            await wc.spawn('node', [fileName]);
        })
    } else {
      const fileName = activeFile?.name || 'main.py'
      const pistonLanguages = ['python', 'java', 'c', 'cpp', 'go', 'rust', 'javascript']
      
      if (pistonLanguages.includes(lang)) {
        toast.info(`Executing ${lang} code...`)
        setPistonOutput(null)
        setShowTerminal(true)
        
        runCodeMutation({
          language: lang,
          code: buffers[activeTabId || ''] || ''
        }, {
          onSuccess: (data) => {
            const output = data.run?.output || data.compile?.output || "Execution finished with no output."
            setPistonOutput(output)
            toast.success("Run completed")
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.error || "Execution failed")
          }
        })
      } else {
        let cmd = ''
        switch (lang) {
          case 'python': cmd = `python3 ${fileName}`; break
          case 'java': cmd = `javac ${fileName} && java ${fileName.split('.')[0]}`; break
          case 'c': cmd = `gcc ${fileName} -o main && ./main`; break
          case 'cpp': cmd = `g++ ${fileName} -o main && ./main`; break
          default: cmd = `echo Running ${fileName}`
        }
        handleCommand(cmd)
      }
    }
  }, [projectId, project, showPreview, activeFile, activeTabId, buffers, startPreview, stopPreview, runCodeMutation, handleCommand])

  const commandActions = [
    { id: 'run', label: 'Run Code / Preview', icon: Play, shortcut: 'F5', action: handleRun },
    { id: 'terminal', label: 'Toggle Terminal', icon: Terminal, shortcut: 'Ctrl+`', action: () => setShowTerminal(s => !s) },
    { id: 'ai', label: 'Ask AI Assistant', icon: Sparkles, shortcut: 'Ctrl+L', action: () => setSidebarTab('ai') },
    { id: 'explorer', label: 'Show Explorer', icon: FileCode, action: () => setSidebarTab('explorer') },
    { id: 'save', label: 'Save File', icon: Zap, shortcut: 'Ctrl+S', action: () => toast.success('File saved') },
  ]

  const getLanguageFromExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext) return 'text'

    const map: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
    }

    return map[ext] || 'text'
  }

  // ---------------- Render ----------------
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f0f11] text-zinc-100 overflow-hidden font-sans">

      <TopBar
        projectName={project?.title}
        onPlay={handleRun}
        isPreviewRunning={showPreview}
        onToggleTerminal={() => setShowTerminal(s => !s)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* URL Context Bar */}
      <div className="bg-zinc-900/50 border-b border-[#222] px-4 py-1.5 flex items-center gap-3">
        <LinkIcon size={14} className="text-zinc-500" />
        <input
          placeholder="Paste documentation URL for AI context..."
          className="bg-transparent text-xs text-zinc-300 outline-none flex-1"
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const url = (e.target as HTMLInputElement).value
              setIsUrlLoading(true)

              try {
                const res = await axios.post(
                  `${import.meta.env.VITE_BACKEND_URL}/api/ai/extract`,
                  { url }
                )
                setInjectedUrl(res.data.content)
                try {
                  await handleRun()
                } catch (err) {
                  toast.error('Failed to boot environment')
                }
                toast.success('Context injected')
              } catch {
                toast.error('Failed to extract')
              } finally {
                setIsUrlLoading(false)
              }
            }
          }}
        />
        {isUrlLoading && <Loader2 size={12} className="animate-spin text-zinc-500" />}
      </div>

      <div className="flex-1 flex overflow-hidden">

        <PanelGroup direction="horizontal">

          {/* AI Panel */}
          <Panel defaultSize={20} minSize={15}>
            <AIPanel
              fileId={activeTabId || undefined}
              projectId={projectId}
              sessionId={sessionId}
              isOpen
              isEmbedded
              injectedUrlContent={injectedUrl}
            />
          </Panel>

          <PanelResizeHandle className="w-[1px] bg-[#222]" />

          {/* Sidebar */}
          <Panel defaultSize={15}>
            <Sidebar
              activeTab={sidebarTab}
              projectId={projectId as any}
              onCloseSidebar={() => setSidebarTab('none')}
              onFileSelect={(id) => openFile(id as Id<"files">)}
              activeFileId={activeTabId || undefined}
            />
          </Panel>

          <PanelResizeHandle className="w-[1px] bg-[#222]" />

          {/* Main */}
          <Panel defaultSize={65}>
            <div className="flex flex-col h-full">

              <TabStructure projectId={projectId as any} />

              <PanelGroup direction="vertical">

                <Panel defaultSize={70}>
                  {activeView === 'code' ? (
                    <MonacoEditor
                      language={getLanguageFromExtension(activeFile?.name || '')}
                      content={buffers[activeTabId || ''] || ''}
                      onContentChange={handleContentChange}
                    />
                  ) : (
                    <PreviewPanel
                      url={previewUrl}
                      isLoading={false}
                      onStop={handleRun}
                    />
                  )}
                </Panel>


                {showTerminal && (
                  <>
                    <PanelResizeHandle className="h-[1px] bg-[#222]" />
                    <Panel defaultSize={30}>
                      <div className="h-full w-full bg-[#0c0c0c] relative">
                        {pistonOutput !== null || isRunningCode ? (
                          <ExecutionOutput 
                            output={pistonOutput} 
                            isRunning={isRunningCode} 
                            onClear={() => setPistonOutput(null)} 
                          />
                        ) : (
                          <TerminalPanel projectId={projectId || ''} />
                        )}
                      </div>
                    </Panel>
                  </>
                )}

              </PanelGroup>
            </div>
          </Panel>

        </PanelGroup>
      </div>


      <StatusBar
        language={activeFile?.name || 'text'}
        lineCount={(buffers[activeTabId || ''] || '').split('\n').length}
        onToggleTerminal={() => setShowTerminal(s => !s)}
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        actions={commandActions}
      />
    </div>
  )
}