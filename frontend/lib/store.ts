import { Page } from './types'

const API_BASE = 'http://localhost:8000/api/pages'

class PageStore {
  listeners: Set<() => void> = new Set()
  pages: Page[] = []

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener())
  }

  async fetchPages() {
    const res = await fetch(API_BASE, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch pages')
    this.pages = await res.json()
    this.notify()
    return this.pages
  }

  async getPages(): Promise<Page[]> {
    if (this.pages.length === 0) {
      await this.fetchPages()
    }
    return this.pages
  }

  async getPage(id: string): Promise<Page | undefined> {
    const res = await fetch(`${API_BASE}/${id}`, { credentials: 'include' })
    if (!res.ok) return undefined
    return await res.json()
  }

  async createPage(parentId?: string): Promise<Page> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: 'Untitled',
        content: '',
        icon: '📄',
        parent_id: parentId,
        is_public: false
      })
    })
    if (!res.ok) throw new Error('Failed to create page')
    const page = await res.json()
    await this.fetchPages()
    return page
  }

  async updatePage(id: string, updates: Partial<Page>) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error('Failed to update page')
    await this.fetchPages()
  }

  async deletePage(id: string) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Failed to delete page')
    await this.fetchPages()
  }

  async searchPages(query: string): Promise<Page[]> {
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query })
    })
    if (!res.ok) throw new Error('Failed to search pages')
    const data = await res.json()
    return data.pages
  }

  async getRecentPages(limit: number = 5): Promise<Page[]> {
    const pages = await this.getPages()
    return pages
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  async duplicatePage(id: string): Promise<Page | null> {
    const res = await fetch(`${API_BASE}/${id}/duplicate`, {
      method: 'POST',
      credentials: 'include'
    })
    if (!res.ok) return null
    const page = await res.json()
    await this.fetchPages()
    return page
  }
}

export const pageStore = new PageStore()