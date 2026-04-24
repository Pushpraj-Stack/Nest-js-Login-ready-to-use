'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[HomePage] Auth State:', { isLoading, hasUser: !!user });
    if (!isLoading && !user) {
      console.log('[HomePage] No user found, redirecting to login');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  const initials = user.fullname?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const stats = [
    { label: 'Account Status', value: 'Active', icon: '✅', color: '#10b981' },
    { label: 'Member Since', value: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: '📅', color: '#6c63ff' },
    { label: 'Auth Type', value: 'JWT', icon: '🔐', color: '#a855f7' },
    { label: 'Email Verified', value: 'Yes', icon: '📧', color: '#06b6d4' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
      {/* ─── Navbar ─── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        marginBottom: 32,
        maxWidth: 1000, margin: '0 auto 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: 17, fontFamily: 'Space Grotesk, sans-serif' }}>
            CG <span className="gradient-text-purple">Community</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            @{user.username}
          </span>
          <button onClick={logout} className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ─── Main content ─── */}
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Welcome Banner */}
        <div className="glass-card-elevated animate-fade-in-up" style={{
          padding: '36px 36px', marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(168,85,247,0.10))',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, flexShrink: 0,
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 28px rgba(108,99,255,0.5)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Welcome back 👋</p>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', margin: '0 0 4px' }}>
              {user.fullname}
            </h1>
            <p style={{ fontSize: 14, color: '#a78bfa' }}>@{user.username}</p>
          </div>
          <div className="badge" style={{ alignSelf: 'flex-start' }}>
            ✦ Verified Member
          </div>
        </div>

        {/* Stats Grid */}
        <div className="animate-fade-in-up delay-100" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          {stats.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px 20px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {s.label}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Profile Details */}
        <div className="glass-card animate-fade-in-up delay-200" style={{ padding: '28px 28px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
            Your Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { label: 'Full Name', value: user.fullname, icon: '👤' },
              { label: 'Username', value: `@${user.username}`, icon: '🪪' },
              { label: 'Email Address', value: user.email, icon: '📧' },
              { label: 'Mobile Number', value: user.mobileNumber ? `+91 ${user.mobileNumber}` : 'Not set', icon: '📱' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.icon} {item.label}
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
