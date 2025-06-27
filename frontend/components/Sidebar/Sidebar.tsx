'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiSettings, FiChevronRight, FiChevronDown, FiClock, FiStar, FiTrash2, FiCopy } from 'react-icons/fi'
import { Page } from '@/lib/types'
import { pageStore } from '@/lib/store'
import styles from './Sidebar.module.css'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  currentPageId?: string
  onPageSelect: (pageId: string) => void
}

export default function Sidebar({ currentPageId, onPageSelect }: SidebarProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // User info (from token, for demo)
  let userEmail = 'User'
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        userEmail = payload.sub || 'User'
      } catch {}
    }
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token')
    router.replace('/login')
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    pageStore.fetchPages().then(pgs => {
      if (mounted) setPages(pgs)
      setLoading(false)
    })
    const unsubscribe = pageStore.subscribe(async () => {
      const pgs = await pageStore.getPages()
      setPages(pgs)
    })
    return () => { mounted = false; unsubscribe() }
  }, [])

  const createNewPage = async (parentId?: string) => {
    setLoading(true)
    const newPage = await pageStore.createPage(parentId)
    setPages(await pageStore.getPages())
    setLoading(false)
    onPageSelect(newPage.id)
  }

  const duplicatePage = async (pageId: string) => {
    setLoading(true)
    const duplicatedPage = await pageStore.duplicatePage(pageId)
    setPages(await pageStore.getPages())
    setLoading(false)
    if (duplicatedPage) {
      onPageSelect(duplicatedPage.id)
    }
  }

  const deletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      setLoading(true)
      await pageStore.deletePage(pageId)
      const remainingPages = await pageStore.getPages()
      setPages(remainingPages)
      setLoading(false)
      if (currentPageId === pageId && remainingPages.length > 0) {
        onPageSelect(remainingPages[0].id)
      }
    }
  }

  const toggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId)
    } else {
      newExpanded.add(pageId)
    }
    setExpandedPages(newExpanded)
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term) {
      setLoading(true)
      const results = await pageStore.searchPages(term)
      setPages(results)
      setLoading(false)
    } else {
      setPages(await pageStore.getPages())
    }
  }

  const [recentPages, setRecentPages] = useState<Page[]>([])
  useEffect(() => {
    pageStore.getRecentPages(5).then(setRecentPages)
  }, [pages])

  const renderPageTree = (parentId?: string, level = 0) => {
    const childPages = pages.filter(page => page.parentId === parentId)
    return childPages.map(page => {
      const hasChildren = pages.some(p => p.parentId === page.id)
      const isExpanded = expandedPages.has(page.id)
      return (
        <div key={page.id}>
          <div
            className={`${styles.pageItem} ${currentPageId === page.id ? styles.active : ''}`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => onPageSelect(page.id)}
          >
            {hasChildren && (
              <button
                className={styles.expandButton}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(page.id)
                }}
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            )}
            <span className={styles.pageIcon}>{page.icon}</span>
            <span className={styles.pageTitle}>{page.title}</span>
            <div className={styles.pageActions}>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation()
                  duplicatePage(page.id)
                }}
                title="Duplicate page"
              >
                <FiCopy />
              </button>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation()
                  createNewPage(page.id)
                }}
                title="Add sub-page"
              >
                <FiPlus />
              </button>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation()
                  deletePage(page.id)
                }}
                title="Delete page"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
          {isExpanded && renderPageTree(page.id, level + 1)}
        </div>
      )
    })
  }

  const renderRecentPages = () => (
    <div className={styles.recentSection}>
      <div className={styles.sectionHeader}>
        <FiClock />
        <span>Recent</span>
      </div>
      {recentPages.map(page => (
        <div
          key={page.id}
          className={`${styles.pageItem} ${currentPageId === page.id ? styles.active : ''}`}
          onClick={() => onPageSelect(page.id)}
        >
          <span className={styles.pageIcon}>{page.icon}</span>
          <span className={styles.pageTitle}>{page.title}</span>
          <span className={styles.pageDate}>
            {new Date(page.updatedAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className={styles.sidebar}>
      {/* User info and logout */}
      <div style={{ padding: '16px', borderBottom: '1px solid #333', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{userEmail}</span>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
      </div>
      <div className={styles.header}>
        <h2 className={styles.workspaceName}>My Workspace</h2>
        <button className={styles.settingsButton} title="Settings">
          <FiSettings />
        </button>
      </div>

      <div className={styles.searchContainer}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search pages..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Pages
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'recent' ? styles.active : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <FiStar />
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.newPageButton} onClick={() => createNewPage()} disabled={loading}>
          <FiPlus /> New Page
        </button>
      </div>

      <div className={styles.pageList}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : activeTab === 'recent' ? (
          renderRecentPages()
        ) : activeTab === 'favorites' ? (
          <div className={styles.emptyState}>
            <FiStar />
            <p>No favorite pages yet</p>
            <small>Click the star icon to add pages to favorites</small>
          </div>
        ) : (
          <>
            {searchTerm && (
              <div className={styles.searchResults}>
                <div className={styles.sectionHeader}>
                  Search Results ({pages.length})
                </div>
                {pages.map(page => (
                  <div
                    key={page.id}
                    className={`${styles.pageItem} ${currentPageId === page.id ? styles.active : ''}`}
                    onClick={() => onPageSelect(page.id)}
                  >
                    <span className={styles.pageIcon}>{page.icon}</span>
                    <span className={styles.pageTitle}>{page.title}</span>
                  </div>
                ))}
              </div>
            )}
            {!searchTerm && renderPageTree()}
          </>
        )}
      </div>

      {pages.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No pages yet</p>
          <button className={styles.newPageButton} onClick={() => createNewPage()}>
            Create your first page
          </button>
        </div>
      )}
    </div>
  )
}