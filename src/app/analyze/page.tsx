'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useUser, PricingTable } from '@clerk/nextjs';
import { Navbar } from '@/components/Navbar';

// Clean up any legacy IndexedDB data
async function clearVideoFromIDB(): Promise<void> {
  try {
    const request = indexedDB.open('tokbox-temp', 1);
    request.onsuccess = () => {
      const db = request.result;
      if (db.objectStoreNames.contains('pending-video')) {
        const tx = db.transaction('pending-video', 'readwrite');
        tx.objectStore('pending-video').clear();
      }
    };
  } catch {
    // Ignore errors - this is just cleanup
  }
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
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, SparklesIcon as SparklesSolid, PlayIcon } from '@heroicons/react/24/solid';
import { HookSet, HookType, HOOK_TYPE_INFO } from '@/lib/hooks';
import { CopyButton, GradeDisplay, ScoreRow, HookTabs, GRADE_COLORS } from '@/components/AnalysisResults';

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
  { id: 'promo', label: 'Promo', icon: MegaphoneIcon, desc: 'Promoting a product, service, or launch' },
] as const;

type MoodId = typeof MOOD_OPTIONS[number]['id'];

// Dynamic loading screen with cycling messages
function AnalyzingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  
  const ANALYSIS_STEPS = [
    { text: 'Uploading video...', duration: 2000 },
    { text: 'Extracting key frames...', duration: 3000 },
    { text: 'Analyzing visual composition...', duration: 4000 },
    { text: 'Evaluating hook potential...', duration: 5000 },
    { text: 'Checking pacing & energy...', duration: 4000 },
    { text: 'Studying successful patterns...', duration: 4000 },
    { text: 'Generating custom hooks...', duration: 5000 },
    { text: 'Crafting caption ideas...', duration: 4000 },
    { text: 'Calculating viral potential...', duration: 3000 },
    { text: 'Finalizing your analysis...', duration: 10000 },
  ];
  
  useEffect(() => {
    // Timer to track elapsed time
    const elapsedTimer = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    
    // Step progression
    let stepTimer: NodeJS.Timeout;
    const advanceStep = (index: number) => {
      if (index < ANALYSIS_STEPS.length - 1) {
        stepTimer = setTimeout(() => {
          setStepIndex(index + 1);
          advanceStep(index + 1);
        }, ANALYSIS_STEPS[index].duration);
      }
    };
    advanceStep(0);
    
    return () => {
      clearInterval(elapsedTimer);
      clearTimeout(stepTimer);
    };
  }, []);
  
  const currentStep = ANALYSIS_STEPS[stepIndex];
  const completedSteps = ANALYSIS_STEPS.slice(0, stepIndex);
  
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
        
        <h2 className="text-xl font-semibold mb-2">Analyzing your video</h2>
        
        {/* Time estimate */}
        <p className="text-zinc-500 text-[13px] mb-6">
          This usually takes 30-60 seconds
        </p>
        
        {/* Dynamic current step */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3 mb-6">
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-[15px] text-white">{currentStep.text}</span>
          </div>
        </div>
        
        {/* Completed steps */}
        <div className="space-y-2 text-[13px] max-h-32 overflow-hidden">
          {completedSteps.slice(-4).map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-zinc-500 animate-fade-in">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>{step.text.replace('...', '')}</span>
            </div>
          ))}
        </div>
        
        {/* Elapsed time */}
        <p className="text-zinc-600 text-[12px] mt-8">
          {elapsed}s elapsed
        </p>
      </div>
    </div>
  );
}

// Conversion card for anonymous/free users
function ConversionCard({ onAnalyzeAnother, isAnonymous }: { onAnalyzeAnother: () => void; isAnonymous: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.08] to-transparent p-6 space-y-5">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />
      
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <SparklesSolid className="w-5 h-5 text-purple-400" />
          <span className="text-[15px] font-semibold text-white">Ready for your next video?</span>
        </div>
        <p className="text-[14px] text-zinc-400 leading-relaxed">
          {isAnonymous 
            ? "Sign up to analyze more videos. Creators who analyze before posting see 2-3x better engagement."
            : "You've used your free analysis. Upgrade to keep improving your content."}
        </p>
      </div>
      
      {isAnonymous ? (
        // Anonymous user - prompt to sign up
        <a 
          href="/sign-up"
          className="relative block w-full py-3.5 text-center text-[15px] font-semibold text-white btn-premium rounded-xl"
        >
          Sign up free to continue
        </a>
      ) : (
        // Signed in but free tier - show pricing
        <div className="relative grid grid-cols-2 gap-3">
          {/* Creator Plan */}
          <a 
            href="/pricing"
            className="group flex flex-col p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-200"
          >
            <span className="text-[13px] text-zinc-500 mb-1">Creator</span>
            <span className="text-[20px] font-bold text-white">$9<span className="text-[13px] font-normal text-zinc-500">/mo</span></span>
            <span className="text-[12px] text-zinc-500 mt-1">30 videos/month</span>
          </a>
          
          {/* Pro Plan */}
          <a 
            href="/pricing"
            className="group flex flex-col p-4 rounded-xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[13px] text-purple-400">Pro</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">POPULAR</span>
            </div>
            <span className="text-[20px] font-bold text-white">$19<span className="text-[13px] font-normal text-zinc-500">/mo</span></span>
            <span className="text-[12px] text-zinc-500 mt-1">150/month</span>
          </a>
        </div>
      )}
      
      <button
        onClick={onAnalyzeAnother}
        className="w-full py-3 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
      >
        Maybe later
      </button>
    </div>
  );
}

// Upgrade prompt for when limit is reached
function UpgradePrompt({ plan, usage }: { plan: string; usage: { analysesUsed: number; analysesLimit: number } }) {
  const message = plan === 'creator' || plan === 'pro'
    ? `You've used ${usage.analysesUsed} of ${usage.analysesLimit} analyses this month.`
    : `You've used ${usage.analysesUsed} of ${usage.analysesLimit} analyses.`;
  
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5 text-amber-400" />
        <span className="text-[14px] font-medium text-amber-200">{message}</span>
      </div>
      {plan === 'creator' && (
        <a 
          href="/pricing"
          className="inline-flex items-center gap-2 text-[13px] text-purple-400 hover:text-purple-300 transition-colors"
        >
          Upgrade to Pro for 5/day
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

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
  
  // Usage info for conversion
  usage: {
    plan: 'anonymous' | 'free' | 'creator' | 'pro';
    modelUsed: 'premium' | 'fast';
    analysesUsed: number;
    analysesLimit: number;
    isLastFreeAnalysis: boolean;
  };
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
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [checkingUsage, setCheckingUsage] = useState(true);
  const [usageInfo, setUsageInfo] = useState<{
    plan: string;
    message: string;
    analysesUsed: number;
    analysesLimit: number;
    periodLabel: string;
  } | null>(null);

  // Check if signed-in user has remaining analyses
  useEffect(() => {
    const checkUsage = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        // Not signed in - they need to register first
        setCheckingUsage(false);
        return;
      }
      
      // For signed-in users, check their usage
      try {
        const response = await fetch('/api/check-usage');
        if (response.ok) {
          const data = await response.json();
          setNeedsUpgrade(data.limitReached);
          setUsageInfo({
            plan: data.plan,
            message: data.message,
            analysesUsed: data.analysesUsed,
            analysesLimit: data.analysesLimit,
            periodLabel: data.periodLabel,
          });
        }
      } catch {
        // If check fails, let them try - API will enforce
      }
      setCheckingUsage(false);
    };
    
    checkUsage();
  }, [isSignedIn, isLoaded]);

  // Clean up any old IndexedDB data on mount (legacy cleanup)
  useEffect(() => {
    clearVideoFromIDB();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      try {
        setPreview(URL.createObjectURL(videoFile));
      } catch (e) {
        console.error('Failed to create preview URL:', e);
        setPreview(null);
      }
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
    if (!file || !isSignedIn) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Step 1: Get presigned upload URL from our API
      console.log('Getting presigned upload URL...');
      const uploadUrlResponse = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'video/mp4',
        }),
      });
      
      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadUrl, videoUrl } = await uploadUrlResponse.json();
      
      // Step 2: Upload video directly to S3 (bypasses Vercel size limits)
      console.log('Uploading video to S3...', file.size, 'bytes');
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'video/mp4',
        },
        body: file,
      });
      
      if (!s3Response.ok) {
        throw new Error('Failed to upload video to storage');
      }
      
      console.log('Video uploaded, starting analysis...');
      
      // Step 3: Call analyze API with the S3 URL
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          mood: selectedMood,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle limit reached - redirect to sign-in or pricing
        if (data.error === 'limit_reached') {
          if (data.requiresSignUp) {
            // Anonymous user needs to sign up
            router.push('/sign-in?redirect_url=/analyze');
          } else if (data.upgradeRequired) {
            // Signed-in user needs to upgrade
            router.push('/pricing');
          }
          setError(data.message || 'Analysis limit reached');
          return;
        }
        throw new Error(data.error || 'Analysis failed');
      }

      // Include the selected mood in the result
      setResult({ ...data, selectedMood });
    } catch (err) {
      console.error('Analysis error:', err);
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
    return <AnalyzingScreen />;
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

      <main className="relative z-10 max-w-lg mx-auto px-5 py-6 safe-bottom">
        {/* Loading state while checking usage */}
        {checkingUsage && (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        )}
        
        {/* Registration Prompt - for users who haven't signed in */}
        {!checkingUsage && !isSignedIn && !result && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-5">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-[1.5rem] font-semibold tracking-tight mb-2">
                Get Your Free Video Analysis
              </h1>
              <p className="text-zinc-400 text-[15px] max-w-sm mx-auto">
                Create a free account to analyze your video and get AI-powered hooks, captions, and viral potential scores.
              </p>
            </div>
            
            <div className="space-y-3 max-w-sm mx-auto">
              <a
                href="/sign-up?redirect_url=/analyze"
                className="flex items-center justify-center gap-2 w-full py-4 text-center text-[15px] font-semibold rounded-xl btn-premium cursor-pointer"
              >
                Create Free Account
                <ArrowRightIcon className="w-4 h-4" />
              </a>
              <a
                href="/sign-in?redirect_url=/analyze"
                className="flex items-center justify-center gap-2 w-full py-3 text-center text-[14px] font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-colors cursor-pointer"
              >
                Already have an account? Sign in
              </a>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-10 grid gap-3 max-w-sm mx-auto">
              {[
                { icon: EyeIcon, text: 'AI analyzes your video frame-by-frame' },
                { icon: SparklesIcon, text: 'Get 3 custom hook styles for your content' },
                { icon: CheckCircleIcon, text: 'First analysis is completely free' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] text-zinc-500">
                  <feature.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Required Section - for signed-in users who've hit their limit */}
        {!checkingUsage && isSignedIn && needsUpgrade && !result && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-5">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-[1.5rem] font-semibold tracking-tight mb-2">
                {usageInfo?.plan === 'free'
                  ? "You've used your free analysis"
                  : usageInfo?.plan === 'creator'
                  ? "Monthly limit reached"
                  : usageInfo?.plan === 'pro'
                  ? "Monthly limit reached"
                  : "Limit reached"}
              </h1>
              <p className="text-zinc-400 text-[15px] max-w-sm mx-auto">
                {usageInfo?.plan === 'free'
                  ? "Upgrade to keep analyzing your videos and get more hooks, captions, and insights."
                  : usageInfo?.plan === 'creator'
                  ? `You've used ${usageInfo?.analysesUsed}/${usageInfo?.analysesLimit} analyses this month. Upgrade to Pro for 150/month!`
                  : usageInfo?.plan === 'pro'
                  ? `You've used ${usageInfo?.analysesUsed}/${usageInfo?.analysesLimit} analyses this month. Your limit resets next month.`
                  : "You've reached your limit for this period."}
              </p>
            </div>
            
            {usageInfo?.plan === 'pro' ? (
              // Pro user at limit - just show message, no upgrade option
              <div className="text-center">
                <p className="text-zinc-500 text-[14px] mb-4">
                  You&apos;re on our highest plan. Your limit resets at the start of next month.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-colors"
                >
                  Back to Dashboard
                </a>
              </div>
            ) : (
              // Free or Creator - show pricing table to upgrade
              <div className="max-w-md mx-auto">
                <PricingTable 
                  appearance={{
                    variables: {
                      colorPrimary: '#a855f7',
                      colorBackground: '#18181b',
                      colorText: '#fafafa',
                      colorTextSecondary: '#a1a1aa',
                    },
                    elements: {
                      card: 'bg-zinc-900 border-zinc-800 rounded-2xl',
                      button: 'btn-premium',
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Upload Section - only for signed-in users who can analyze */}
        {!checkingUsage && isSignedIn && !needsUpgrade && !result && (
          <>
            {!file ? (
              <div className="animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="text-[1.5rem] font-semibold tracking-tight mb-1">Analyze Your Video</h1>
                  <p className="text-zinc-500 text-[14px]">Get AI feedback in 30 seconds</p>
                </div>
                
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive
                      ? 'border-purple-500/50 bg-purple-500/[0.08]'
                      : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                    <ArrowUpTrayIcon className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-[16px] font-medium text-white mb-1.5">
                    {isDragActive ? 'Drop it here' : 'Upload your video'}
                  </p>
                  <p className="text-[13px] text-zinc-500">
                    MP4, MOV · Max 100MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* Compact Video Preview + Info Row */}
                <div className="flex gap-4 items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  {/* Video thumbnail with play button */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-black rounded-xl overflow-hidden border border-white/[0.08] group">
                    <video
                      id="preview-video"
                      src={preview || ''}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        // Seek to 0.1s to get a frame for thumbnail
                        (e.target as HTMLVideoElement).currentTime = 0.1;
                      }}
                    />
                    {/* Play button overlay */}
                    <button
                      onClick={() => {
                        const video = document.getElementById('preview-video') as HTMLVideoElement;
                        if (video) {
                          if (video.requestFullscreen) {
                            video.muted = false;
                            video.currentTime = 0;
                            video.requestFullscreen();
                            video.play();
                          } else {
                            // Fallback: just play in place
                            video.muted = false;
                            video.controls = true;
                            video.currentTime = 0;
                            video.play();
                          }
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </button>
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-white font-medium truncate mb-1">
                      {file.name}
                    </p>
                    <p className="text-[13px] text-zinc-500 mb-2">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    <button
                      onClick={reset}
                      className="text-[13px] text-zinc-500 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Mood Selector - Compact */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold text-[14px]">What&apos;s the vibe?</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {MOOD_OPTIONS.map((mood) => {
                      const IconComponent = mood.icon;
                      return (
                        <button
                          key={mood.id}
                          onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                            selectedMood === mood.id
                              ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                              : 'bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-300'
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                          {mood.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedMood && (
                    <p className="mt-2.5 text-[12px] text-zinc-500">
                      {MOOD_OPTIONS.find(m => m.id === selectedMood)?.desc}
                    </p>
                  )}
                </div>

                {/* Analyze Button */}
                <button
                  onClick={analyzeVideo}
                  disabled={analyzing}
                  className="w-full py-3.5 px-6 text-[15px] font-semibold text-white btn-premium rounded-xl disabled:opacity-60 disabled:hover:transform-none flex items-center justify-center gap-2.5 cursor-pointer"
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

            {/* Conversion / Analyze Another */}
            {result.usage?.isLastFreeAnalysis ? (
              <ConversionCard 
                onAnalyzeAnother={reset} 
                isAnonymous={result.usage?.plan === 'anonymous'}
              />
            ) : (
              <>
                {/* Usage indicator for paid users */}
                {result.usage && result.usage.plan !== 'free' && (
                  <UpgradePrompt plan={result.usage.plan} usage={result.usage} />
                )}
                
                <button
                  onClick={reset}
                  className="w-full py-4 px-6 font-semibold text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-2xl transition-all duration-200 text-[15px] cursor-pointer"
                >
                  Analyze Another Video
                </button>
              </>
            )}

            {/* Footer info */}
            <p className="text-center text-[13px] text-zinc-600">
              Analyzed in {(result.processingTimeMs / 1000).toFixed(1)}s
              {result.usage?.modelUsed === 'fast' && (
                <span className="ml-2 text-zinc-500">• Fast mode</span>
              )}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
