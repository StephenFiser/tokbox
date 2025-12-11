'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/nextjs';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/10">
            <SparklesIcon className="w-4.5 h-4.5 text-white" />
          </div>
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
