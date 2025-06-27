export interface Page {
    id: string
    title: string
    content: string
    icon?: string
    parentId?: string
    children?: Page[]
    createdAt: Date
    updatedAt: Date
    isExpanded?: boolean
  }
  
  export interface Workspace {
    id: string
    name: string
    pages: Page[]
  }
  
  export interface EditorBlock {
    id: string
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'number' | 'todo' | 'quote' | 'code'
    content: string
    checked?: boolean
  }