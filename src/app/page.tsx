'use client';

import Link from 'next/link';
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
} from '@heroicons/react/24/outline';

export default function LandingPage() {
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
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-[12px] text-purple-300 font-medium">20/mo</span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-[12px] text-purple-300 font-medium">History</span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-[12px] text-purple-300 font-medium">Priority</span>
              </div>
              <Link href="/analyze" className="block w-full py-3 text-center text-[14px] font-semibold text-white btn-premium rounded-xl">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Pro</h3>
                  <p className="text-[13px] text-zinc-500">Unlimited everything</p>
                </div>
                <div>
                  <span className="text-2xl font-semibold">$19</span>
                  <span className="text-zinc-500 text-[14px]">/mo</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[12px] text-zinc-400 font-medium">Unlimited</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[12px] text-zinc-400 font-medium">API (soon)</span>
              </div>
              <Link href="/analyze" className="block w-full py-3 text-center text-[14px] font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] rounded-xl transition-all duration-200">
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
