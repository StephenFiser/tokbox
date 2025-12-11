'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/nextjs';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

// Custom TokBox logo - a stylized play button in a box
export function TokBoxLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`${className} relative`}>
      {/* Outer box with gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 shadow-lg shadow-purple-500/25" />
      
      {/* Inner dark box */}
      <div className="absolute inset-[3px] rounded-lg bg-[#0a0a0c] flex items-center justify-center">
        {/* Play triangle */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-4 h-4 ml-0.5"
        >
          <path 
            d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" 
            fill="url(#playGradient)"
          />
          <defs>
            <linearGradient id="playGradient" x1="8" y1="5" x2="20" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

interface NavbarProps {
  showPricing?: boolean;
  rightContent?: React.ReactNode;
  sticky?: boolean;
}

export function Navbar({ showPricing = true, rightContent, sticky = false }: NavbarProps) {
  const { signOut } = useClerk();
  const baseClasses = "relative z-50 px-6 py-4";
  const stickyClasses = sticky 
    ? "sticky top-0 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.04]" 
    : "";

  return (
    <header className={`${baseClasses} ${stickyClasses}`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between h-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <TokBoxLogo />
          <span className="text-[16px] font-semibold tracking-tight text-white">TokBox</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-5" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {showPricing && (
            <Link
              href="/pricing"
              className="text-[14px] text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          )}
          
          {rightContent}
          
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-[14px] text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </SignedOut>
          
          <SignedIn>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="inline-flex items-center gap-1.5 text-[14px] text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              Sign out
            </button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
