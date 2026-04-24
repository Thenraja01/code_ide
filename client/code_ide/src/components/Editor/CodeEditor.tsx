'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useQuery, useMutation } from 'convex/react'
import { api } from "@convex/_generated/api"
import * as Sentry from '@sentry/react'
import type { Id } from '../../../convex/_generated/dataModel'

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

import { Link, Loader2 } from 'lucide-react'
import { webcontainerService } from '@/services/WebContainerService'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './parts/Sidebar'
import axios from 'axios'
import { useEditor } from '@/hooks/useEditor'
import TabStructure from './parts/TabStructure'

const WEB_FRAMEWORKS = ['react', 'vanilla', 'express', 'fastapi', 'node', 'nextjs']

export default function CodeEditor() {
  const { projectId } = useParams()
  const { user } = useAuth()

  const {
    openTab,
    activeTabId,
    setActiveTab,
    openFile,
    closeTab
  } = useEditor(projectId as any)

  // ---------------- Convex ----------------
  const projectFiles = useQuery(api.files.getFilesByProject, {
    projectId: projectId as any,
    userId: user?.firebaseUid
  })

  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId as any
  })

  const updateFileContent = useMutation(api.files.updateFileContent)

  const { mutate: executeCommand } = useCommandMutation()
  const { mutate: startPreview } = useStartPreviewMutation()
  const { mutate: stopPreview } = useStopPreviewMutation()

  const [sessionId] = useState(() => crypto.randomUUID())
  const [showTerminal, setShowTerminal] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code')
  const [sidebarTab, setSidebarTab] = useState('explorer')

  const [buffers, setBuffers] = useState<Record<string, string>>({})
  const [injectedUrl, setInjectedUrl] = useState('')
  const [isUrlLoading, setIsUrlLoading] = useState(false)

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

        const wc = await webcontainerService.load()
        await wc.fs.writeFile(activeFile.name, content)

      } catch (e) {
        Sentry.captureException(e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [buffers, activeTabId, activeFile, user, updateFileContent])

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
  }, [projectId, project, showPreview, activeFile, startPreview, stopPreview, handleCommand])

  // ---------------- Language Detection ----------------
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
        <Link size={14} className="text-zinc-500" />
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
                      <TerminalPanel projectId={projectId || ''} />
                    </Panel>
                  </>
                )}

              </PanelGroup>
            </div>
          </Panel>

        </PanelGroup>
      </div>

      {/* ✅ FIXED HERE */}
      <StatusBar
        language={activeFile?.name || 'text'}
        lineCount={(buffers[activeTabId || ''] || '').split('\n').length}
        onToggleTerminal={() => setShowTerminal(s => !s)}
      />
    </div>
  )
}