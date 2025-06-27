'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to default workspace
    router.push('/workspace/default')
  }, [router])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Loading...</h1>
        <div className="pulse" style={{
          width: '60px',
          height: '4px',
          background: 'var(--accent-primary)',
          margin: '0 auto',
          borderRadius: '2px',
          animation: 'pulse 1.5s infinite'
        }} />
      </div>
    </div>
  )
}