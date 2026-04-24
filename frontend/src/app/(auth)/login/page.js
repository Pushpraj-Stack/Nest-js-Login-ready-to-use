'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.accessToken, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      // If unverified, redirect to OTP
      if (msg.toLowerCase().includes('not verified')) {
        setApiError('Account not verified. ');
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card-elevated animate-fade-in-up" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>✦</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Sign in to your CG Community account
          </p>
        </div>

        {apiError && (
          <div className="alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span>
            <span>
              {apiError}
              {apiError.includes('not verified') && (
                <Link href={`/verify-otp?email=${encodeURIComponent(form.email)}&type=registration`}
                  style={{ color: '#fca5a5', fontWeight: 600, textDecoration: 'underline', marginLeft: 4 }}>
                  Verify now →
                </Link>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input id="login-email" name="email" type="email"
              className={`glass-input${errors.email ? ' error' : ''}`}
              placeholder="ravi@example.com" value={form.email}
              onChange={handleChange} autoComplete="email" />
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input id="login-password" name="password" type={showPassword ? 'text' : 'password'}
                className={`glass-input${errors.password ? ' error' : ''}`}
                placeholder="••••••••" value={form.password}
                onChange={handleChange} autoComplete="current-password"
                style={{ paddingRight: 48 }} />
              <button type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16,
                }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span className="spinner" /> Signing in…
            </span> : 'Sign In →'}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }}>or</div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
