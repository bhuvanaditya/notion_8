'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import Editor from '@/components/Editor/Editor'
import styles from './workspace.module.css'

export default function WorkspacePage() {
  const [selectedPageId, setSelectedPageId] = useState<string>('1')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Protect route: check for token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (!token) {
        router.replace('/login')
        return
      }
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
        <h2 style={{ color: '#fff' }}>Loading workspace...</h2>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Sidebar 
        currentPageId={selectedPageId} 
        onPageSelect={setSelectedPageId} 
      />
      <main className={styles.main}>
        <Editor pageId={selectedPageId} />
      </main>
    </div>
  )
}