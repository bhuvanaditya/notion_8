'use client'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (action: string) => void
  position: { top: number; left: number }
}

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onCommand, 
  position 
}: CommandPaletteProps) {
  if (!isOpen) return null

  const commands = [
    { id: 'heading1', label: 'Heading 1', icon: '#' },
    { id: 'heading2', label: 'Heading 2', icon: '##' },
    { id: 'bullet', label: 'Bullet List', icon: '•' },
    { id: 'number', label: 'Numbered List', icon: '1.' },
    { id: 'todo', label: 'Todo List', icon: '☐' },
    { id: 'ai', label: 'Ask AI', icon: '✨' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div 
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '8px',
          minWidth: '200px',
        }}
      >
        {commands.map(cmd => (
          <button
            key={cmd.id}
            onClick={() => {
              onCommand(cmd.id)
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ marginRight: '12px', opacity: 0.6 }}>{cmd.icon}</span>
            <span>{cmd.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}