import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'CG Community — Auth',
  description: 'Join the Chhattisgarh Community. Sign up, verify your email, and get started.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Animated background layers */}
        <div className="bg-animated" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
