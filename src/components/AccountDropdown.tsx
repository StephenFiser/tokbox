'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  ChevronDownIcon,
  UserCircleIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface UsageData {
  plan: 'free' | 'creator' | 'pro';
  analysesUsed: number;
  analysesLimit: number;
  periodLabel: string;
}

const PLAN_COLORS = {
  free: 'text-zinc-400 bg-zinc-800',
  creator: 'text-purple-300 bg-purple-500/20',
  pro: 'text-amber-300 bg-amber-500/20',
};

const PLAN_LABELS = {
  free: 'Free',
  creator: 'Creator',
  pro: 'Pro',
};

export function AccountDropdown() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch usage data
  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/check-usage')
        .then(res => res.json())
        .then(data => {
          if (data.plan) {
            setUsage({
              plan: data.plan,
              analysesUsed: data.analysesUsed || 0,
              analysesLimit: data.analysesLimit || 1,
              periodLabel: data.periodLabel || 'total',
            });
          }
        })
        .catch(() => {});
    }
  }, [isLoaded, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded || !user) return null;

  const initials = user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?';
  const displayName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
      >
        {/* Avatar */}
        {user.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt="" 
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[12px] font-semibold text-white">
            {initials}
          </div>
        )}
        
        {/* Plan badge - compact */}
        {usage && (
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${PLAN_COLORS[usage.plan]}`}>
            {PLAN_LABELS[usage.plan]}
          </span>
        )}
        
        <ChevronDownIcon className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900 border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-scale z-50">
          {/* Header with user info */}
          <div className="px-4 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="" 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[14px] font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-white truncate">{displayName}</p>
                <p className="text-[12px] text-zinc-500 truncate">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
          </div>

          {/* Usage stats */}
          {usage && (
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-zinc-500">
                  {usage.plan === 'pro' ? 'Today' : usage.plan === 'creator' ? 'This month' : 'Total'}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${PLAN_COLORS[usage.plan]}`}>
                  {PLAN_LABELS[usage.plan]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (usage.analysesUsed / usage.analysesLimit) * 100)}%` }}
                  />
                </div>
                <span className="text-[13px] text-zinc-300 font-medium tabular-nums">
                  {usage.analysesUsed}/{usage.analysesLimit}
                </span>
              </div>
              {usage.plan === 'free' && usage.analysesUsed >= usage.analysesLimit && (
                <Link 
                  href="/pricing" 
                  className="flex items-center gap-1.5 mt-2 text-[12px] text-purple-400 hover:text-purple-300"
                  onClick={() => setIsOpen(false)}
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Upgrade for more analyses
                </Link>
              )}
            </div>
          )}

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              <UserCircleIcon className="w-4.5 h-4.5 text-zinc-500" />
              Account
            </Link>
            <Link
              href="/account#billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              <CreditCardIcon className="w-4.5 h-4.5 text-zinc-500" />
              Billing
            </Link>
            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              <ClockIcon className="w-4.5 h-4.5 text-zinc-500" />
              Analysis History
            </Link>
          </div>

          {/* Sign out */}
          <div className="py-2 border-t border-white/[0.06]">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ redirectUrl: '/' });
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="w-4.5 h-4.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
