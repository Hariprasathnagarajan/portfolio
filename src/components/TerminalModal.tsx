import { useEffect, useRef, useState, useId } from 'react'
import { Terminal as TerminalIcon, X, CornerDownLeft, Sparkles } from 'lucide-react'

interface TerminalModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandLog {
  id: string
  command?: string
  output: string | React.ReactNode
  type?: 'cmd' | 'system' | 'error' | 'success'
}

export function TerminalModal({ isOpen, onClose }: TerminalModalProps) {
  const [inputVal, setInputVal] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const terminalEndRef = useRef<HTMLDivElement | null>(null)
  const commandInputId = useId()

  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      output: (
        <div>
          <span className="term-highlight">HN/ Developer Environment [v2.6.0]</span>
          <br />
          Type <span className="term-code">&apos;help&apos;</span> to inspect commands or <span className="term-code">&apos;exit&apos;</span> to close.
        </div>
      ),
      type: 'system',
    },
  ])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 80)
    }
  }, [isOpen])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Global escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (!trimmed) return

    setHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)

    const cmdLower = trimmed.toLowerCase()
    const newLogs: CommandLog[] = [
      ...logs,
      { id: String(Date.now()), command: trimmed, output: '', type: 'cmd' },
    ]

    switch (cmdLower) {
      case 'help':
        newLogs.push({
          id: String(Date.now() + 1),
          output: (
            <div className="term-help-list">
              <div><strong className="term-code">about</strong> — Learn about Hariprasath Nagarajan</div>
              <div><strong className="term-code">skills</strong> — View core tech stack & competencies</div>
              <div><strong className="term-code">projects</strong> — View featured engineering projects</div>
              <div><strong className="term-code">live</strong> — View live websites contributed to</div>
              <div><strong className="term-code">contact</strong> — Get direct email & LinkedIn</div>
              <div><strong className="term-code">clear</strong> — Clear terminal history</div>
              <div><strong className="term-code">sudo</strong> — Attempt elevated privileges</div>
              <div><strong className="term-code">exit</strong> — Close this terminal</div>
            </div>
          ),
          type: 'system',
        })
        break

      case 'about':
        newLogs.push({
          id: String(Date.now() + 1),
          output: (
            <div>
              <p>
                <strong>Hariprasath Nagarajan</strong> is a computer science postgraduate and developer focused on building
                responsive web applications, practical backend systems, and AI-powered tools.
              </p>
              <p style={{ color: '#989189' }}>
                Based in Trichy, India. Currently available for Full-Stack, Python, and AI engineering opportunities.
              </p>
            </div>
          ),
          type: 'success',
        })
        break

      case 'skills':
        newLogs.push({
          id: String(Date.now() + 1),
          output: (
            <div className="term-skills-output">
              <div><strong>Frontend:</strong> React, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS</div>
              <div><strong>Backend:</strong> Python, Django, Django REST Framework, REST APIs, JWT Auth</div>
              <div><strong>Databases:</strong> PostgreSQL, SQLite</div>
              <div><strong>AI / RAG:</strong> LangChain, FAISS, LLM APIs, Vector Retrieval</div>
              <div><strong>Tools:</strong> Git, GitHub, VS Code, Postman, Vite</div>
            </div>
          ),
          type: 'system',
        })
        break

      case 'projects':
        newLogs.push({
          id: String(Date.now() + 1),
          output: (
            <div>
              <div style={{ marginBottom: '0.4rem' }}><strong>Featured Projects:</strong></div>
              <div>1. <span className="term-code">AI Document Research Assistant</span> (RAG, Python, FAISS)</div>
              <div>2. <span className="term-code">Learning Management System</span> (React, Django REST, JWT)</div>
              <div>3. <span className="term-code">Real-Time Meeting Platform</span> (WebRTC, Next.js)</div>
              <div>4. <span className="term-code">Python AI Assistant</span> (Ollama, Streamlit, FastAPI)</div>
            </div>
          ),
          type: 'system',
        })
        break

      case 'live':
        newLogs.push({
          id: String(Date.now() + 1),
          output: (
            <div>
              <div style={{ marginBottom: '0.4rem' }}><strong>Live Website Contributions:</strong></div>
              <div>• <strong>VDart Academy</strong>: https://vdartacademy.com/ (Complete Redesign)</div>
              <div>• <strong>VNavigate</strong>: https://vnavigate.com/ (Designed & Developed from Scratch)</div>
              <div>• <strong>VBooking</strong>: https://vbooking.com/ (Developed from Scratch)</div>
            </div>
          ),
          type: 'success',
        })
        break

      case 'contact':
        newLogs.push({
          id: String(Date.now() + 1),
          output: (
            <div>
              <div>Email: <strong>hariprasathnagarajan24@gmail.com</strong></div>
              <div>GitHub: https://github.com/Hariprasathnagarajan</div>
              <div>LinkedIn: https://linkedin.com/in/hariprasath-nagarajan</div>
            </div>
          ),
          type: 'success',
        })
        break

      case 'clear':
        setLogs([])
        setInputVal('')
        return

      case 'sudo':
      case 'sudo rm -rf /':
        newLogs.push({
          id: String(Date.now() + 1),
          output: 'Access denied: Admin root privileges are reserved for hiring managers!',
          type: 'error',
        })
        break

      case 'exit':
      case 'quit':
        onClose()
        return

      default:
        newLogs.push({
          id: String(Date.now() + 1),
          output: `Command not recognized: "${trimmed}". Type 'help' for available commands.`,
          type: 'error',
        })
    }

    setLogs(newLogs)
    setInputVal('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInputVal(history[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (history.length === 0 || historyIndex === -1) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= history.length) {
        setHistoryIndex(-1)
        setInputVal('')
      } else {
        setHistoryIndex(nextIndex)
        setInputVal(history[nextIndex])
      }
    }
  }

  return (
    <div className="terminal-overlay" role="dialog" aria-modal="true" aria-label="Interactive Developer Terminal">
      <div className="terminal-overlay__backdrop" onClick={onClose} />

      <div className="terminal-window">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-header__dots">
            <span className="dot dot--red" onClick={onClose} title="Close Terminal" />
            <span className="dot dot--yellow" title="Minimize" />
            <span className="dot dot--green" title="Expand" />
          </div>

          <div className="terminal-header__title">
            <TerminalIcon size={14} />
            <span>hariprasath@portfolio: ~ (zsh)</span>
          </div>

          <button className="terminal-close-btn" onClick={onClose} aria-label="Close terminal">
            <X size={15} />
          </button>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {logs.map((log) => (
            <div key={log.id} className={`term-line term-line--${log.type}`}>
              {log.command && (
                <div className="term-prompt-line">
                  <span className="term-user">hariprasath@portfolio</span>
                  <span className="term-colon">:</span>
                  <span className="term-path">~</span>
                  <span className="term-symbol">$</span>
                  <span className="term-cmd-text">{log.command}</span>
                </div>
              )}
              {log.output && <div className="term-output">{log.output}</div>}
            </div>
          ))}

          {/* Active Input Line */}
          <form onSubmit={handleCommand} className="term-input-form">
            <label htmlFor={commandInputId} className="term-prompt-line">
              <span className="term-user">hariprasath@portfolio</span>
              <span className="term-colon">:</span>
              <span className="term-path">~</span>
              <span className="term-symbol">$</span>
            </label>
            <input
              ref={inputRef}
              id={commandInputId}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              className="term-input"
            />
            <button type="submit" className="term-submit-btn" aria-label="Execute command">
              <CornerDownLeft size={12} />
            </button>
          </form>

          <div ref={terminalEndRef} />
        </div>

        <div className="terminal-footer">
          <span>Tip: Press <kbd>Esc</kbd> to close · Type <kbd>help</kbd> for commands</span>
          <span className="terminal-footer__brand"><Sparkles size={11} /> HN/ Terminal</span>
        </div>
      </div>
    </div>
  )
}
