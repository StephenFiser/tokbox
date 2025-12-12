import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tok.box - AI Video Analyzer for TikTok Creators",
  description: "Get AI-powered feedback on your TikTok before you post. Viral potential score, hook analysis, and optimization tips.",
  keywords: ["TikTok", "video analyzer", "viral", "creator tools", "hook analysis"],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'tok.box',
  },
  openGraph: {
    title: "tok.box - Know If Your Video Will Go Viral",
    description: "Get AI-powered feedback before you post. Free instant analysis.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#a855f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#a855f7',
          colorBackground: '#0a0a0a',
          colorInputBackground: '#27272a',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
          colorNeutral: '#71717a',
          colorDanger: '#ef4444',
          borderRadius: '12px',
        },
        elements: {
          formButtonPrimary: 'bg-purple-500 hover:bg-purple-600',
          card: 'bg-zinc-900 border-zinc-800',
          formFieldInput: 'bg-zinc-800 border-zinc-700 text-white',
          drawerRoot: 'bg-zinc-950',
          drawerContent: 'bg-zinc-950',
        },
      }}
    >
      <html lang="en">
        <body className="min-h-screen bg-black text-white antialiased">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
