"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const GOOGLE_CLIENT_ID = '437460202913-prddt3lrrds0erheb831abdd7ma4pjj5.apps.googleusercontent.com'
const GITHUB_CLIENT_ID = 'Ov23lib6FYLpUqsFW10w'
const API_BASE = 'http://localhost:8000/api/auth'
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/register` : ''

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

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Email/password registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, full_name: fullName, password })
      })
      const data = await res.json()
      if (!res.ok || !data.id) {
        setError(data.detail || 'Registration failed')
        setLoading(false)
        return
      }
      // Optionally auto-login after registration
      router.push('/login')
    } catch (err) {
      setError('Registration failed')
    }
    setLoading(false)
  }

  // Social login handler (same as login page)
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
      window.history.replaceState({}, document.title, '/register')
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
      <form onSubmit={handleRegister} style={{ background: '#232326', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0002', minWidth: 320, maxWidth: 360 }}>
        <h2 style={{ color: '#fff', marginBottom: 24, textAlign: 'center', fontWeight: 700, letterSpacing: -1 }}>Create your account</h2>
        <button type="button" onClick={() => window.location.href = getGoogleAuthUrl()} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#fff', color: '#222', fontWeight: 600, border: 'none', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Sign up with Google
        </button>
        <button type="button" onClick={() => window.location.href = getGitHubAuthUrl()} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#222', color: '#fff', fontWeight: 600, border: '1px solid #444', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
          <Image src="/github.svg" alt="GitHub" width={20} height={20} />
          Sign up with GitHub
        </button>
        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center', margin: '16px 0 8px' }}>or sign up with email</div>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>
          <a href="/login" style={{ color: '#ef4444' }}>Already have an account? Login</a>
        </div>
      </form>
    </div>
  )
} 