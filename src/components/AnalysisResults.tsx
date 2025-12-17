'use client';

import { useState } from 'react';
import {
  ClipboardIcon,
  CheckIcon,
  SparklesIcon,
  EyeIcon,
  BoltIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import { HookSet, HookType, HOOK_TYPE_INFO } from '@/lib/hooks';

// Copy button for hooks and captions
export function CopyButton({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const sizeClasses = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10';
  const iconClasses = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  
  return (
    <button
      onClick={handleCopy}
      className={`${sizeClasses} rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer`}
    >
      {copied ? (
        <CheckIcon className={`${iconClasses} text-emerald-400`} />
      ) : (
        <ClipboardIcon className={`${iconClasses} text-zinc-500`} />
      )}
    </button>
  );
}

// Grade display card with glow effect
export function GradeDisplay({ grade, color, potential, summary }: { 
  grade: string; 
  color: string; 
  potential: number;
  summary: string;
}) {
  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] overflow-hidden">
      {/* Refined glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/15 rounded-full blur-[60px]" />
      
      <div className="relative flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
          <SparklesSolid className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[13px] text-zinc-400 font-medium">Analysis Complete</span>
        </div>
        
        <div className={`flex items-center justify-center w-32 h-32 rounded-[32px] text-[3.5rem] font-semibold mb-5 shadow-2xl border border-white/10 ${color}`}>
          {grade}
        </div>
        
        <div className="text-lg font-medium mb-2">
          Viral Potential: <span className="text-purple-400 tabular-nums">{potential}/10</span>
        </div>
        
        <p className="text-[15px] text-zinc-400 max-w-sm leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}

// Score row with progress bar
export function ScoreRow({ icon: Icon, label, score, feedback }: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string; 
  score: number; 
  feedback: string;
}) {
  const getBarColor = (s: number) => {
    if (s >= 8) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (s >= 6) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    if (s >= 4) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-400';
    if (s >= 6) return 'text-amber-400';
    if (s >= 4) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-zinc-400" />
          <span className="font-medium text-[15px]">{label}</span>
        </div>
        <span className={`text-lg font-semibold tabular-nums ${getScoreColor(score)}`}>
          {score}<span className="text-zinc-600">/10</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(score)}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <p className="text-[14px] text-zinc-500 leading-relaxed">{feedback}</p>
    </div>
  );
}

const HOOK_ICONS = {
  lightbulb: LightBulbIcon,
  bolt: BoltIcon,
  sparkles: SparklesIcon,
} as const;

// Hook tabs with copy functionality
export function HookTabs({ hooks, recommendedType }: { hooks: HookSet; recommendedType: HookType }) {
  const [activeTab, setActiveTab] = useState<HookType>(recommendedType || 'curiosity_gap');
  
  const tabs: { type: HookType; hooks: { text: string }[] }[] = [
    { type: 'curiosity_gap', hooks: hooks.curiosityGap },
    { type: 'pattern_interrupt', hooks: hooks.patternInterrupt },
    { type: 'aspirational', hooks: hooks.aspirational },
  ];
  
  const activeHooks = tabs.find(t => t.type === activeTab)?.hooks || [];
  const info = HOOK_TYPE_INFO[activeTab];
  const ActiveIcon = HOOK_ICONS[info.iconName];
  
  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 overflow-x-auto pt-4 pb-1 scrollbar-hide -mx-1 px-1">
        {tabs.map(({ type }) => {
          const tabInfo = HOOK_TYPE_INFO[type];
          const TabIcon = HOOK_ICONS[tabInfo.iconName];
          const isActive = type === activeTab;
          const isRecommended = type === recommendedType;
          
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`relative flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 font-medium text-[14px] cursor-pointer ${
                isActive 
                  ? 'bg-white/[0.08] text-white border border-white/[0.12]' 
                  : 'bg-white/[0.02] text-zinc-400 border border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? tabInfo.color : ''}`} />
              <span>{tabInfo.name}</span>
              {isRecommended && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 bg-purple-500 rounded text-[10px] font-bold text-white shadow-lg">
                  BEST
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Hook content */}
      <div className={`p-5 rounded-2xl border ${info.bgColor} ${info.borderColor}`}>
        <p className="text-[13px] text-zinc-500 mb-4">{info.description}</p>
        
        {activeHooks.length > 0 ? (
          <div className="space-y-2.5">
            {activeHooks.map((hook, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between gap-3 p-4 rounded-xl bg-black/30 border border-white/[0.04]"
              >
                <p className="text-[15px] text-white flex-1 leading-snug">{hook.text}</p>
                <CopyButton text={hook.text} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-zinc-500 italic">No hooks generated for this style</p>
        )}
      </div>
    </div>
  );
}

// Content description section
export function ContentDescription({ description }: { description: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-3">
        <EyeIcon className="w-4 h-4 text-zinc-500" />
        <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-wider">What we see</span>
      </div>
      <p className="text-[15px] text-zinc-300 leading-relaxed">{description}</p>
    </div>
  );
}

// Strengths and improvements sections
export function StrengthsSection({ strengths }: { strengths: string[] }) {
  return (
    <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/10">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
        <span className="text-[13px] font-medium text-emerald-400 uppercase tracking-wider">What&apos;s Working</span>
      </div>
      <ul className="space-y-2.5">
        {strengths.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] text-zinc-300">
            <span className="text-emerald-400 mt-0.5">•</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ImprovementsSection({ improvements }: { improvements: string[] }) {
  return (
    <div className="p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/10">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightIcon className="w-4 h-4 text-amber-400" />
        <span className="text-[13px] font-medium text-amber-400 uppercase tracking-wider">To Improve</span>
      </div>
      <ul className="space-y-2.5">
        {improvements.map((imp, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] text-zinc-300">
            <span className="text-amber-400 mt-0.5">→</span>
            {imp}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Caption suggestions section
export function CaptionSuggestions({ captions }: { captions: string[] }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
      <div className="space-y-2.5">
        {captions.map((caption, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <p className="text-[15px] text-zinc-300 flex-1">{caption}</p>
            <CopyButton text={caption} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Mood strategy tips section
export function MoodStrategyTips({ strategy }: { strategy: { name: string; whatMatters: string[]; advancedTips?: string[] } }) {
  return (
    <div className="p-5 rounded-2xl bg-purple-500/[0.04] border border-purple-500/10">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-4 h-4 text-purple-400" />
        <span className="text-[13px] font-medium text-purple-400 uppercase tracking-wider">{strategy.name} Tips</span>
      </div>
      <ul className="space-y-2.5">
        {strategy.whatMatters.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] text-zinc-300">
            <span className="text-purple-400 mt-0.5">★</span>
            {tip}
          </li>
        ))}
      </ul>
      {strategy.advancedTips && strategy.advancedTips.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-500/10">
          <p className="text-[12px] text-purple-400/70 uppercase tracking-wider mb-2">Pro Tips</p>
          <ul className="space-y-2">
            {strategy.advancedTips.map((tip, i) => (
              <li key={i} className="text-[13px] text-zinc-400 italic">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// The One Thing insight
export function TheOneThing({ insight }: { insight: string }) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-3">
        <LightBulbIcon className="w-4 h-4 text-purple-400" />
        <span className="text-[13px] font-medium text-purple-400 uppercase tracking-wider">The One Thing</span>
      </div>
      <p className="text-[15px] text-white leading-relaxed">{insight}</p>
    </div>
  );
}

// Advanced insight
export function AdvancedInsight({ insight }: { insight: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-3">
        <BoltIcon className="w-4 h-4 text-amber-400" />
        <span className="text-[13px] font-medium text-amber-400 uppercase tracking-wider">Advanced Insight</span>
      </div>
      <p className="text-[14px] text-zinc-400 leading-relaxed">{insight}</p>
    </div>
  );
}

// Grade color mapping utility
export const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
  'A': 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
  'A-': 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
  'B+': 'bg-gradient-to-br from-lime-500 to-lime-600 text-white',
  'B': 'bg-gradient-to-br from-lime-500 to-lime-600 text-white',
  'B-': 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
  'C+': 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
  'C': 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
  'C-': 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
  'D+': 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
  'D': 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
  'D-': 'bg-gradient-to-br from-red-500 to-red-600 text-white',
  'F': 'bg-gradient-to-br from-red-500 to-red-600 text-white',
};

// Analysis result interface for type safety
export interface AnalysisResultData {
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
  hooks: {
    curiosityGap: { text: string; why?: string }[];
    patternInterrupt: { text: string; why?: string }[];
    aspirational: { text: string; why?: string }[];
  };
  recommendedHookType: string;
  captions: string[];
  moodStrategy?: {
    name: string;
    whatMatters: string[];
    advancedTips?: string[];
  };
  selectedMood?: string;
}

