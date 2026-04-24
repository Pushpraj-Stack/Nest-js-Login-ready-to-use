'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'registration';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setApiError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { setApiError('Please enter the complete 6-digit OTP'); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpStr, type });

      if (type === 'registration') {
        login(res.data.accessToken, res.data.user);
      } else {
        setApiSuccess('OTP verified! Redirecting to reset password…');
        setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpStr}`), 1500);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setApiError('');
    setApiSuccess('');
    try {
      await api.post('/auth/resend-otp', { email, type });
      setApiSuccess('A new OTP has been sent to your email.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card-elevated animate-fade-in-up" style={{ width: '100%', maxWidth: 420, padding: '40px 36px', textAlign: 'center' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>📧</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            {type === 'registration' ? 'Verify Your Email' : 'Enter OTP'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
            We sent a 6-digit OTP to<br />
            <strong style={{ color: '#a78bfa' }}>{email || 'your email'}</strong>
          </p>
        </div>

        {apiError && (
          <div className="alert-error" style={{ marginBottom: 20, textAlign: 'left' }}>
            <span>⚠</span> {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="alert-success" style={{ marginBottom: 20, textAlign: 'left' }}>
            <span>✓</span> {apiSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* OTP Boxes */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}
            onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                id={`otp-${i}`}
              />
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || otp.join('').length !== 6}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span className="spinner" /> Verifying…
            </span> : 'Verify OTP →'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ marginTop: 24 }}>
          {countdown > 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Resend OTP in <strong style={{ color: '#a78bfa' }}>{countdown}s</strong>
            </p>
          ) : (
            <button onClick={handleResend} disabled={resending}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#a78bfa', fontSize: 14, fontWeight: 600,
              }}>
              {resending ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="spinner" /></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
