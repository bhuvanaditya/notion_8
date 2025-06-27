"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE = 'http://localhost:8000/api/auth';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/password-reset/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Failed to reset password');
      } else {
        setMessage('Password has been reset. You can now log in.');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch {
      setError('Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
      <form onSubmit={handleSubmit} style={{ background: '#232326', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0002', minWidth: 320, maxWidth: 360 }}>
        <h2 style={{ color: '#fff', marginBottom: 24, textAlign: 'center', fontWeight: 700 }}>Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 6, border: '1px solid #333', background: '#18181b', color: '#fff' }}
        />
        {error && <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: '#4ade80', marginBottom: 12 }}>{message}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#ef4444', color: '#fff', fontWeight: 600, border: 'none', marginBottom: 12 }}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>
          <a href="/login" style={{ color: '#ef4444' }}>Back to login</a>
        </div>
      </form>
    </div>
  );
} 