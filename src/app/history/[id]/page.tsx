'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Navbar, TokBoxLogo } from '@/components/Navbar';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  EyeIcon,
  LightBulbIcon,
  BoltIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';

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

const GRADE_COLORS: Record<string, { text: string; bg: string }> = {
  'A+': { text: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
  'A': { text: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
  'A-': { text: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
  'B+': { text: 'text-lime-400', bg: 'from-lime-500/20 to-lime-500/5' },
  'B': { text: 'text-lime-400', bg: 'from-lime-500/20 to-lime-500/5' },
  'B-': { text: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-500/5' },
  'C+': { text: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-500/5' },
  'C': { text: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5' },
  'C-': { text: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5' },
  'D+': { text: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5' },
  'D': { text: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5' },
  'D-': { text: 'text-red-400', bg: 'from-red-500/20 to-red-500/5' },
  'F': { text: 'text-red-400', bg: 'from-red-500/20 to-red-500/5' },
};

interface AnalysisResult {
  grade: string;
  gradeColor: string;
  viralPotential: number;
  summary: string;
  contentDescription: string;
  scores: {
    hook: { score: number; label: string; feedback: string };
    visual: { score: number; label: string; feedback: string };
    pacing: { score: number; label: string; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  theOneThing?: string;
  advancedInsight?: string;
  hooks: Record<string, { text: string; why: string }[]>;
  recommendedHookType: string;
  captions: string[];
  moodStrategy?: {
    name: string;
    whatMatters: string[];
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [analysis, setAnalysis] = useState<{ mood: string; created_at: string; results_json: string } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && user && params.id) {
      fetch(`/api/history?id=${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.analysis) {
            setAnalysis(data.analysis);
            if (data.analysis.results_json) {
              setResult(JSON.parse(data.analysis.results_json));
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user, params.id]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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

  if (!user || !analysis || !result) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar showPricing={false} />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Analysis not found</h1>
          <p className="text-zinc-400 mb-6">This analysis doesn't exist or you don't have access to it.</p>
          <Link href="/history" className="text-purple-400 hover:text-purple-300">
            ← Back to history
          </Link>
        </div>
      </div>
    );
  }

  const gradeStyle = GRADE_COLORS[result.grade] || { text: 'text-zinc-400', bg: 'from-zinc-500/20 to-zinc-500/5' };

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Navbar showPricing={false} />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-[14px] text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to history
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[13px] text-zinc-500">
              {MOOD_LABELS[analysis.mood] || analysis.mood}
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-[13px] text-zinc-500">
              {formatDate(analysis.created_at)}
            </span>
          </div>
        </div>

        {/* Grade Card */}
        <div className={`p-6 rounded-2xl bg-gradient-to-b ${gradeStyle.bg} border border-white/[0.06] mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-5xl font-bold ${gradeStyle.text}`}>{result.grade}</span>
              <p className="text-[14px] text-zinc-400 mt-1">Viral Potential: {result.viralPotential}/10</p>
            </div>
          </div>
          <p className="text-[15px] text-zinc-300 leading-relaxed">{result.summary}</p>
        </div>

        {/* What AI Sees */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <EyeIcon className="w-4 h-4 text-zinc-500" />
            <h3 className="text-[13px] font-medium text-zinc-500 uppercase tracking-wide">What we see</h3>
          </div>
          <p className="text-[15px] text-zinc-300 leading-relaxed">{result.contentDescription}</p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(result.scores).map(([key, score]) => (
            <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-2xl font-bold text-white mb-1">{score.score}/10</div>
              <div className="text-[12px] text-zinc-500">{score.label}</div>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {result.strengths.length > 0 && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <h3 className="text-[13px] font-medium text-emerald-400 uppercase tracking-wide mb-3">
                ✓ What's Working
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((item, i) => (
                  <li key={i} className="text-[14px] text-zinc-300 flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {result.improvements.length > 0 && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <h3 className="text-[13px] font-medium text-amber-400 uppercase tracking-wide mb-3">
                → To Improve
              </h3>
              <ul className="space-y-2">
                {result.improvements.map((item, i) => (
                  <li key={i} className="text-[14px] text-zinc-300 flex items-start gap-2">
                    <ArrowRightIcon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Hooks */}
        {result.hooks && Object.keys(result.hooks).length > 0 && (
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
            <h3 className="text-[13px] font-medium text-zinc-500 uppercase tracking-wide mb-4">
              Suggested Hooks
            </h3>
            <div className="space-y-4">
              {Object.entries(result.hooks).map(([type, hooks]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    {type === 'curiosity' && <LightBulbIcon className="w-4 h-4 text-yellow-400" />}
                    {type === 'pattern_interrupt' && <BoltIcon className="w-4 h-4 text-blue-400" />}
                    {type === 'aspirational' && <SparklesIcon className="w-4 h-4 text-purple-400" />}
                    <span className="text-[13px] font-medium text-zinc-400 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    {type === result.recommendedHookType && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {hooks.map((hook, i) => (
                      <div 
                        key={i}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/[0.02] group"
                      >
                        <p className="text-[14px] text-zinc-300">{hook.text}</p>
                        <button
                          onClick={() => copyToClipboard(hook.text, i)}
                          className="p-1.5 rounded-md hover:bg-white/[0.05] transition-colors flex-shrink-0"
                        >
                          {copiedIndex === i ? (
                            <CheckIcon className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ClipboardIcon className="w-4 h-4 text-zinc-500" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Captions */}
        {result.captions && result.captions.length > 0 && (
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
            <h3 className="text-[13px] font-medium text-zinc-500 uppercase tracking-wide mb-4">
              Caption Ideas
            </h3>
            <div className="space-y-2">
              {result.captions.map((caption, i) => (
                <div 
                  key={i}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/[0.02] group"
                >
                  <p className="text-[14px] text-zinc-300">{caption}</p>
                  <button
                    onClick={() => copyToClipboard(caption, 100 + i)}
                    className="p-1.5 rounded-md hover:bg-white/[0.05] transition-colors flex-shrink-0"
                  >
                    {copiedIndex === 100 + i ? (
                      <CheckIcon className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ClipboardIcon className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze another */}
        <div className="text-center py-8">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-white btn-premium rounded-xl"
          >
            <SparklesIcon className="w-4 h-4" />
            Analyze Another Video
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04]">
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
