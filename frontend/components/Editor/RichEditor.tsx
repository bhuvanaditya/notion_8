'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import styles from './RichEditor.module.css'
import {
  FiBold,
  FiItalic,
  FiCode,
  FiList,
  FiCheckSquare,
  FiType,
  FiHash,
  FiMessageSquare
} from 'react-icons/fi'

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  onAICommand?: (command: string) => void
}

export default function RichEditor({ content, onChange, onAICommand }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`
          }
          return 'Type "/" for commands, or start writing...'
        }
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: styles.editorContent
      }
    }
  })

  if (!editor) {
    return null
  }

  return (
    <div className={styles.richEditor}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.active : ''}
            title="Bold"
          >
            <FiBold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.active : ''}
            title="Italic"
          >
            <FiItalic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? styles.active : ''}
            title="Code"
          >
            <FiCode />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? styles.active : ''}
            title="Heading 1"
          >
            <FiType />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
            title="Heading 2"
          >
            <FiHash />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.active : ''}
            title="Bullet List"
          >
            <FiList />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.active : ''}
            title="Numbered List"
          >
            <span>1.</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive('taskList') ? styles.active : ''}
            title="Task List"
          >
            <FiCheckSquare />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            onClick={() => onAICommand?.('improve')}
            className={styles.aiButton}
            title="AI Improve"
          >
            <FiMessageSquare />
            AI
          </button>
        </div>
      </div>

      <div className={styles.editorWrapper}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}