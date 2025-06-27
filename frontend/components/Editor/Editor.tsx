'use client'

import { useEffect, useState, useCallback } from 'react'
import { Page } from '@/lib/types'
import { pageStore } from '@/lib/store'
// import RichEditor from './RichEditor'
// import CommandPalette from '../CommandPalette/CommandPalette'
// import AIPanel from '../AIPanel/AIPanel'
import styles from './Editor.module.css'
import toast from 'react-hot-toast'

interface EditorProps {
  pageId: string
}

// Temporary inline components to test
const RichEditor = ({ content, onChange, onAICommand }: any) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          // Toggle bold (would need proper rich text implementation)
          break
        case 'i':
          e.preventDefault()
          // Toggle italic
          break
        case 'k':
          e.preventDefault()
          onAICommand?.('improve')
          break
        case 's':
          e.preventDefault()
          toast.success('Auto-saved!')
          break
      }
    }
    
    // Slash commands
    if (e.key === '/') {
      const selection = window.getSelection()
      if (selection && selection.toString() === '') {
        // Show command palette
        onAICommand?.('slash')
      }
    }
  }

  return (
    <div className={`${styles.richEditor} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button className={styles.toolbarButton} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button className={styles.toolbarButton} title="Italic (Ctrl+I)">
            <em>I</em>
          </button>
          <button className={styles.toolbarButton} title="Code">
            <code>{'<>'}</code>
          </button>
        </div>
        
        <div className={styles.toolbarGroup}>
          <button className={styles.toolbarButton} title="Heading 1">H1</button>
          <button className={styles.toolbarButton} title="Heading 2">H2</button>
          <button className={styles.toolbarButton} title="Bullet List">•</button>
          <button className={styles.toolbarButton} title="Numbered List">1.</button>
          <button className={styles.toolbarButton} title="Task List">☐</button>
        </div>
        
        <div className={styles.toolbarGroup}>
          <button 
            className={styles.toolbarButton} 
            title="AI Assistant (Ctrl+K)"
            onClick={() => onAICommand?.('improve')}
          >
            🤖
          </button>
          <button 
            className={styles.toolbarButton} 
            title="Fullscreen"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>
      
      <textarea 
        value={content} 
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.editorTextarea}
        placeholder="Type '/' for commands, or start writing..."
        style={{ 
          width: '100%', 
          minHeight: '400px',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          lineHeight: '1.6',
          padding: '20px',
          fontFamily: 'inherit'
        }}
      />
    </div>
  )
}

const CommandPalette = ({ isOpen, onClose, onCommand, position }: any) => {
  const [search, setSearch] = useState('')
  
  const commands = [
    { id: 'text', title: 'Text', action: 'paragraph', icon: '📝' },
    { id: 'h1', title: 'Heading 1', action: 'heading1', icon: 'H1' },
    { id: 'h2', title: 'Heading 2', action: 'heading2', icon: 'H2' },
    { id: 'bullet', title: 'Bullet List', action: 'bulletList', icon: '•' },
    { id: 'number', title: 'Numbered List', action: 'orderedList', icon: '1.' },
    { id: 'todo', title: 'To-do List', action: 'taskList', icon: '☐' },
    { id: 'code', title: 'Code Block', action: 'codeBlock', icon: '<>' },
    { id: 'quote', title: 'Quote', action: 'blockquote', icon: '"' },
    { id: 'ai', title: 'Ask AI', action: 'ai', icon: '🤖' },
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className={styles.commandPalette} style={position}>
      <input
        type="text"
        placeholder="Search commands..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.commandInput}
        autoFocus
      />
      <div className={styles.commandList}>
        {filteredCommands.map((cmd) => (
          <button
            key={cmd.id}
            className={styles.commandItem}
            onClick={() => {
              onCommand(cmd.action)
              onClose()
            }}
          >
            <span className={styles.commandIcon}>{cmd.icon}</span>
            <span>{cmd.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const AIPanel = ({ isOpen, onClose, onGenerate, selectedText }: any) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const aiCommands = [
    { id: 'improve', label: 'Improve writing', icon: '✨' },
    { id: 'continue', label: 'Continue writing', icon: '➡️' },
    { id: 'summarize', label: 'Make it shorter', icon: '📝' },
    { id: 'expand', label: 'Make it longer', icon: '📄' },
    { id: 'simplify', label: 'Simplify language', icon: '🎯' },
    { id: 'formal', label: 'Make it formal', icon: '👔' },
    { id: 'casual', label: 'Make it casual', icon: '😊' },
    { id: 'bullets', label: 'Convert to bullets', icon: '•' },
  ]

  const handleCommand = async (command: string) => {
    setIsLoading(true)
    const fullPrompt = selectedText 
      ? `${command}: ${selectedText}` 
      : prompt || 'Generate content'
    
    await onGenerate(fullPrompt, command)
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className={styles.aiPanel}>
      <div className={styles.aiHeader}>
        <h3>🤖 Claude AI Assistant</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>

      {selectedText && (
        <div className={styles.selectedText}>
          <strong>Selected text:</strong>
          <p>{selectedText.substring(0, 100)}...</p>
        </div>
      )}

      <div className={styles.aiCommands}>
        {aiCommands.map(cmd => (
          <button
            key={cmd.id}
            className={styles.aiCommandButton}
            onClick={() => handleCommand(cmd.id)}
            disabled={isLoading}
          >
            <span>{cmd.icon}</span>
            <span>{cmd.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.customPrompt}>
        <textarea
          placeholder="Or write a custom instruction..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={styles.promptInput}
          rows={3}
        />
        <button
          className={styles.sendButton}
          onClick={() => handleCommand('custom')}
          disabled={!prompt.trim() || isLoading}
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  )
}

export default function Editor({ pageId }: EditorProps) {
  const [page, setPage] = useState<Page | null>(null)
  const [title, setTitle] = useState<string>('')
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false)
  const [showAIPanel, setShowAIPanel] = useState<boolean>(false)
  const [commandPosition, setCommandPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState<string>('')
  const [wordCount, setWordCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    pageStore.getPage(pageId).then(currentPage => {
      if (mounted && currentPage) {
        setPage(currentPage)
        setTitle(currentPage.title)
        setWordCount(currentPage.content.split(/\s+/).filter(word => word.length > 0).length)
        setLastSaved(new Date(currentPage.updatedAt))
      }
      setLoading(false)
    })
    const unsubscribe = pageStore.subscribe(async () => {
      const currentPage = await pageStore.getPage(pageId)
      if (currentPage) {
        setPage(currentPage)
        setTitle(currentPage.title)
        setWordCount(currentPage.content.split(/\s+/).filter(word => word.length > 0).length)
        setLastSaved(new Date(currentPage.updatedAt))
      }
    })
    return () => { mounted = false; unsubscribe() }
  }, [pageId])

  const updateTitle = async (newTitle: string) => {
    setTitle(newTitle)
    await pageStore.updatePage(pageId, { title: newTitle })
    setLastSaved(new Date())
  }

  const updateIcon = async () => {
    const emojis = ['📝', '📄', '📋', '📓', '📔', '📕', '📗', '📘', '📙', '🎯', '💡', '🚀', '⭐', '🔥', '💎', '🎨', '📊', '🔧', '📚', '🎮']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
    await pageStore.updatePage(pageId, { icon: randomEmoji })
  }

  const handleContentChange = useCallback(async (content: string) => {
    await pageStore.updatePage(pageId, { content })
    setWordCount(content.split(/\s+/).filter(word => word.length > 0).length)
    setLastSaved(new Date())
  }, [pageId])

  const handleCommand = (action: string) => {
    if (action === 'ai') {
      setShowAIPanel(true)
    } else {
      toast.success(`Executing: ${action}`)
    }
    setShowCommandPalette(false)
  }

  const handleAIGenerate = async (prompt: string, command: string) => {
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, command, context: page?.content })
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('AI generated content!')
        const currentContent = page?.content || ''
        handleContentChange(currentContent + '\n\n' + data.result)
      }
    } catch (error) {
      toast.error('Failed to generate AI content')
    }
  }

  const handleAICommand = (command: string) => {
    if (command === 'slash') {
      setShowCommandPalette(true)
      return
    }
    
    const selection = window.getSelection()?.toString() || ''
    setSelectedText(selection)
    setShowAIPanel(true)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault()
          setShowAIPanel(true)
          break
        case 'p':
          e.preventDefault()
          setShowCommandPalette(true)
          break
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading || !page) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading page...</p>
      </div>
    )
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <button className={styles.iconButton} onClick={updateIcon}>
          <span className={styles.icon}>{page.icon}</span>
        </button>
        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Untitled"
        />
        <div className={styles.headerActions}>
          <span className={styles.wordCount}>{wordCount} words</span>
          {lastSaved && (
            <span className={styles.lastSaved}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <RichEditor
        content={page.content}
        onChange={handleContentChange}
        onAICommand={handleAICommand}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
        position={commandPosition}
      />

      <AIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        onGenerate={handleAIGenerate}
        selectedText={selectedText}
      />

      <div className={styles.footer}>
        <span className={styles.metadata}>
          Created: {new Date(page.createdAt).toLocaleDateString()} • 
          Last updated: {new Date(page.updatedAt).toLocaleString()}
        </span>
        <div className={styles.footerActions}>
          <button className={styles.footerButton} onClick={() => setShowAIPanel(true)}>
            🤖 AI Assistant
          </button>
          <button className={styles.footerButton} onClick={() => setShowCommandPalette(true)}>
            ⌨️ Commands
          </button>
        </div>
      </div>
    </div>
  )
}