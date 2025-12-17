'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Navbar, TokBoxLogo } from '@/components/Navbar';
import { 
  GradeDisplay, 
  ScoreRow, 
  HookTabs, 
  CopyButton,
  GRADE_COLORS,
  type AnalysisResultData
} from '@/components/AnalysisResults';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  EyeIcon,
  LightBulbIcon,
  BoltIcon,
  ChatBubbleLeftIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const MOOD_LABELS: Record<string, string> = {
  thirst: 'Thirst Trap',
  relatable: 'Relatable',
  confident: 'Confident',
  mysterious: 'Mysterious',
  transformation: 'Transformation',
  lifestyle: 'Lifestyle',
  workout: 'Workout',
  funny: 'Comedy',
  storytime: 'Storytime',
  tutorial: 'Tutorial',
  trend: 'Trend',
  grwm: 'GRWM',
  pov: 'POV',
  vlog: 'Day in Life',
  flex: 'Flex',
  vulnerable: 'Vulnerable',
  chaotic: 'Chaotic',
  asmr: 'Satisfying',
  promo: 'Promo',
  unspecified: 'General',
};

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

interface AnalysisData {
  mood: string;
  created_at: string;
  results_json?: string;
  grade?: string;
  viral_score?: number;
  video_url?: string;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (!user || !analysis) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar showPricing={false} />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Analysis not found</h1>
          <p className="text-zinc-400 mb-6">This analysis doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/history" className="text-purple-400 hover:text-purple-300">
            ← Back to history
          </Link>
        </div>
      </div>
    );
  }

  // Get grade from full results or from basic analysis data
  const grade = result?.grade || analysis.grade || '—';
  const viralPotential = result?.viralPotential || analysis.viral_score || 0;
  const gradeColor = GRADE_COLORS[grade] || 'bg-gradient-to-br from-zinc-500 to-zinc-600 text-white';
  const hasFullResults = !!result;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background - same as analyze page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Navbar sticky showPricing={false} />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-[14px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to history
        </Link>

        {/* Mood & Date badge - matching analyze page style */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[12px] text-purple-300 font-medium">
            {MOOD_LABELS[analysis.mood] || analysis.mood}
          </span>
          <span className="text-[12px] text-zinc-500">
            {formatDate(analysis.created_at)}
          </span>
        </div>

        {/* Video Player - if video URL exists */}
        {analysis.video_url && (
          <div className="mb-6">
            <div className="aspect-[9/16] max-w-xs mx-auto rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.06]">
              <video 
                src={analysis.video_url} 
                controls 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Grade Display - using shared component */}
        <GradeDisplay 
          grade={grade}
          color={gradeColor}
          potential={viralPotential}
          summary={result?.summary || (hasFullResults ? '' : 'Full analysis details not available for this older analysis.')}
        />

        {/* Limited results notice for old analyses */}
        {!hasFullResults && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[14px] text-amber-200">
              This analysis was done before we started saving detailed results. 
              Only the grade and score are available. Run a new analysis to see full details!
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-[13px] font-medium text-white btn-premium rounded-lg cursor-pointer"
            >
              <SparklesIcon className="w-4 h-4" />
              Analyze New Video
            </Link>
          </div>
        )}

        {/* Full results section - matching analyze page exactly */}
        {hasFullResults && result && (
          <>
            {/* Content Description */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <EyeIcon className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-wider">What we see</span>
              </div>
              <p className="text-[15px] text-zinc-300 leading-relaxed">{result.contentDescription}</p>
            </div>

            {/* Existing Text Overlay - if present */}
            {(result as AnalysisResultData & { existingTextOverlay?: string; existingTextAssessment?: string }).existingTextOverlay && (
              <div className="p-5 rounded-2xl bg-indigo-500/[0.05] border border-indigo-500/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <ChatBubbleLeftIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[13px] font-medium text-indigo-400 uppercase tracking-wide">Your Current Text</h3>
                </div>
                <p className="text-[15px] text-white font-medium mb-3">
                  {(result as AnalysisResultData & { existingTextOverlay?: string }).existingTextOverlay}
                </p>
                {(result as AnalysisResultData & { existingTextAssessment?: string }).existingTextAssessment && (
                  <p className="text-[14px] text-zinc-400 leading-relaxed">
                    {(result as AnalysisResultData & { existingTextAssessment?: string }).existingTextAssessment}
                  </p>
                )}
              </div>
            )}

            {/* Score Breakdown - using shared ScoreRow component */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
              <h3 className="font-semibold text-[15px]">Score Breakdown</h3>
              <ScoreRow 
                icon={LightBulbIcon}
                label="Hook Power" 
                score={result.scores.hook.score} 
                feedback={result.scores.hook.feedback}
              />
              <div className="border-t border-white/[0.04]" />
              <ScoreRow 
                icon={EyeIcon}
                label="Visual Quality" 
                score={result.scores.visual.score} 
                feedback={result.scores.visual.feedback}
              />
              <div className="border-t border-white/[0.04]" />
              <ScoreRow 
                icon={BoltIcon}
                label="Execution" 
                score={result.scores.pacing.score} 
                feedback={result.scores.pacing.feedback}
              />
            </div>

            {/* What's Working - matching analyze page exactly */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="p-6 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
                <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2.5 text-[15px]">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4" />
                  </span>
                  What&apos;s Working
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-[14px] text-zinc-300 flex items-start gap-3 leading-relaxed">
                      <CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* To Improve - matching analyze page exactly */}
            {result.improvements && result.improvements.length > 0 && (
              <div className="p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/15">
                <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2.5 text-[15px]">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                  To Improve
                </h3>
                <ul className="space-y-3">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="text-[14px] text-zinc-300 flex items-start gap-3 leading-relaxed">
                      <ArrowRightIcon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* The One Thing - matching analyze page exactly */}
            {result.theOneThing && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/[0.08] to-pink-500/[0.04] border border-purple-500/20">
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2.5 text-[15px]">
                  <span className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4" />
                  </span>
                  The One Thing
                </h3>
                <p className="text-[14px] text-zinc-200 leading-relaxed">
                  {result.theOneThing}
                </p>
              </div>
            )}

            {/* Advanced Insight - matching analyze page exactly */}
            {result.advancedInsight && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LightBulbIcon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-indigo-400 uppercase tracking-wide">Pro Insight</span>
                    <p className="text-[14px] text-zinc-300 leading-relaxed mt-1">
                      {result.advancedInsight}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trend Format Badge - if present */}
            {(result as AnalysisResultData & { isTrendFormat?: boolean; trendType?: string }).isTrendFormat && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[12px] text-indigo-300 font-medium">
                  <ChartBarIcon className="w-3.5 h-3.5" />
                  Trend{(result as AnalysisResultData & { trendType?: string }).trendType ? `: ${(result as AnalysisResultData & { trendType?: string }).trendType}` : ''}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.04]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-5 bg-[#09090b] text-[13px] text-zinc-500 font-medium uppercase tracking-wide">
                  Suggestions
                </span>
              </div>
            </div>

            {/* Hook Suggestions - using shared HookTabs component */}
            <div>
              <div className="mb-5">
                <h3 className="font-semibold text-[15px] mb-1">
                  {(result as AnalysisResultData & { existingTextOverlay?: string }).existingTextOverlay ? 'Alternative Text Options' : 'Text Overlays'}
                </h3>
                <p className="text-[14px] text-zinc-500">
                  {(result as AnalysisResultData & { existingTextOverlay?: string }).existingTextOverlay 
                    ? 'If you want to try something different'
                    : 'Add one of these in the first 2 seconds'
                  }
                </p>
              </div>
              <HookTabs 
                hooks={result.hooks} 
                recommendedType={result.recommendedHookType as 'curiosity_gap' | 'pattern_interrupt' | 'aspirational'} 
              />
              
              {/* Why this hook type */}
              {(result as AnalysisResultData & { whyThisHookType?: string }).whyThisHookType && (
                <p className="mt-4 text-[13px] text-zinc-500 italic">
                  {(result as AnalysisResultData & { whyThisHookType?: string }).whyThisHookType}
                </p>
              )}
            </div>

            {/* Captions - matching analyze page exactly */}
            {result.captions && result.captions.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5 mb-5">
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-zinc-400" />
                  <h3 className="font-semibold text-[15px]">Caption Ideas</h3>
                </div>
                <div className="space-y-2.5">
                  {result.captions.map((caption, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[14px] text-zinc-300 flex-1">{caption}</p>
                      <CopyButton text={caption} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Analyze Another - matching analyze page style */}
        <button
          onClick={() => window.location.href = '/analyze'}
          className="w-full py-4 px-6 font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-2xl transition-all duration-200 text-[15px] cursor-pointer"
        >
          Analyze Another Video
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04]">
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
