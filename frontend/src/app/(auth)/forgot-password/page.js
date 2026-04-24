'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return; }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card-elevated animate-fade-in-up" style={{ width: '100%', maxWidth: 420, padding: '40px 36px', textAlign: 'center' }}>
        {!sent ? (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 64, height: 64, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>🔐</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
                Forgot Password?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                No worries! Enter your email and we&apos;ll send you a reset OTP.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className={`glass-input${error ? ' error' : ''}`}
                  placeholder="ravi@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
                {error && <p className="form-error">⚠ {error}</p>}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner" /> Sending OTP…
                </span> : 'Send Reset OTP →'}
              </button>
            </form>

            <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
              <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to login</Link>
            </p>
          </>
        ) : (
          /* Success state */
          <div className="animate-fade-in">
            <div style={{ fontSize: 60, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: 'Space Grotesk, sans-serif' }}>
              Check your inbox!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 28 }}>
              If an account exists for <strong style={{ color: '#a78bfa' }}>{email}</strong>,
              you&apos;ll receive an OTP in your inbox shortly.
            </p>
            <button className="btn-primary"
              onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=forgot-password`)}>
              Enter OTP →
            </button>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              Didn&apos;t get it?{' '}
              <button onClick={() => setSent(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontWeight: 600 }}>
                Try again
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
