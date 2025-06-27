"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const GOOGLE_CLIENT_ID = '437460202913-prddt3lrrds0erheb831abdd7ma4pjj5.apps.googleusercontent.com'
const GITHUB_CLIENT_ID = 'Ov23lib6FYLpUqsFW10w'
const API_BASE = 'http://localhost:8000/api/auth'
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/login` : ''

function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: 'google',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function getGitHubAuthUrl() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user user:email',
    state: 'github',
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })
      const data = await res.json()
      if (!res.ok || !data.access_token) {
        setError(data.detail || 'Invalid credentials')
        setLoading(false)
        return
      }
      localStorage.setItem('token', data.access_token)
      router.push('/workspace/default')
    } catch (err) {
      setError('Login failed')
    }
    setLoading(false)
  }

  // Social login handler
  const handleSocialLogin = async (provider: 'google' | 'github', code: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: REDIRECT_URI })
      })
      const data = await res.json()
      if (!res.ok || !data.access_token) {
        setError(data.detail || 'Social login failed')
        setLoading(false)
        return
      }
      localStorage.setItem('token', data.access_token)
      router.push('/workspace/default')
    } catch (err) {
      setError('Social login failed')
    }
    setLoading(false)
  }

  // Handle OAuth2 redirect
  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (code && state) {
      if (state === 'github') {
        handleSocialLogin('github', code)
      } else if (state === 'google') {
        handleSocialLogin('google', code)
      }
      // Clean up URL
      window.history.replaceState({}, document.title, '/login')
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
      <form onSubmit={handleLogin} style={{ background: '#232326', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0002', minWidth: 320, maxWidth: 360 }}>
        <h2 style={{ color: '#fff', marginBottom: 24, textAlign: 'center', fontWeight: 700, letterSpacing: -1 }}>Sign in to Notion Clone</h2>
        <button type="button" onClick={() => window.location.href = getGoogleAuthUrl()} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#fff', color: '#222', fontWeight: 600, border: 'none', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>
        <button type="button" onClick={() => window.location.href = getGitHubAuthUrl()} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#222', color: '#fff', fontWeight: 600, border: '1px solid #444', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
          <Image src="/github.svg" alt="GitHub" width={20} height={20} />
          Continue with GitHub
        </button>
        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center', margin: '16px 0 8px' }}>or sign in with email</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        {error && <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#ef4444', color: '#fff', fontWeight: 600, border: 'none', marginBottom: 12 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
          <a href="/forgot-password" style={{ color: '#ef4444', marginRight: 16 }}>Forgot password?</a>
          <a href="/register" style={{ color: '#ef4444' }}>Register</a>
        </div>
      </form>
    </div>
  )
} 