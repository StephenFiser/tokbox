'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface NavbarProps {
  showPricing?: boolean;
  rightContent?: React.ReactNode;
  sticky?: boolean;
}

export function Navbar({ showPricing = true, rightContent, sticky = false }: NavbarProps) {
  const baseClasses = "relative z-50 px-6 py-5";
  const stickyClasses = sticky 
    ? "sticky top-0 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.04]" 
    : "";

  return (
    <header className={`${baseClasses} ${stickyClasses}`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-white/10">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-white">TokBox</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {showPricing && (
            <Link
              href="/pricing"
              className="text-[15px] text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Pricing
            </Link>
          )}
          
          {rightContent}
          
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-[15px] text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Sign in
            </Link>
          </SignedOut>
          
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
