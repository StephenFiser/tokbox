'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Navbar, TokBoxLogo } from '@/components/Navbar';
import {
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';
import {
  LightBulbIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  BoltIcon,
  StarIcon,
  SparklesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface AnalysisItem {
  id: number;
  mood: string;
  grade: string;
  viralScore: number;
  createdAt: string;
  hasResults: boolean;
}

interface UsageData {
  plan: 'free' | 'creator' | 'pro';
  analysesUsed: number;
  analysesLimit: number;
  periodLabel: string;
}

const MOOD_LABELS: Record<string, string> = {
  viral_bait: 'Viral Bait',
  educational: 'Educational',
  entertainment: 'Entertainment',
  inspirational: 'Inspirational',
  controversial: 'Controversial',
  thirst_trap: 'Thirst Trap',
  product_showcase: 'Product Showcase',
  behind_the_scenes: 'Behind the Scenes',
  storytelling: 'Storytelling',
  trending_sound: 'Trending Sound',
  duet_stitch: 'Duet/Stitch',
  challenge: 'Challenge',
  tutorial: 'Tutorial',
  review: 'Review',
  lifestyle: 'Lifestyle',
  comedy: 'Comedy',
  asmr: 'ASMR',
  unspecified: 'General',
};

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-400 bg-emerald-500/10',
  'A': 'text-emerald-400 bg-emerald-500/10',
  'A-': 'text-emerald-400 bg-emerald-500/10',
  'B+': 'text-lime-400 bg-lime-500/10',
  'B': 'text-lime-400 bg-lime-500/10',
  'B-': 'text-yellow-400 bg-yellow-500/10',
  'C+': 'text-yellow-400 bg-yellow-500/10',
  'C': 'text-amber-400 bg-amber-500/10',
  'C-': 'text-amber-400 bg-amber-500/10',
  'D+': 'text-orange-400 bg-orange-500/10',
  'D': 'text-orange-400 bg-orange-500/10',
  'D-': 'text-red-400 bg-red-500/10',
  'F': 'text-red-400 bg-red-500/10',
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Dashboard component for logged-in users
function Dashboard() {
  const { user } = useUser();
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/history?limit=5').then(r => r.json()),
      fetch('/api/check-usage').then(r => r.json()),
    ]).then(([historyData, usageData]) => {
      setRecentAnalyses(historyData.history || []);
      setUsage(usageData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstName = user?.firstName || 'there';
  const isPaid = usage?.plan === 'creator' || usage?.plan === 'pro';

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Navbar showPricing={!isPaid} />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-[1.75rem] font-semibold tracking-tight mb-1">
            Hey, {firstName} 👋
          </h1>
          <p className="text-zinc-400">Ready to make something viral?</p>
        </div>

        {/* Upgrade Banner (for free users) */}
        {!isPaid && !loading && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-transparent border border-purple-500/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                    Upgrade to unlock more
                  </h3>
                  <p className="text-[14px] text-zinc-400 mb-4 max-w-sm">
                    Get up to 30 analyses/month, analysis history, and priority processing.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white btn-premium rounded-xl"
                  >
                    View Plans
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Starting at</div>
                  <div className="text-2xl font-bold text-white">$9<span className="text-[14px] text-zinc-400">/mo</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/analyze"
              className="group p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center mb-3">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-0.5">Analyze Video</h3>
              <p className="text-[13px] text-zinc-500">Get AI feedback</p>
            </Link>
            
            <Link
              href="/history"
              className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <ClockIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="font-semibold text-white mb-0.5">History</h3>
              <p className="text-[13px] text-zinc-500">Past analyses</p>
            </Link>
          </div>
        </div>

        {/* Usage Stats (for paid users) */}
        {isPaid && usage && (
          <div className="mb-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider">
                {usage.plan === 'pro' ? 'Today\'s Usage' : 'This Month'}
              </h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                usage.plan === 'pro' ? 'text-amber-300 bg-amber-500/20' : 'text-purple-300 bg-purple-500/20'
              }`}>
                {usage.plan === 'pro' ? 'Pro' : 'Creator'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      usage.plan === 'pro' 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${Math.min(100, (usage.analysesUsed / usage.analysesLimit) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-[14px] text-zinc-300 font-medium tabular-nums">
                {usage.analysesUsed}/{usage.analysesLimit}
              </span>
            </div>
          </div>
        )}

        {/* Recent Analyses */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider">
              Recent Analyses
            </h2>
            {recentAnalyses.length > 0 && (
              <Link href="/history" className="text-[13px] text-purple-400 hover:text-purple-300">
                View all
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-6 h-6 text-zinc-600" />
              </div>
              <h3 className="font-medium text-zinc-300 mb-1">No analyses yet</h3>
              <p className="text-[14px] text-zinc-500 mb-5">Analyze your first video to see it here.</p>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white btn-premium rounded-xl"
              >
                <SparklesIcon className="w-4 h-4" />
                Analyze a Video
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAnalyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={analysis.hasResults ? `/history/${analysis.id}` : '#'}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] transition-all ${
                    analysis.hasResults ? 'hover:bg-white/[0.04] hover:border-white/[0.1] cursor-pointer' : 'opacity-60'
                  }`}
                >
                  {/* Grade */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold ${GRADE_COLORS[analysis.grade] || 'text-zinc-400 bg-zinc-800'}`}>
                    {analysis.grade || '—'}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-medium text-white truncate">
                        {MOOD_LABELS[analysis.mood] || analysis.mood}
                      </span>
                      {analysis.viralScore && (
                        <span className="text-[12px] text-zinc-500 flex items-center gap-1">
                          <ArrowTrendingUpIcon className="w-3 h-3" />
                          {analysis.viralScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-zinc-500">{formatDate(analysis.createdAt)}</span>
                  </div>
                  
                  {analysis.hasResults && (
                    <ArrowRightIcon className="w-4 h-4 text-zinc-600" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Account
          </h2>
          <div className="space-y-2">
            <Link
              href="/account"
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-5 h-5 text-zinc-500" />
                <span className="text-[14px] text-zinc-300">Billing & Plan</span>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-zinc-600" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04] mt-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <TokBoxLogo className="w-7 h-7" />
            <span className="text-[14px] font-medium">TokBox</span>
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

// Landing page for logged-out users
function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] overflow-x-hidden">
      {/* Ambient background - more refined */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-purple-500/[0.07] via-purple-500/[0.02] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-radial from-pink-500/[0.04] to-transparent rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="relative z-10 px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-lg mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[13px] text-zinc-400 font-medium">AI-powered video analysis</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] sm:text-[3.25rem] font-semibold leading-[1.08] tracking-tight mb-6">
            Know if your video
            <span className="block mt-2 gradient-text">will go viral</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[17px] sm:text-lg text-zinc-400 mb-12 max-w-[340px] mx-auto leading-relaxed">
            Get instant AI feedback before you post. 
            <span className="text-zinc-300"> Fix the hook. Perfect the visuals. Go viral.</span>
          </p>

          {/* CTA */}
          <Link
            href="/analyze"
            className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 text-[16px] font-semibold text-white btn-premium rounded-2xl"
          >
            Analyze Your Video
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <p className="mt-6 text-[14px] text-zinc-500 flex items-center justify-center gap-2">
            <CheckIcon className="w-4 h-4 text-emerald-400" />
            First analysis free · Takes 30 seconds
          </p>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="relative z-10 px-6 py-10 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-10 sm:gap-14 text-center">
          <div>
            <div className="text-2xl font-semibold tracking-tight">2.5K+</div>
            <div className="text-[13px] text-zinc-500 mt-0.5">Videos analyzed</div>
          </div>
          <div className="w-px h-10 bg-white/[0.06]" />
          <div>
            <div className="text-2xl font-semibold tracking-tight">30s</div>
            <div className="text-[13px] text-zinc-500 mt-0.5">Avg analysis time</div>
          </div>
          <div className="w-px h-10 bg-white/[0.06]" />
          <div>
            <div className="text-2xl font-semibold tracking-tight">4.8★</div>
            <div className="text-[13px] text-zinc-500 mt-0.5">User rating</div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[1.75rem] font-semibold tracking-tight mb-3">
              Everything you need to win
            </h2>
            <p className="text-zinc-500">One upload. Complete analysis.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: ChartBarIcon,
                title: 'Viral Score & Grade',
                desc: 'A-F grade with detailed breakdown of hook, visual, and pacing',
                gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
                iconBg: 'bg-purple-500/10',
                iconColor: 'text-purple-400',
              },
              {
                icon: LightBulbIcon,
                title: '3 Hook Styles',
                desc: 'Curiosity gap, pattern interrupt, and aspirational hooks',
                gradient: 'from-pink-500/10 via-pink-500/5 to-transparent',
                iconBg: 'bg-pink-500/10',
                iconColor: 'text-pink-400',
              },
              {
                icon: BoltIcon,
                title: 'Strengths & Fixes',
                desc: 'What works and exactly what to improve for your video',
                gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
                iconBg: 'bg-orange-500/10',
                iconColor: 'text-orange-400',
              },
              {
                icon: ChatBubbleBottomCenterTextIcon,
                title: 'Caption Ideas',
                desc: 'Ready-to-use captions that create intrigue',
                gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-400',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r ${feature.gradient} border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300`}
              >
                <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center flex-shrink-0 ${feature.iconColor}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-white mb-1">{feature.title}</h3>
                  <p className="text-[14px] text-zinc-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hook Types */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[1.75rem] font-semibold tracking-tight mb-3">
              3 proven hook formulas
            </h2>
            <p className="text-zinc-500">Each tailored to your specific content</p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: LightBulbIcon,
                name: 'Curiosity Gap',
                desc: 'Creates an open loop they must close',
                example: 'The part between frame 1 and 3...',
                border: 'border-purple-500/20 hover:border-purple-500/30',
                bg: 'from-purple-500/[0.08] via-purple-500/[0.02] to-transparent',
                text: 'text-purple-300',
                iconColor: 'text-purple-400',
              },
              {
                icon: BoltIcon,
                name: 'Pattern Interrupt',
                desc: 'Breaks the scroll with the unexpected',
                example: 'Yes, that\'s exactly what happened.',
                border: 'border-pink-500/20 hover:border-pink-500/30',
                bg: 'from-pink-500/[0.08] via-pink-500/[0.02] to-transparent',
                text: 'text-pink-300',
                iconColor: 'text-pink-400',
              },
              {
                icon: StarIcon,
                name: 'Aspirational',
                desc: 'Makes them want that life',
                example: 'This version of me hits different.',
                border: 'border-orange-500/20 hover:border-orange-500/30',
                bg: 'from-orange-500/[0.08] via-orange-500/[0.02] to-transparent',
                text: 'text-orange-300',
                iconColor: 'text-orange-400',
              },
            ].map((hook, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl bg-gradient-to-br ${hook.bg} border ${hook.border} transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <hook.icon className={`w-6 h-6 ${hook.iconColor}`} />
                  <div>
                    <h3 className={`font-semibold ${hook.text}`}>{hook.name}</h3>
                    <p className="text-[13px] text-zinc-500">{hook.desc}</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.04]">
                  <p className="text-[15px] text-zinc-200 italic">&ldquo;{hook.example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[1.75rem] font-semibold tracking-tight mb-3">
              Dead simple
            </h2>
            <p className="text-zinc-500">Upload. Analyze. Improve.</p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-[31px] top-16 bottom-16 w-px bg-gradient-to-b from-purple-500/40 via-pink-500/40 to-orange-500/40" />

            <div className="space-y-10">
              {[
                { num: '1', title: 'Upload your video', desc: 'Drag, drop, or tap to select', gradient: 'from-purple-500 to-purple-600' },
                { num: '2', title: 'AI analyzes everything', desc: 'Hook, visuals, pacing, potential', gradient: 'from-pink-500 to-pink-600' },
                { num: '3', title: 'Get your playbook', desc: 'Scores, fixes, and ready-to-use hooks', gradient: 'from-orange-500 to-orange-600' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-6 relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10 z-10`}>
                    <span className="text-xl font-semibold text-white">{step.num}</span>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-[14px] text-zinc-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[1.75rem] font-semibold tracking-tight mb-3">
              Simple pricing
            </h2>
            <p className="text-zinc-500">Start free. Scale when ready.</p>
          </div>

          <div className="space-y-4">
            {/* Free */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Free</h3>
                  <p className="text-[13px] text-zinc-500">Try it out</p>
                </div>
                <div className="text-2xl font-semibold">$0</div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[12px] text-zinc-400 font-medium">1 analysis</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[12px] text-zinc-400 font-medium">All features</span>
              </div>
              <Link href="/analyze" className="block w-full py-3 text-center text-[14px] font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] rounded-xl transition-all duration-200">
                Start Free
              </Link>
            </div>

            {/* Creator - Featured */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-purple-500/[0.12] via-purple-500/[0.06] to-transparent border border-purple-500/25 hover:border-purple-500/35 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1.5 bg-purple-500 text-[11px] font-semibold rounded-bl-xl">
                Popular
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Creator</h3>
                  <p className="text-[13px] text-zinc-500">For active creators</p>
                </div>
                <div>
                  <span className="text-2xl font-semibold">$9</span>
                  <span className="text-zinc-500 text-[14px]">/mo</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-[12px] text-purple-300 font-medium">30/mo</span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-[12px] text-purple-300 font-medium">History</span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-[12px] text-purple-300 font-medium">Priority</span>
              </div>
              <Link href="/pricing" className="block w-full py-3 text-center text-[14px] font-semibold text-white btn-premium rounded-xl">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Pro</h3>
                  <p className="text-[13px] text-zinc-500">Power users</p>
                </div>
                <div>
                  <span className="text-2xl font-semibold">$19</span>
                  <span className="text-zinc-500 text-[14px]">/mo</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[12px] text-zinc-400 font-medium">5/day</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[12px] text-zinc-400 font-medium">Priority</span>
              </div>
              <Link href="/pricing" className="block w-full py-3 text-center text-[14px] font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] rounded-xl transition-all duration-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[1.875rem] sm:text-[2.25rem] font-semibold tracking-tight mb-5">
            Stop guessing.
            <span className="block gradient-text mt-1">Start knowing.</span>
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xs mx-auto text-[15px]">
            One analysis could be the difference between 500 views and 500K.
          </p>
          <Link
            href="/analyze"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-[16px] font-semibold text-white btn-premium rounded-2xl"
          >
            Analyze Your First Video
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04] safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <TokBoxLogo className="w-7 h-7" />
            <span className="text-[14px] font-medium">TokBox</span>
          </div>
          <div className="flex gap-6 text-[14px] text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main component - shows dashboard if logged in, landing page if not
export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  
  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return isSignedIn ? <Dashboard /> : <LandingPage />;
}
