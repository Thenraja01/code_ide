import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Loader2, Play, Zap, Bug, FileText, FlaskConical,
  BookOpen, X, StopCircle, ChevronDown, Send, Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import ReactMarkdown from 'react-markdown'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AIPanelProps {
  isOpen: boolean
  onClose?: () => void
  isEmbedded?: boolean
  fileId?: string
  sessionId?: string
  projectId?: string
  injectedUrlContent?: string
  activeFileContent?: string
}

// ─── AI Action Modes ──────────────────────────────────────────────────────────
const AI_MODES = [
  { id: 'chat',    label: 'Chat',     icon: Bot,         color: 'text-blue-400',   desc: 'Ask anything about your code' },
  { id: 'explain', label: 'Explain',  icon: BookOpen,    color: 'text-emerald-400', desc: 'Explain the current file' },
  { id: 'bugs',    label: 'Find Bugs',icon: Bug,         color: 'text-red-400',    desc: 'Detect bugs & security issues' },
  { id: 'tests',   label: 'Tests',    icon: FlaskConical,color: 'text-violet-400', desc: 'Generate test suite' },
  { id: 'docs',    label: 'Docs',     icon: FileText,    color: 'text-amber-400',  desc: 'Generate documentation' },
] as const

type AiMode = typeof AI_MODES[number]['id']

// ─── WebSocket hook for streaming ─────────────────────────────────────────────
function useAiWebSocket(sessionId: string | undefined, onToken: (t: string) => void, onDone: () => void) {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const wsUrl = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/^http/, 'ws')}?sessionId=${sessionId}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'token') onToken(msg.token)
        else if (msg.type === 'stream_end') onDone()
        else if (msg.type === 'error') { console.error('[WS AI]', msg.message); onDone() }
        else if (msg.type === 'abort') onDone()
      } catch {}
    }

    ws.onerror = () => toast.error('AI connection error')

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [sessionId])

  return wsRef
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIPanel({
  isOpen,
  onClose,
  isEmbedded = false,
  fileId,
  sessionId,
  projectId,
  injectedUrlContent,
  activeFileContent,
}: AIPanelProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<AiMode>('chat')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const updateFileContent = useMutation(api.files.updateFileContent)
  const createFile = useMutation(api.files.createFile)
  const deleteFile = useMutation(api.files.deleteFile)
  const projectFiles = useQuery(api.files.getFilesByProject, projectId ? { projectId: projectId as any } : 'skip')

  const addToken = useCallback((token: string) => {
    setMessages(prev => {
      const msgs = [...prev]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant' && last.id === streamingId) {
        msgs[msgs.length - 1] = { ...last, content: last.content + token }
      }
      return msgs
    })
  }, [streamingId])

  const onStreamDone = useCallback(() => {
    setIsStreaming(false)
    setStreamingId(null)
  }, [])

  const wsRef = useAiWebSocket(sessionId, addToken, onStreamDone)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Parse and apply file operations from agent response
  const applyFileOperations = useCallback(async (content: string) => {
    const creates = content.matchAll(/CREATE_FILE: ([\w\/\.\-]+)\n```\w*\n([\s\S]*?)```/g)
    for (const [, path, code] of creates) {
      const name = path.split('/').pop() || 'newfile.txt'
      try {
        await createFile({ name, content: code.trim(), projectId: projectId as any, userId: user?.firebaseUid })
        toast.success(`Created: ${path}`)
      } catch {}
    }

    const edits = content.matchAll(/EDIT_FILE: ([\w\/\.\-]+)\n<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>>/g)
    for (const [, path, search, replace] of edits) {
      const name = path.split('/').pop()
      const file = projectFiles?.find((f: any) => f.name === name)
      if (file && file.content?.includes(search.trim())) {
        await updateFileContent({ fileId: file._id, content: file.content.replace(search.trim(), replace.trim()), userId: user?.firebaseUid })
        toast.success(`Updated: ${path}`)
      }
    }

    const deletes = content.matchAll(/DELETE_FILE: ([\w\/\.\-]+)/g)
    for (const [, path] of deletes) {
      const name = path.split('/').pop()
      const file = projectFiles?.find((f: any) => f.name === name)
      if (file) {
        await deleteFile({ fileId: file._id, userId: user?.firebaseUid })
        toast.warning(`Deleted: ${path}`)
      }
    }
  }, [projectId, projectFiles, user, createFile, updateFileContent, deleteFile])

  const handleSend = useCallback(async (overridePrompt?: string) => {
    const text = (overridePrompt ?? input).trim()
    if (!text || isStreaming) return

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')
    const token = localStorage.getItem('token')

    // Add user message
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setStreamingId(assistantId)
    setInput('')
    setIsStreaming(true)

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const context = injectedUrlContent || ''

    // Decide endpoint based on mode
    const endpoint = mode === 'chat' ? '/ai/chat' : '/ai/agent'
    const body = mode === 'chat'
      ? { messages: [...history, { role: 'user', content: text }], sessionId, projectId }
      : { prompt: text, sessionId, context, projectId, mode }

    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      // If WS streaming confirmed, tokens arrive via websocket — nothing else to do
      if (data.streaming === 'websocket') return

      // SSE fallback
      if (!res.body) throw new Error('No response body')
      // SSE is handled inline via the fetch response when not WS
    } catch (err: any) {
      toast.error('AI request failed')
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '⚠️ Failed to get response. Please try again.' } : m))
      setIsStreaming(false)
      setStreamingId(null)
    }
  }, [input, isStreaming, messages, mode, sessionId, projectId, injectedUrlContent])

  // Quick-action for non-chat modes (send active file content automatically)
  const handleQuickAction = useCallback(async (actionMode: AiMode) => {
    if (!activeFileContent && actionMode !== 'chat') {
      toast.info('Open a file first')
      return
    }
    setMode(actionMode)
    const modeLabels: Record<string, string> = {
      explain: 'Explain this code in detail.',
      bugs: 'Find and list all bugs and security issues in this code.',
      tests: 'Generate a comprehensive test suite for this code.',
      docs: 'Generate complete documentation for this code.',
    }
    const prompt = modeLabels[actionMode]
    const fullPrompt = `${prompt}\n\n\`\`\`\n${activeFileContent}\n\`\`\``
    await handleSend(fullPrompt)
  }, [activeFileContent, handleSend])

  const handleStop = () => {
    if (!sessionId) return
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'abort' }))
    setIsStreaming(false)
    setStreamingId(null)
  }

  const activeMessage = useMemo(() => messages.find(m => m.id === streamingId), [messages, streamingId])

  // Trigger file operations after streaming completes
  useEffect(() => {
    if (!isStreaming && streamingId === null && messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last?.role === 'assistant' && last.content && mode === 'agent') {
        applyFileOperations(last.content)
      }
    }
  }, [isStreaming])

  const panelContent = (
    <div className="flex flex-col h-full bg-[#0d0d10] text-zinc-100">

      {/* Header */}
      <div className="h-11 shrink-0 border-b border-[#1e1e24] flex items-center justify-between px-3 bg-[#111114]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/20 flex items-center justify-center">
            <Sparkles size={12} className="text-violet-400" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <button onClick={handleStop} className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] hover:bg-red-500/20 transition-colors">
              <StopCircle size={10} />
              Stop
            </button>
          )}
          {!isEmbedded && onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="shrink-0 border-b border-[#1e1e24] bg-[#0d0d10]">
        <div className="flex overflow-x-auto scrollbar-hide px-2 pt-2 pb-0 gap-0.5">
          {AI_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-t-md transition-all shrink-0 border-b-2',
                mode === m.id
                  ? `bg-[#16161a] border-violet-500 text-white`
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#13131a]'
              )}
            >
              <m.icon size={11} className={mode === m.id ? m.color : ''} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 py-6 px-2"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/10">
                <Sparkles size={20} className="text-violet-400" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {AI_MODES.find(m => m.id === mode)?.desc}
              </p>
            </div>

            {/* Quick actions for non-chat modes */}
            {mode !== 'chat' && activeFileContent && (
              <button
                onClick={() => handleQuickAction(mode)}
                disabled={isStreaming}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold hover:bg-violet-500/20 transition-all disabled:opacity-50 mt-2"
              >
                <Sparkles size={12} />
                Run on Current File
              </button>
            )}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('text-xs leading-relaxed', msg.role === 'user' ? 'text-right' : '')}
            >
              {msg.role === 'user' ? (
                <div className="inline-block max-w-[90%] px-3 py-2 rounded-xl rounded-tr-sm bg-violet-600/20 border border-violet-500/20 text-zinc-200 text-left">
                  {msg.content}
                </div>
              ) : (
                <div className={cn(
                  'prose prose-invert prose-xs max-w-none text-zinc-300',
                  msg.id === streamingId && 'after:inline-block after:w-0.5 after:h-3 after:bg-violet-400 after:ml-0.5 after:animate-pulse'
                )}>
                  {msg.content ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Thinking…</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#1e1e24] bg-[#0d0d10] p-3">
        {/* Suggested actions */}
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {[
            { label: 'Explain', icon: BookOpen, action: () => handleQuickAction('explain') },
            { label: 'Bugs',    icon: Bug,       action: () => handleQuickAction('bugs') },
            { label: 'Tests',   icon: FlaskConical, action: () => handleQuickAction('tests') },
            { label: 'Docs',    icon: FileText,  action: () => handleQuickAction('docs') },
          ].map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={action}
              disabled={isStreaming || !activeFileContent}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a1a22] border border-[#2a2a35] text-[10px] text-zinc-400 hover:text-white hover:border-violet-500/40 transition-all active:scale-95 disabled:opacity-40"
            >
              <Icon size={9} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex items-end gap-2 bg-[#111115] border border-[#2a2a35] rounded-xl px-3 py-2.5 focus-within:border-violet-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            placeholder={mode === 'chat' ? 'Ask AI…' : `Prompt for ${mode}…`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-xs text-zinc-200 outline-none resize-none placeholder:text-zinc-600 leading-relaxed max-h-32 disabled:opacity-50"
            style={{ fieldSizing: 'content' } as any}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-[#1e1e28] disabled:text-zinc-600 text-white transition-all shadow-lg shadow-violet-500/20"
          >
            <Send size={11} />
          </button>
        </div>

        <p className="text-center text-[9px] text-zinc-700 mt-1.5">
          Powered by Claude · <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for newline
        </p>
      </div>
    </div>
  )

  if (isEmbedded) return isOpen ? panelContent : null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 z-30 w-[340px] shadow-2xl border-l border-[#1e1e24]"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
