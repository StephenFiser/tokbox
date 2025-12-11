import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokBox - AI Video Analyzer for TikTok Creators",
  description: "Get AI-powered feedback on your TikTok before you post. Viral potential score, hook analysis, and optimization tips.",
  keywords: ["TikTok", "video analyzer", "viral", "creator tools", "hook analysis"],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "TokBox - Know If Your Video Will Go Viral",
    description: "Get AI-powered feedback before you post. Free instant analysis.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
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
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
        },
        elements: {
          formButtonPrimary: 'bg-purple-500 hover:bg-purple-600',
          card: 'bg-zinc-900 border-zinc-800',
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
