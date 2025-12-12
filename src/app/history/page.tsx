'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Navbar, TokBoxLogo } from '@/components/Navbar';
import { 
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface AnalysisItem {
  id: number;
  mood: string;
  grade: string;
  viralScore: number;
  createdAt: string;
  hasResults: boolean;
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
  'A+': 'text-emerald-400',
  'A': 'text-emerald-400',
  'A-': 'text-emerald-400',
  'B+': 'text-lime-400',
  'B': 'text-lime-400',
  'B-': 'text-yellow-400',
  'C+': 'text-yellow-400',
  'C': 'text-amber-400',
  'C-': 'text-amber-400',
  'D+': 'text-orange-400',
  'D': 'text-orange-400',
  'D-': 'text-red-400',
  'F': 'text-red-400',
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
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          setHistory(data.history || []);
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
          <p className="text-zinc-400 mb-6">Please sign in to view your analysis history.</p>
          <Link href="/sign-in" className="btn-premium px-6 py-3 rounded-xl text-white font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Navbar showPricing={false} />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[1.75rem] font-semibold tracking-tight mb-2">Analysis History</h1>
            <p className="text-zinc-400">Your past video analyses.</p>
          </div>
          <Link
            href="/analyze"
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white btn-premium rounded-xl"
          >
            <SparklesIcon className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {/* History list */}
        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <ClockIcon className="w-7 h-7 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No analyses yet</h2>
            <p className="text-zinc-500 text-[15px] mb-6">
              Analyze your first video to see it here.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-5 py-3 text-[14px] font-semibold text-white btn-premium rounded-xl"
            >
              <SparklesIcon className="w-4 h-4" />
              Analyze a Video
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/history/${item.id}`}
                className="block p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] transition-all hover:bg-white/[0.04] hover:border-white/[0.1] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Grade badge */}
                    <div className={`w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-lg font-bold ${GRADE_COLORS[item.grade] || 'text-zinc-400'}`}>
                      {item.grade || '—'}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-medium text-white">
                          {MOOD_LABELS[item.mood] || item.mood}
                        </span>
                        {item.viralScore && (
                          <span className="text-[12px] text-zinc-500">
                            {item.viralScore.toFixed(1)}/10
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] text-zinc-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <ArrowRightIcon className="w-4 h-4 text-zinc-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04] mt-20">
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
