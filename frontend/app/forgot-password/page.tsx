"use client";
import { useState } from 'react';

const API_BASE = 'http://localhost:8000/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Failed to send reset link');
      } else {
        setMessage('If that email exists, a reset link has been sent.');
      }
    } catch {
      setError('Failed to send reset link');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
      <form onSubmit={handleSubmit} style={{ background: '#232326', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0002', minWidth: 320, maxWidth: 360 }}>
        <h2 style={{ color: '#fff', marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        {error && <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: '#4ade80', marginBottom: 12 }}>{message}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#ef4444', color: '#fff', fontWeight: 600, border: 'none', marginBottom: 12 }}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>
          <a href="/login" style={{ color: '#ef4444' }}>Back to login</a>
        </div>
      </form>
    </div>
  );
} 