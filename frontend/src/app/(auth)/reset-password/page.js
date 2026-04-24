'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || '';
  const preFilledOtp = searchParams.get('otp') || '';

  const [form, setForm] = useState({ otp: preFilledOtp, newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.otp || form.otp.length !== 6) e.otp = 'Enter the 6-digit OTP';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      await api.post('/auth/reset-password', {
        email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setDone(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-container">
        <div className="glass-card-elevated animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: 'Space Grotesk, sans-serif' }}>
            Password Reset!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 28 }}>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <button className="btn-primary" onClick={() => router.push('/login')}>
            Sign In →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="glass-card-elevated animate-fade-in-up" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6c63ff, #06b6d4)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>🔑</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            For <strong style={{ color: '#a78bfa' }}>{email}</strong>
          </p>
        </div>

        {apiError && (
          <div className="alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!preFilledOtp && (
            <div>
              <label className="form-label" htmlFor="reset-otp">OTP from Email</label>
              <input id="reset-otp" name="otp" type="text" inputMode="numeric"
                className={`glass-input${errors.otp ? ' error' : ''}`}
                placeholder="Enter 6-digit OTP" value={form.otp} onChange={handleChange} maxLength={6} />
              {errors.otp && <p className="form-error">⚠ {errors.otp}</p>}
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="reset-new-pw">New Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reset-new-pw" name="newPassword" type={showPassword ? 'text' : 'password'}
                className={`glass-input${errors.newPassword ? ' error' : ''}`}
                placeholder="Min. 6 characters" value={form.newPassword}
                onChange={handleChange} autoComplete="new-password"
                style={{ paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPassword((s) => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.newPassword && <p className="form-error">⚠ {errors.newPassword}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="reset-confirm-pw">Confirm New Password</label>
            <input id="reset-confirm-pw" name="confirmPassword" type={showPassword ? 'text' : 'password'}
              className={`glass-input${errors.confirmPassword ? ' error' : ''}`}
              placeholder="Re-enter new password" value={form.confirmPassword}
              onChange={handleChange} autoComplete="new-password" />
            {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span className="spinner" /> Resetting…
            </span> : 'Reset Password →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="spinner" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
