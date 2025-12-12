'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Navbar, TokBoxLogo } from '@/components/Navbar';
import { 
  UserCircleIcon,
  CreditCardIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface UsageData {
  plan: 'free' | 'creator' | 'pro';
  analysesUsed: number;
  analysesLimit: number;
  periodLabel: string;
  email?: string;
}

const PLAN_INFO = {
  free: {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try it out',
    color: 'zinc',
    features: ['1 video analysis', 'All 3 hook styles', 'Visual feedback'],
  },
  creator: {
    name: 'Creator',
    price: '$9',
    period: '/month',
    description: 'For regular creators',
    color: 'purple',
    features: ['30 analyses per month', 'All 3 hook styles', 'Priority support'],
  },
  pro: {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For power users',
    color: 'amber',
    features: ['5 analyses per day', 'Priority processing', 'All Creator features'],
  },
};

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/check-usage')
        .then(res => res.json())
        .then(data => {
          setUsage(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar showPricing={false} />
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Sign in required</h1>
          <p className="text-zinc-400 mb-6">Please sign in to view your account.</p>
          <Link href="/sign-in" className="btn-premium px-6 py-3 rounded-xl text-white font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const plan = usage?.plan || 'free';
  const planInfo = PLAN_INFO[plan];

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Navbar showPricing={false} />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[1.75rem] font-semibold tracking-tight mb-2">Account</h1>
          <p className="text-zinc-400">Manage your subscription and settings.</p>
        </div>

        {/* Profile section */}
        <section className="mb-8">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-semibold text-white">
                {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-medium text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[14px] text-zinc-500 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </section>

        {/* Current Plan section */}
        <section className="mb-8" id="billing">
          <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Current Plan
          </h2>
          
          <div className={`p-6 rounded-2xl border ${
            plan === 'pro' 
              ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30' 
              : plan === 'creator'
              ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
              : 'bg-white/[0.02] border-white/[0.06]'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold">{planInfo.name}</h3>
                  {plan !== 'free' && (
                    <CheckBadgeIcon className={`w-5 h-5 ${plan === 'pro' ? 'text-amber-400' : 'text-purple-400'}`} />
                  )}
                </div>
                <p className="text-[14px] text-zinc-400">{planInfo.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{planInfo.price}</span>
                <span className="text-zinc-500 text-[14px]">{planInfo.period}</span>
              </div>
            </div>

            {/* Usage bar */}
            {usage && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="text-zinc-400">
                    {plan === 'pro' ? 'Today\'s usage' : plan === 'creator' ? 'Monthly usage' : 'Usage'}
                  </span>
                  <span className="text-white font-medium tabular-nums">
                    {usage.analysesUsed} / {usage.analysesLimit} analyses
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      plan === 'pro' 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${Math.min(100, (usage.analysesUsed / usage.analysesLimit) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Features */}
            <ul className="space-y-2 mb-5">
              {planInfo.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-[14px] text-zinc-300">
                  <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Action buttons */}
            <div className="flex gap-3">
              {plan === 'free' ? (
                <Link
                  href="/pricing"
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-white btn-premium rounded-xl"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Upgrade Plan
                </Link>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-colors"
                  >
                    {plan === 'creator' ? 'Upgrade to Pro' : 'Change Plan'}
                  </Link>
                  <button
                    onClick={() => {
                      // Open Clerk's billing portal or Stripe customer portal
                      window.open('https://billing.stripe.com/p/login/test_xxx', '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-medium text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-xl transition-colors"
                  >
                    <CreditCardIcon className="w-4 h-4" />
                    Manage
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Quick Links
          </h2>
          
          <div className="space-y-2">
            <Link
              href="/history"
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
            >
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-5 h-5 text-zinc-500" />
                <span className="text-[15px] text-zinc-300">Analysis History</span>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>
            
            <Link
              href="/analyze"
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
            >
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-zinc-500" />
                <span className="text-[15px] text-zinc-300">Analyze New Video</span>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04] mt-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <TokBoxLogo className="w-7 h-7" />
            <span className="text-[14px] font-medium">tok.box</span>
          </div>
          <div className="flex gap-6 text-[14px] text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
