'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useQuery, useMutation } from 'convex/react'
import { api } from "@convex/_generated/api"
import * as Sentry from '@sentry/react'

import MonacoEditor from './parts/MonacoEditor'
import StatusBar from './parts/StatusBar'
import TopBar from './parts/TopBar'
import AIPanel from './parts/AIPanel'
import TerminalPanel from '../Terminal/TerminalPanel'
import PreviewPanel from '../Preview/PreviewPanel'

import {
  useCommandMutation, 
  useStartPreviewMutation,
  useStopPreviewMutation
} from '@/hooks/useExecution.hooks'
import { Sparkles, Globe, Link, Loader2 } from 'lucide-react'
import { webcontainerService } from '@/services/WebContainerService'


import Sidebar from './parts/Sidebar'
import axios from 'axios'

const WEB_FRAMEWORKS = ['react', 'vanilla', 'express', 'fastapi', 'node', 'nextjs']

export default function CodeEditor() {
  const { projectId } = useParams<{ projectId: string }>()

  // ---------------- Convex ----------------
  const projectFiles = useQuery(api.files.getFilesByProject, {
    projectId: projectId as any
  })

  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId as any
  })

  const updateFileContent = useMutation(api.files.updateFileContent)

  const { mutate: executeCommand } = useCommandMutation()
  const { mutate: startPreview } = useStartPreviewMutation()
  const { mutate: stopPreview } = useStopPreviewMutation()

  const [sessionId] = useState(() => crypto.randomUUID())
  const [activeFileId, setActiveFileId] = useState('')
  const [showTerminal, setShowTerminal] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code')
  const [activeTab, setActiveTab] = useState('explorer')

  const [buffers, setBuffers] = useState<Record<string, string>>({})
  const [injectedUrl, setInjectedUrl] = useState('')
  const [isUrlLoading, setIsUrlLoading] = useState(false)

  useEffect(() => {
    if (!projectFiles?.length) return

    const newBuffers: Record<string, string> = {}

    projectFiles.forEach((f: any) => {
      newBuffers[f._id] = f.content || ''
    })

    setBuffers(newBuffers)

    if (!activeFileId) {
      setActiveFileId(projectFiles[0]?._id || '')
    }
  }, [projectFiles])

  const activeFile = useMemo(() => {
    if (!projectFiles) return null
    return projectFiles.find((f: any) => f._id === activeFileId)
  }, [projectFiles, activeFileId])

  const handleContentChange = useCallback((value: string | undefined) => {
    if (!activeFileId || typeof value !== 'string') return

    setBuffers(prev => ({
      ...prev,
      [activeFileId]: value
    }))
  }, [activeFileId])

  useEffect(() => {
    if (!activeFileId) return

    const timer = setTimeout(async () => {
      try {
        await updateFileContent({
          fileId: activeFileId as any,
          content: buffers[activeFileId] || ''
        })

        // Sync to WebContainer
        if (activeFile) {
           const wc = await webcontainerService.load();
           await wc.fs.writeFile(activeFile.name, buffers[activeFileId] || '');
        }
      } catch (e) {
        Sentry.captureException(e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [buffers, activeFileId])

  // ---------------- RUN COMMAND ----------------
  const handleCommand = useCallback((command: string) => {
    if (!projectId) return

    executeCommand({ projectId, command }, {
      onSuccess: () => toast.success('Command executed'),
      onError: () => toast.error('Execution failed')
    })
  }, [projectId])

  // ---------------- RUN / PREVIEW ----------------
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
        startPreview({ projectId, framework: lang }, {
          onSuccess: (data) => {
            setPreviewUrl(data.url)
            setShowPreview(true)
            setActiveView('preview')
          }
        })
      }
    } else {
      const fileName = activeFile?.name || 'main.py'
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
  }, [projectId, project, showPreview, activeFile])

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

  // ---------------- RENDER ----------------
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

      <div className="bg-zinc-900/50 border-b border-[#222] px-4 py-1.5 flex items-center gap-3">
        <Link size={14} className="text-zinc-500" />
        <input 
          placeholder="Paste documentation URL for AI context..."
          className="bg-transparent text-xs text-zinc-300 outline-none flex-1"
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value;
                setIsUrlLoading(true);
                try {
                    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/extract`, { url });
                    setInjectedUrl(response.data.content);
                    toast.success('Context injected from URL');
                } catch (err) {
                    toast.error('Failed to extract URL content');
                } finally {
                    setIsUrlLoading(false);
                }
            }
          }}
        />
        {isUrlLoading && <Loader2 size={12} className="animate-spin text-zinc-500" />}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">

        <PanelGroup direction="horizontal">
          {/* 1. AI CHAT (FAR LEFT) */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <AIPanel
              currentCode={buffers[activeFileId] || ''}
              fileId={activeFileId}
              sessionId={sessionId}
              isOpen={true}
              onClose={() => {}}
              isEmbedded={true}
              injectedUrlContent={injectedUrl}
            />
          </Panel>

          <PanelResizeHandle className="w-[1px] bg-[#222]" />

          {/* 2. EXPLORER (LEFT-CENTER) */}
          <Panel defaultSize={15} minSize={10} maxSize={25}>
            <Sidebar
              activeTab={activeTab}
              files={(projectFiles || []).map((f:any) => ({...f, id: f._id}))}
              activeFileId={activeFileId}
              setActiveFileId={setActiveFileId}
              onNewFile={() => {}}
              onCloseSidebar={() => setActiveTab('none')}
            />
          </Panel>

          <PanelResizeHandle className="w-[1px] bg-[#222]" />

          {/* 3. CENTER VIEW (EDITOR OR PREVIEW) */}
          <Panel defaultSize={65}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70}>
                {activeView === 'code' ? (
                  <MonacoEditor
                    language={getLanguageFromExtension(activeFile?.name || '')}
                    content={buffers[activeFileId] || ''}
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
                     <div className="h-full w-full bg-[#09090b]">
                        <TerminalPanel projectId={projectId || ''} />
                     </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar
        language={activeFile?.name || 'text'}
        lineCount={(buffers[activeFileId] || '').split('\n').length}
        onToggleTerminal={() => setShowTerminal(s => !s)}
      />
    </div>
  )
}
