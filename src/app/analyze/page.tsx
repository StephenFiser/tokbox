'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser } from '@clerk/nextjs';
import { Navbar } from '@/components/Navbar';

// IndexedDB helpers to persist video across auth redirect
const DB_NAME = 'tokbox-temp';
const STORE_NAME = 'pending-video';

async function saveVideoToIDB(file: File, mood: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ file, mood, timestamp: Date.now() }, 'pending');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

async function loadVideoFromIDB(): Promise<{ file: File; mood: string | null } | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => resolve(null);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get('pending');
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        // Only use if less than 10 minutes old
        if (data && Date.now() - data.timestamp < 10 * 60 * 1000) {
          resolve({ file: data.file, mood: data.mood });
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = () => resolve(null);
    };
  });
}

async function clearVideoFromIDB(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete('pending');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
  });
}
import {
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ClipboardIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  EyeIcon,
  BoltIcon,
  FireIcon,
  FaceSmileIcon,
  StarIcon,
  MoonIcon,
  ArrowsRightLeftIcon,
  HomeIcon,
  HeartIcon,
  FaceFrownIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PaintBrushIcon,
  FilmIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  ChatBubbleBottomCenterTextIcon,
  CloudIcon,
  MusicalNoteIcon,
  LightBulbIcon,
  ArrowRightIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import { HookSet, HookType, HOOK_TYPE_INFO } from '@/lib/hooks';

// Mood options for creators to select
const MOOD_OPTIONS = [
  { id: 'thirst', label: 'Thirst Trap', icon: FireIcon, desc: 'Confident, alluring, attention-grabbing' },
  { id: 'relatable', label: 'Relatable', icon: FaceSmileIcon, desc: 'Funny, self-deprecating, everyday struggles' },
  { id: 'confident', label: 'Confident', icon: StarIcon, desc: 'Unbothered, self-assured, boss energy' },
  { id: 'mysterious', label: 'Mysterious', icon: MoonIcon, desc: 'Intriguing, enigmatic, leaves them wondering' },
  { id: 'transformation', label: 'Transformation', icon: ArrowsRightLeftIcon, desc: 'Glow up, before/after, evolution' },
  { id: 'lifestyle', label: 'Lifestyle', icon: HomeIcon, desc: 'Aspirational, living well, aesthetic' },
  { id: 'workout', label: 'Workout', icon: HeartIcon, desc: 'Fitness motivation, gym content, gains' },
  { id: 'funny', label: 'Comedy', icon: FaceFrownIcon, desc: 'Making people laugh, jokes, chaos' },
  { id: 'storytime', label: 'Storytime', icon: BookOpenIcon, desc: 'Narrative, tea to spill, drama' },
  { id: 'tutorial', label: 'Tutorial', icon: AcademicCapIcon, desc: 'Teaching something, how-to, tips' },
  { id: 'trend', label: 'Trend', icon: ChartBarIcon, desc: 'Following a viral format or sound' },
  { id: 'grwm', label: 'GRWM', icon: PaintBrushIcon, desc: 'Get ready with me, routine content' },
  { id: 'pov', label: 'POV', icon: FilmIcon, desc: 'Point of view storytelling' },
  { id: 'vlog', label: 'Day in Life', icon: VideoCameraIcon, desc: 'Vlog style, daily content' },
  { id: 'flex', label: 'Flex', icon: CurrencyDollarIcon, desc: 'Showing off, humble brag, wins' },
  { id: 'vulnerable', label: 'Vulnerable', icon: ChatBubbleBottomCenterTextIcon, desc: 'Real talk, honest, emotional' },
  { id: 'chaotic', label: 'Chaotic', icon: CloudIcon, desc: 'Unhinged, random, unpredictable' },
  { id: 'asmr', label: 'Satisfying', icon: MusicalNoteIcon, desc: 'ASMR vibes, calming, satisfying' },
] as const;

type MoodId = typeof MOOD_OPTIONS[number]['id'];

interface AnalysisResult {
  id: string;
  grade: string;
  gradeColor: string;
  viralPotential: number;
  summary: string;
  
  // Context awareness
  existingTextOverlay: string | null;
  isTrendFormat: boolean;
  trendType: string | null;
  intent: string | null;
  selectedMood: MoodId | null;
  
  scores: {
    hook: { score: number; label: string; feedback: string };
    visual: { score: number; label: string; feedback: string };
    pacing: { score: number; label: string; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  contentDescription: string;
  hooks: HookSet;
  recommendedHookType: HookType;
  existingTextAssessment: string | null;
  whyThisHookType: string | null;
  captions: string[];
  processingTimeMs: number;
  
  // Advanced insights
  theOneThing: string | null;
  advancedInsight: string | null;
  moodStrategy: {
    name: string;
    whatMatters: string[];
    advancedTips: string[];
  } | null;
}

function CopyButton({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
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
      className={`${sizeClasses} rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all duration-200 active:scale-95`}
    >
      {copied ? (
        <CheckIcon className={`${iconClasses} text-emerald-400`} />
      ) : (
        <ClipboardIcon className={`${iconClasses} text-zinc-500`} />
      )}
    </button>
  );
}

function GradeDisplay({ grade, color, potential, summary }: { 
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

function ScoreRow({ icon: Icon, label, score, feedback }: { 
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

function HookTabs({ hooks, recommendedType }: { hooks: HookSet; recommendedType: HookType }) {
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

export default function AnalyzePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  // On mount, check for pending video from before auth redirect
  useEffect(() => {
    async function checkPendingVideo() {
      // Only check once when signed in and no file loaded yet
      if (!isLoaded || !isSignedIn || file || restoredFromStorage) {
        return;
      }
      
      console.log('[TokBox] Checking for pending video in IndexedDB...');
      const data = await loadVideoFromIDB();
      
      if (!data) {
        console.log('[TokBox] No pending video found');
        return;
      }
      
      console.log('[TokBox] Found pending video, restoring...', { mood: data.mood });
      
      setRestoredFromStorage(true);
      setFile(data.file);
      setPreview(URL.createObjectURL(data.file));
      if (data.mood) {
        setSelectedMood(data.mood as MoodId);
      }
      
      // Clear from storage
      await clearVideoFromIDB();
      
      // Auto-start analysis
      console.log('[TokBox] Starting auto-analysis...');
      setAnalyzing(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('video', data.file);
      if (data.mood) {
        formData.append('mood', data.mood);
      }

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }
        
        const result = await response.json();
        setResult({ ...result, selectedMood: data.mood as MoodId });
        console.log('[TokBox] Analysis complete!');
      } catch (err) {
        console.error('[TokBox] Analysis failed:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setAnalyzing(false);
      }
    }
    
    checkPendingVideo();
  }, [isLoaded, isSignedIn, file, restoredFromStorage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      setPreview(URL.createObjectURL(videoFile));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const analyzeVideo = async () => {
    if (!file) return;

    // Check if user is signed in
    if (!isSignedIn) {
      // Save video to IndexedDB before auth redirect
      console.log('[TokBox] Saving video to IndexedDB before redirect...', { mood: selectedMood });
      await saveVideoToIDB(file, selectedMood);
      console.log('[TokBox] Saved! Redirecting to sign-in...');
      router.push('/sign-in?redirect_url=/analyze');
      return;
    }

    runAnalysis();
  };

  const runAnalysis = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);
      if (selectedMood) {
        formData.append('mood', selectedMood);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
      // Include the selected mood in the result
      setResult({ ...data, selectedMood });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSelectedMood(null);
    setResult(null);
    setError(null);
    clearVideoFromIDB();
  };

  // Show fullscreen loading when analyzing
  if (analyzing) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/[0.08] rounded-full blur-[120px] animate-pulse-soft" />
        </div>
        
        <Navbar sticky showPricing={false} />
        
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* Animated loader */}
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-3">Analyzing your video</h2>
          <p className="text-zinc-400 text-center max-w-xs mb-8">
            Our AI is reviewing your content for viral potential, hook strength, and visual quality
          </p>
          
          {/* Progress steps */}
          <div className="space-y-3 text-[14px]">
            <div className="flex items-center gap-3 text-zinc-400">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Video uploaded</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Extracting key frames</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <ArrowPathIcon className="w-4 h-4 animate-spin text-purple-400" />
              <span>AI analysis in progress...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <Navbar 
        sticky
        showPricing={false}
        rightContent={
          result && (
            <button
              onClick={reset}
              className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5 text-zinc-400" />
            </button>
          )
        }
      />

      <main className="relative z-10 max-w-lg mx-auto px-6 py-10 safe-bottom">
        {/* Upload Section */}
        {!result && (
          <>
            {!file ? (
              <div className="animate-fade-in">
                <div className="text-center mb-10">
                  <h1 className="text-[1.75rem] font-semibold tracking-tight mb-2">Analyze Your Video</h1>
                  <p className="text-zinc-500">Get AI feedback in 30 seconds</p>
                </div>
                
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive
                      ? 'border-purple-500/50 bg-purple-500/[0.08]'
                      : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                    <ArrowUpTrayIcon className="w-7 h-7 text-zinc-500" />
                  </div>
                  <p className="text-lg font-medium text-white mb-2">
                    {isDragActive ? 'Drop it here' : 'Upload your video'}
                  </p>
                  <p className="text-[14px] text-zinc-500 mb-1">
                    Drag & drop or tap to select
                  </p>
                  <p className="text-[13px] text-zinc-600">
                    MP4, MOV · Max 100MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Video Preview */}
                <div className="aspect-[9/16] max-h-[50vh] bg-black rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
                  <video
                    src={preview || ''}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                  />
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[14px] text-zinc-400 truncate flex-1 font-medium">
                    {file.name}
                  </span>
                  <button
                    onClick={reset}
                    className="text-[14px] text-zinc-500 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                {/* Mood Selector */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-2.5 mb-4">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-[15px]">What&apos;s the vibe?</h3>
                      <p className="text-[13px] text-zinc-500">This helps us suggest better hooks</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {MOOD_OPTIONS.map((mood) => {
                      const IconComponent = mood.icon;
                      return (
                        <button
                          key={mood.id}
                          onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                            selectedMood === mood.id
                              ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                              : 'bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-300'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {mood.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedMood && (
                    <p className="mt-3 text-[13px] text-zinc-500">
                      {MOOD_OPTIONS.find(m => m.id === selectedMood)?.desc}
                    </p>
                  )}
                </div>

                {/* Analyze Button */}
                <button
                  onClick={analyzeVideo}
                  disabled={analyzing}
                  className="w-full py-4 px-6 text-[16px] font-semibold text-white btn-premium rounded-2xl disabled:opacity-60 disabled:hover:transform-none flex items-center justify-center gap-3 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Analyze Video
                    </>
                  )}
                </button>
                
                {analyzing && (
                  <p className="text-center text-[14px] text-zinc-500">
                    This takes about 30-60 seconds
                  </p>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-[14px]">
                    {error}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Grade Card */}
            <GradeDisplay 
              grade={result.grade}
              color={result.gradeColor}
              potential={result.viralPotential}
              summary={result.summary}
            />
            
            {/* What AI Sees */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2.5 mb-3">
                <EyeIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-[13px] font-medium text-zinc-500 uppercase tracking-wide">What we see</h3>
              </div>
              <p className="text-[15px] text-zinc-300 leading-relaxed mb-3">{result.contentDescription}</p>
              
              {/* Context badges */}
              <div className="flex flex-wrap gap-2">
                {result.selectedMood && (() => {
                  const moodOption = MOOD_OPTIONS.find(m => m.id === result.selectedMood);
                  const IconComponent = moodOption?.icon;
                  return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[12px] text-purple-300 font-medium">
                      {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                      {moodOption?.label || result.selectedMood}
                    </span>
                  );
                })()}
                {result.isTrendFormat && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[12px] text-indigo-300 font-medium">
                    <ChartBarIcon className="w-3.5 h-3.5" />
                    Trend{result.trendType ? `: ${result.trendType}` : ''}
                  </span>
                )}
              </div>
            </div>
            
            {/* Existing Text Overlay */}
            {result.existingTextOverlay && (
              <div className="p-5 rounded-2xl bg-indigo-500/[0.05] border border-indigo-500/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <ChatBubbleLeftIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[13px] font-medium text-indigo-400 uppercase tracking-wide">Your Current Text</h3>
                </div>
                <p className="text-[15px] text-white font-medium mb-3">{result.existingTextOverlay}</p>
                {result.existingTextAssessment && (
                  <p className="text-[14px] text-zinc-400 leading-relaxed">{result.existingTextAssessment}</p>
                )}
              </div>
            )}

            {/* Score Breakdown */}
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

            {/* What's Working */}
            {result.strengths.length > 0 && (
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

            {/* To Improve */}
            {result.improvements.length > 0 && (
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

            {/* The One Thing - Most impactful change */}
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

            {/* Advanced Insight */}
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
                  {result.existingTextOverlay ? 'Alternative Text Options' : 'Text Overlays'}
                </h3>
                <p className="text-[14px] text-zinc-500">
                  {result.existingTextOverlay 
                    ? 'If you want to try something different'
                    : 'Add one of these in the first 2 seconds'
                  }
                </p>
              </div>
              <HookTabs hooks={result.hooks} recommendedType={result.recommendedHookType} />
              
              {/* Why this hook type */}
              {result.whyThisHookType && (
                <p className="mt-4 text-[13px] text-zinc-500 italic">
                  {result.whyThisHookType}
                </p>
              )}
            </div>

            {/* Captions */}
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

            {/* Analyze Another */}
            <button
              onClick={reset}
              className="w-full py-4 px-6 font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-2xl transition-all duration-200 text-[15px]"
            >
              Analyze Another Video
            </button>

            {/* Footer info */}
            <p className="text-center text-[13px] text-zinc-600">
              Analyzed in {(result.processingTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
