import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Send, Plus, Trash2, StopCircle,
  Bot, User, Copy, Check, ChevronRight, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

// ─── Lightweight markdown renderer ───────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    // fenced code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="ai-code-block" data-lang="${lang || 'code'}"><code>${escHtml(code.trim())}</code></pre>`
    )
    // inline code
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    // bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="ai-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="ai-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="ai-h1">$1</h1>')
    // unordered lists
    .replace(/^\s*[-*] (.+)$/gm, '<li class="ai-li">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="ai-ul">$1</ul>')
    // ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ai-oli">$1</li>')
    // line breaks (double newline = paragraph)
    .replace(/\n\n/g, '</p><p class="ai-p">')
    .replace(/^(.+)$/gm, (line) =>
      line.startsWith('<') ? line : `<p class="ai-p">${line}</p>`
    )
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: 'Explain async/await', icon: '⚡' },
  { label: 'Review my code for bugs', icon: '🔍' },
  { label: 'Best practices for React', icon: '⚛️' },
  { label: 'Write a REST API in Express', icon: '🚀' },
  { label: 'How does TypeScript generics work?', icon: '📘' },
  { label: 'Optimize a slow SQL query', icon: '🗄️' },
]

function newId() {
  return Math.random().toString(36).slice(2)
}

function newConversation(): Conversation {
  return { id: newId(), title: 'New Chat', messages: [], createdAt: new Date() }
}

// ─── Code block with copy button ─────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false)

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const isUser = msg.role === 'user'
  const html = isUser ? msg.content : renderMarkdown(msg.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md',
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground border border-border'
      )}>
        {isUser ? <User size={14} /> : <Bot size={14} className="text-primary" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        'relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-card text-foreground border border-border rounded-tl-sm'
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div
            className="ai-markdown"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {/* Copy button for assistant */}
        {!isUser && msg.content && (
          <button
            onClick={() => copyCode(msg.content)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted"
            title="Copy response"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-muted-foreground" />}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AiChat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([newConversation()])
  const [activeId, setActiveId] = useState<string>(conversations[0].id)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId] = useState(newId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<(() => void) | null>(null)

  const activeConv = conversations.find(c => c.id === activeId)!

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
    }
  }, [input])

  const updateConv = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c))
  }, [])

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || isStreaming) return

    const userMsg: Message = { id: newId(), role: 'user', content: text, timestamp: new Date() }
    const assistantId = newId()
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }

    // Set conversation title from first message
    updateConv(activeId, c => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
      messages: [...c.messages, userMsg, assistantMsg]
    }))

    setInput('')
    setIsStreaming(true)

    const allMessages = [...activeConv.messages, userMsg]

    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')
      const controller = new AbortController()
      abortRef.current = () => controller.abort()

      const res = await fetch(`${baseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), sessionId }),
        signal: controller.signal
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value)
        buffer += raw

        // Parse SSE lines
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break
          try {
            const json = JSON.parse(payload)
            const delta = json?.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              updateConv(activeId, c => ({
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + delta } : m
                )
              }))
            }
          } catch { /* non-JSON chunk, skip */ }
        }
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.info('Generation stopped')
      } else {
        toast.error('AI response failed')
        updateConv(activeId, c => ({
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantId ? { ...m, content: '⚠️ Failed to get response. Please try again.' } : m
          )
        }))
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [input, isStreaming, activeId, activeConv, updateConv, sessionId])

  const handleStop = () => {
    abortRef.current?.()
  }

  const handleNewChat = () => {
    const c = newConversation()
    setConversations(prev => [c, ...prev])
    setActiveId(c.id)
  }

  const handleDelete = (id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)
      if (next.length === 0) {
        const fresh = newConversation()
        setActiveId(fresh.id)
        return [fresh]
      }
      if (id === activeId) setActiveId(next[0].id)
      return next
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Inline styles for markdown rendering */}
      <style>{`
        .ai-markdown p.ai-p { margin: 0.35rem 0; }
        .ai-markdown h1.ai-h1, .ai-markdown h2.ai-h2, .ai-markdown h3.ai-h3
          { font-weight: 700; margin: 0.75rem 0 0.25rem; }
        .ai-markdown h1.ai-h1 { font-size: 1.2rem; }
        .ai-markdown h2.ai-h2 { font-size: 1.05rem; }
        .ai-markdown h3.ai-h3 { font-size: 0.95rem; }
        .ai-markdown ul.ai-ul { padding-left: 1.25rem; list-style: disc; margin: 0.35rem 0; }
        .ai-markdown li.ai-li, .ai-markdown li.ai-oli { margin: 0.15rem 0; }
        .ai-inline-code {
          font-family: 'Fira Code', monospace;
          background: var(--muted);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.8em;
        }
        .ai-code-block {
          position: relative;
          background: var(--secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1rem;
          margin: 0.6rem 0;
          overflow-x: auto;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 0.78rem;
          line-height: 1.6;
        }
        .ai-code-block::before {
          content: attr(data-lang);
          position: absolute;
          top: 6px;
          right: 10px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted-foreground);
          font-family: sans-serif;
        }
      `}</style>

      <div className="flex h-full overflow-hidden bg-background text-foreground">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">

          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <span className="font-black text-sm tracking-tight">CodeSphere AI</span>
          </div>

          {/* New Chat */}
          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>

          {/* Conversation list */}
          <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5 font-bold">Recent</p>
            <AnimatePresence>
              {conversations.map(c => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm',
                    c.id === activeId
                      ? 'bg-primary/15 text-foreground font-semibold border border-primary/20'
                      : 'hover:bg-secondary text-muted-foreground'
                  )}
                  onClick={() => setActiveId(c.id)}
                >
                  <ChevronRight size={12} className={cn('flex-shrink-0 transition-transform', c.id === activeId && 'text-primary rotate-90')} />
                  <span className="flex-1 truncate text-xs">{c.title}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(c.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>

          {/* User badge */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-secondary">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">
                {user?.name?.[0] ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name ?? 'Developer'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main chat area ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <div className="h-12 border-b border-border flex items-center justify-between px-5 bg-card/60 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-primary" />
              <span className="text-sm font-bold">{activeConv.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Loader2 size={12} className="animate-spin text-primary" />
                  Generating…
                </motion.div>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                Jamba 1.5 Mini
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {activeConv.messages.length === 0 ? (
              // Empty state
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full gap-6 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl">
                  <Sparkles size={28} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-1">CodeSphere AI</h2>
                  <p className="text-muted-foreground text-sm">Your intelligent coding assistant. Ask anything.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl w-full mt-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.label)}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border text-left text-xs hover:border-primary/40 hover:bg-secondary transition-all group"
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              activeConv.messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))
            )}

            {/* Streaming indicator on empty assistant message */}
            {isStreaming && activeConv.messages.at(-1)?.content === '' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="p-4 border-t border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 bg-secondary border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors shadow-lg">
                <textarea
                  ref={textareaRef}
                  id="ai-chat-input"
                  aria-label="Message CodeSphere AI"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message CodeSphere AI…"
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed max-h-44 disabled:opacity-50"
                />
                <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
                  {isStreaming ? (
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors text-xs font-bold"
                    >
                      <StopCircle size={14} />
                      Stop
                    </button>
                  ) : (
                    <button
                      id="ai-chat-send"
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-all shadow-md disabled:cursor-not-allowed"
                    >
                      <Send size={15} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-mono">Shift+Enter</kbd> for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
