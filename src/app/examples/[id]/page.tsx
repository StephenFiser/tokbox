'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar, TokBoxLogo } from '@/components/Navbar';
import { 
  GradeDisplay, 
  ScoreRow, 
  HookTabs, 
  CopyButton,
  GRADE_COLORS
} from '@/components/AnalysisResults';
import { getExampleById, SHOWCASE_EXAMPLES } from '@/data/showcase-examples';
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
  PlayIcon,
  FilmIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

const MOOD_LABELS: Record<string, string> = {
  trend: 'Trend',
  tutorial: 'Tutorial',
  funny: 'Comedy',
  relatable: 'Relatable',
  promo: 'Promo',
  thirst: 'Thirst Trap',
  confident: 'Confident',
  transformation: 'Transformation',
  lifestyle: 'Lifestyle',
  workout: 'Workout',
  storytime: 'Storytime',
  grwm: 'GRWM',
  pov: 'POV',
  vlog: 'Day in Life',
  flex: 'Flex',
  vulnerable: 'Vulnerable',
  chaotic: 'Chaotic',
  asmr: 'Satisfying',
};

export default function ExampleDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'video' | 'analysis'>('analysis');
  
  const example = getExampleById(params.id as string);
  
  if (!example) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar showPricing={false} />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Example not found</h1>
          <p className="text-zinc-400 mb-6">This example doesn&apos;t exist.</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { results } = example;
  const gradeColor = GRADE_COLORS[results.grade] || 'bg-gradient-to-br from-zinc-500 to-zinc-600 text-white';

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <Navbar sticky showPricing={false} />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/#examples"
          className="inline-flex items-center gap-2 text-[14px] text-zinc-500 hover:text-white transition-colors cursor-pointer mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to examples
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[12px] text-purple-300 font-medium">
              {MOOD_LABELS[example.mood] || example.mood}
            </span>
            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold ${
              example.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-300' :
              example.grade.startsWith('B') ? 'bg-lime-500/20 text-lime-300' :
              example.grade.startsWith('C') ? 'bg-amber-500/20 text-amber-300' :
              example.grade.startsWith('D') ? 'bg-orange-500/20 text-orange-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              Grade: {example.grade}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{example.title}</h1>
          <p className="text-zinc-400">{example.subtitle}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-[14px] transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                : 'bg-white/[0.02] text-zinc-400 border border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <PlayCircleIcon className={`w-5 h-5 ${activeTab === 'video' ? 'text-purple-400' : ''}`} />
            Video
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-[14px] transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                : 'bg-white/[0.02] text-zinc-400 border border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <DocumentTextIcon className={`w-5 h-5 ${activeTab === 'analysis' ? 'text-purple-400' : ''}`} />
            Analysis
          </button>
        </div>

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-6 animate-fade-in">
            {example.videoUrl ? (
              <div className="aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.06]">
                <video 
                  src={example.videoUrl} 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[9/16] max-w-sm mx-auto rounded-2xl bg-zinc-900/50 border border-white/[0.06] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <FilmIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Video Preview</h3>
                <p className="text-[14px] text-zinc-500 mb-4">
                  {results.contentDescription}
                </p>
                <p className="text-[12px] text-zinc-600">
                  Video playback coming soon
                </p>
              </div>
            )}
            
            {/* Current Text Overlay */}
            {results.existingTextOverlay && (
              <div className="p-5 rounded-2xl bg-indigo-500/[0.05] border border-indigo-500/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <ChatBubbleLeftIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[13px] font-medium text-indigo-400 uppercase tracking-wide">Text Overlay Used</h3>
                </div>
                <p className="text-[15px] text-white font-medium whitespace-pre-line">{results.existingTextOverlay}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  results.scores.hook.score >= 7 ? 'text-emerald-400' :
                  results.scores.hook.score >= 5 ? 'text-amber-400' : 'text-red-400'
                }`}>{results.scores.hook.score}/10</div>
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Hook</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  results.scores.visual.score >= 7 ? 'text-emerald-400' :
                  results.scores.visual.score >= 5 ? 'text-amber-400' : 'text-red-400'
                }`}>{results.scores.visual.score}/10</div>
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Visual</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  results.scores.pacing.score >= 7 ? 'text-emerald-400' :
                  results.scores.pacing.score >= 5 ? 'text-amber-400' : 'text-red-400'
                }`}>{results.scores.pacing.score}/10</div>
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Execution</div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setActiveTab('analysis')}
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-[14px] font-medium cursor-pointer"
              >
                View Full Analysis
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-fade-in">
            {/* Grade Display */}
            <GradeDisplay 
              grade={results.grade}
              color={gradeColor}
              potential={results.viralPotential}
              summary={results.summary}
            />

            {/* Content Description */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <EyeIcon className="w-4 h-4 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-wider">What we see</span>
              </div>
              <p className="text-[15px] text-zinc-300 leading-relaxed">{results.contentDescription}</p>
            </div>

            {/* Existing Text Overlay Assessment */}
            {results.existingTextOverlay && (
              <div className="p-5 rounded-2xl bg-indigo-500/[0.05] border border-indigo-500/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <ChatBubbleLeftIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[13px] font-medium text-indigo-400 uppercase tracking-wide">Current Text Overlay</h3>
                </div>
                <p className="text-[15px] text-white font-medium mb-3 whitespace-pre-line">{results.existingTextOverlay}</p>
                {results.existingTextAssessment && (
                  <p className="text-[14px] text-zinc-400 leading-relaxed">{results.existingTextAssessment}</p>
                )}
              </div>
            )}

            {/* Score Breakdown */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
              <h3 className="font-semibold text-[15px]">Score Breakdown</h3>
              <ScoreRow 
                icon={LightBulbIcon}
                label="Hook Power" 
                score={results.scores.hook.score} 
                feedback={results.scores.hook.feedback}
              />
              <div className="border-t border-white/[0.04]" />
              <ScoreRow 
                icon={EyeIcon}
                label="Visual Quality" 
                score={results.scores.visual.score} 
                feedback={results.scores.visual.feedback}
              />
              <div className="border-t border-white/[0.04]" />
              <ScoreRow 
                icon={BoltIcon}
                label="Execution" 
                score={results.scores.pacing.score} 
                feedback={results.scores.pacing.feedback}
              />
            </div>

            {/* What's Working */}
            {results.strengths && results.strengths.length > 0 && (
              <div className="p-6 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
                <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2.5 text-[15px]">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4" />
                  </span>
                  What&apos;s Working
                </h3>
                <ul className="space-y-3">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="text-[14px] text-zinc-300 flex items-start gap-3 leading-relaxed">
                      <CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* To Improve */}
            {results.improvements && results.improvements.length > 0 && (
              <div className="p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/15">
                <h3 className="font-semibold text-amber-400 mb-4 flex items-center gap-2.5 text-[15px]">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                  To Improve
                </h3>
                <ul className="space-y-3">
                  {results.improvements.map((s, i) => (
                    <li key={i} className="text-[14px] text-zinc-300 flex items-start gap-3 leading-relaxed">
                      <ArrowRightIcon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* The One Thing */}
            {results.theOneThing && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/[0.08] to-pink-500/[0.04] border border-purple-500/20">
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2.5 text-[15px]">
                  <span className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4" />
                  </span>
                  The One Thing
                </h3>
                <p className="text-[14px] text-zinc-200 leading-relaxed">
                  {results.theOneThing}
                </p>
              </div>
            )}

            {/* Advanced Insight */}
            {results.advancedInsight && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LightBulbIcon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-indigo-400 uppercase tracking-wide">Pro Insight</span>
                    <p className="text-[14px] text-zinc-300 leading-relaxed mt-1">
                      {results.advancedInsight}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trend Format Badge */}
            {results.isTrendFormat && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[12px] text-indigo-300 font-medium">
                  <ChartBarIcon className="w-3.5 h-3.5" />
                  Trend{results.trendType ? `: ${results.trendType}` : ''}
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

            {/* Hook Suggestions */}
            <div>
              <div className="mb-5">
                <h3 className="font-semibold text-[15px] mb-1">
                  {results.existingTextOverlay ? 'Alternative Text Options' : 'Text Overlays'}
                </h3>
                <p className="text-[14px] text-zinc-500">
                  {results.existingTextOverlay 
                    ? 'If you want to try something different'
                    : 'Add one of these in the first 2 seconds'
                  }
                </p>
              </div>
              <HookTabs 
                hooks={results.hooks} 
                recommendedType={results.recommendedHookType as 'curiosity_gap' | 'pattern_interrupt' | 'aspirational'} 
              />
              
              {results.whyThisHookType && (
                <p className="mt-4 text-[13px] text-zinc-500 italic">
                  {results.whyThisHookType}
                </p>
              )}
            </div>

            {/* Captions */}
            {results.captions && results.captions.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5 mb-5">
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-zinc-400" />
                  <h3 className="font-semibold text-[15px]">Caption Ideas</h3>
                </div>
                <div className="space-y-2.5">
                  {results.captions.map((caption, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-[14px] text-zinc-300 flex-1">{caption}</p>
                      <CopyButton text={caption} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Strategy */}
            {results.moodStrategy && (
              <div className="p-5 rounded-2xl bg-purple-500/[0.04] border border-purple-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-[13px] font-medium text-purple-400 uppercase tracking-wider">{results.moodStrategy.name} Tips</span>
                </div>
                <ul className="space-y-2.5">
                  {results.moodStrategy.whatMatters.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-zinc-300">
                      <span className="text-purple-400 mt-0.5">★</span>
                      {tip}
                    </li>
                  ))}
                </ul>
                {results.moodStrategy.advancedTips && results.moodStrategy.advancedTips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-500/10">
                    <p className="text-[12px] text-purple-400/70 uppercase tracking-wider mb-2">Pro Tips</p>
                    <ul className="space-y-2">
                      {results.moodStrategy.advancedTips.map((tip, i) => (
                        <li key={i} className="text-[13px] text-zinc-400 italic">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 text-center">
          <h3 className="font-semibold text-lg mb-2">Want feedback like this on your video?</h3>
          <p className="text-zinc-400 text-[14px] mb-4">Get instant AI analysis with actionable suggestions</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-white btn-premium rounded-xl cursor-pointer"
          >
            <SparklesIcon className="w-4 h-4" />
            Analyze Your Video Free
          </Link>
        </div>

        {/* Other Examples */}
        <div className="mt-10">
          <h3 className="font-semibold text-[15px] mb-4">More Examples</h3>
          <div className="grid gap-3">
            {SHOWCASE_EXAMPLES.filter(ex => ex.id !== example.id).slice(0, 3).map((ex) => (
              <Link 
                key={ex.id}
                href={`/examples/${ex.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-[12px] font-bold ${
                    ex.grade.startsWith('C') ? 'bg-amber-500/20 text-amber-300' :
                    ex.grade.startsWith('D') ? 'bg-orange-500/20 text-orange-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {ex.grade}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-white group-hover:text-purple-300 transition-colors">{ex.title}</p>
                    <p className="text-[12px] text-zinc-500">{MOOD_LABELS[ex.mood] || ex.mood}</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04] mt-10">
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

