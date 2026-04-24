'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '', fullname: '', email: '', mobileNumber: '', password: '',
  });
  const [errors, setErrors] = useState({});
  const [fieldStatus, setFieldStatus] = useState({}); // { email: 'checking'|'available'|'taken' }
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const debounceRef = useRef({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) e.username = '3-20 chars, letters/numbers/underscores only';
    if (!form.fullname.trim()) e.fullname = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) e.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const checkUniqueness = (field, value) => {
    if (!value) return;
    clearTimeout(debounceRef.current[field]);
    setFieldStatus((s) => ({ ...s, [field]: 'checking' }));

    debounceRef.current[field] = setTimeout(async () => {
      try {
        const endpoint = field === 'email' ? `/auth/check-email?email=${encodeURIComponent(value)}`
          : `/auth/check-username?username=${encodeURIComponent(value)}`;
        const res = await api.get(endpoint);
        setFieldStatus((s) => ({ ...s, [field]: res.data.available ? 'available' : 'taken' }));
      } catch {
        setFieldStatus((s) => ({ ...s, [field]: '' }));
      }
    }, 600);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
    setApiError('');
    if (name === 'email' || name === 'username') checkUniqueness(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (fieldStatus.email === 'taken' || fieldStatus.username === 'taken') {
      setApiError('Please fix the highlighted fields before continuing.');
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/register', form);
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&type=registration`);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (field) => {
    if (fieldStatus[field] === 'checking') return <span className="spinner" style={{ width: 14, height: 14 }} />;
    if (fieldStatus[field] === 'available') return <span style={{ color: 'var(--success)' }}>✓</span>;
    if (fieldStatus[field] === 'taken') return <span style={{ color: 'var(--danger)' }}>✗</span>;
    return null;
  };

  const inputClass = (field) => {
    let cls = 'glass-input';
    if (errors[field]) cls += ' error';
    else if (fieldStatus[field] === 'available') cls += ' success';
    else if (fieldStatus[field] === 'taken') cls += ' error';
    return cls;
  };

  return (
    <div className="auth-container">
      <div className="glass-card-elevated animate-fade-in-up" style={{ width: '100%', maxWidth: 480, padding: '40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>✦</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Join CG Community today
          </p>
        </div>

        {apiError && (
          <div className="alert-error" style={{ marginBottom: 20 }}>
            <span>⚠</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <div>
            <label className="form-label" htmlFor="reg-username">Username</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-username" name="username" className={inputClass('username')}
                placeholder="e.g. ravi_cg" value={form.username} onChange={handleChange} autoComplete="username" />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                {statusIcon('username')}
              </span>
            </div>
            {errors.username && <p className="form-error">⚠ {errors.username}</p>}
            {fieldStatus.username === 'taken' && <p className="form-error">✗ Username is already taken</p>}
            {fieldStatus.username === 'available' && <p className="form-success">✓ Username is available</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="form-label" htmlFor="reg-fullname">Full Name</label>
            <input id="reg-fullname" name="fullname" className={inputClass('fullname')}
              placeholder="Ravi Kumar" value={form.fullname} onChange={handleChange} autoComplete="name" />
            {errors.fullname && <p className="form-error">⚠ {errors.fullname}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-email" name="email" type="email" className={inputClass('email')}
                placeholder="ravi@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                {statusIcon('email')}
              </span>
            </div>
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            {fieldStatus.email === 'taken' && <p className="form-error">✗ Email is already registered</p>}
            {fieldStatus.email === 'available' && <p className="form-success">✓ Email is available</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="form-label" htmlFor="reg-mobile">Mobile Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{
                padding: '13px 12px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'nowrap',
              }}>🇮🇳 +91</span>
              <input id="reg-mobile" name="mobileNumber" type="tel" className={inputClass('mobileNumber')}
                placeholder="9876543210" value={form.mobileNumber} onChange={handleChange}
                maxLength={10} style={{ flex: 1 }} />
            </div>
            {errors.mobileNumber && <p className="form-error">⚠ {errors.mobileNumber}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'}
                className={inputClass('password')} placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} autoComplete="new-password"
                style={{ paddingRight: 48 }} />
              <button type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: 16, padding: 4,
                }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p className="form-error">⚠ {errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span className="spinner" /> Creating account…
            </span> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
