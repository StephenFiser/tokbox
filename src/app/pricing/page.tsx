'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Try it out',
    features: [
      '1 video analysis',
      'All 3 hook styles',
      'Visual feedback',
      'Caption ideas',
    ],
    cta: 'Start Free',
    href: '/analyze',
    featured: false,
  },
  {
    name: 'Creator',
    price: '$9',
    period: '/mo',
    description: 'For active creators',
    features: [
      '20 analyses per month',
      'Priority processing',
      'Analysis history',
      'Save favorites',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/analyze',
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'Unlimited everything',
    features: [
      'Unlimited analyses',
      'Everything in Creator',
      'Bulk upload (soon)',
      'API access (soon)',
      'Priority support',
    ],
    cta: 'Get Started',
    href: '/analyze',
    featured: false,
  },
];

const FAQS = [
  {
    q: 'What counts as an analysis?',
    a: 'Each video you upload and analyze counts as one. Re-analyzing after edits also counts.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime and keep access until your billing period ends.',
  },
  {
    q: 'What if I need more analyses?',
    a: 'Upgrade to Pro for unlimited, or wait for your next billing cycle.',
  },
  {
    q: 'Do you store my videos?',
    a: 'Videos are processed then deleted. We keep analysis results, not video files.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <Navbar 
        rightContent={
          <Link
            href="/analyze"
            className="px-4 py-2.5 text-[14px] font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-all duration-200"
          >
            Try Free
          </Link>
        }
      />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-20 safe-bottom">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-[2.5rem] font-semibold tracking-tight mb-4">
            Simple pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready to take your content seriously.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-5 sm:grid-cols-3 mb-24">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-3xl border transition-all duration-300 ${
                plan.featured
                  ? 'bg-gradient-to-b from-purple-500/[0.1] to-purple-500/[0.03] border-purple-500/25 hover:border-purple-500/35 shadow-lg shadow-purple-500/5'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-purple-500 rounded-full text-[11px] font-semibold text-white shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-zinc-500 text-[14px]">{plan.period}</span>
                </div>
                <p className="text-[13px] text-zinc-500">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px]">
                    <CheckIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      plan.featured ? 'text-purple-400' : 'text-emerald-400'
                    }`} />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 w-full py-3 text-center text-[14px] font-semibold rounded-xl transition-all duration-200 ${
                  plan.featured
                    ? 'btn-premium text-white'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.06]'
                }`}
              >
                {plan.cta}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-[1.75rem] font-semibold text-center mb-12">
            Questions? Answers.
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200">
                <h3 className="font-semibold text-[15px] mb-2">{faq.q}</h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-[1.75rem] font-semibold mb-5">
            Ready to go viral?
          </h2>
          <Link
            href="/analyze"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-[16px] font-semibold text-white btn-premium rounded-2xl"
          >
            Try Your First Analysis Free
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04] safe-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-3.5 h-3.5 text-white" />
            </div>
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
