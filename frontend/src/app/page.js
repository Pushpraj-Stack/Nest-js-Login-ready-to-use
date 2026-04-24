'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const features = [
    { icon: '🔐', title: 'Secure JWT Auth', desc: 'Industry-standard token-based authentication with 7-day sessions.' },
    { icon: '📧', title: 'Email Verification', desc: 'OTP-based email verification ensures every account is genuine.' },
    { icon: '🛡️', title: 'Password Recovery', desc: 'Forgot your password? Reset it securely via OTP in minutes.' },
  ];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Navbar ─── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: 18, fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
            CG <span className="gradient-text-purple">Community</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" style={{
            padding: '9px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)',
            color: '#e2e8f0', fontSize: 14, fontWeight: 500, textDecoration: 'none',
            transition: 'all 0.2s',
          }}>
            Sign In
          </Link>
          <Link href="/register" style={{
            padding: '9px 22px', borderRadius: 10,
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
            transition: 'all 0.2s',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <div className={mounted ? 'animate-fade-in-up' : ''} style={{ opacity: mounted ? undefined : 0 }}>
          <span className="badge" style={{ marginBottom: 24 }}>
            ✦ Full-Stack Auth System
          </span>
        </div>

        <h1 className={mounted ? 'animate-fade-in-up delay-100' : ''}
          style={{ fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          Authentication,{' '}
          <span className="gradient-text">beautifully crafted</span>
        </h1>

        <p className={mounted ? 'animate-fade-in-up delay-200' : ''}
          style={{ fontSize: 18, color: '#94a3b8', maxWidth: 540, marginBottom: 44, lineHeight: 1.8 }}>
          A secure, modern authentication system with email OTP verification, JWT sessions,
          and a stunning glassmorphism UI.
        </p>

        <div className={`${mounted ? 'animate-fade-in-up delay-300' : ''}`}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" style={{
            padding: '15px 36px', borderRadius: 12,
            background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
            color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(108,99,255,0.45)',
            transition: 'all 0.3s',
          }}>
            Create Account →
          </Link>
          <Link href="/login" style={{
            padding: '15px 36px', borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#e2e8f0', fontSize: 16, fontWeight: 600, textDecoration: 'none',
            transition: 'all 0.3s',
          }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* ─── Feature Cards ─── */}
      <section style={{ padding: '40px 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24, maxWidth: 900, width: '100%',
        }}>
          {features.map((f, i) => (
            <div key={i} className={`glass-card ${mounted ? `animate-fade-in-up delay-${(i + 3) * 100}` : ''}`}
              style={{ padding: '28px 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: '#475569', fontSize: 13,
      }}>
        © {new Date().getFullYear()} CG Community · Built with NestJS + Next.js
      </footer>
    </main>
  );
}
