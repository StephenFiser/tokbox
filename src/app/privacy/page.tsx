'use client';

import Link from 'next/link';
import { Navbar, TokBoxLogo } from '@/components/Navbar';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar showPricing={false} />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-[2rem] font-semibold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 mb-10">Last updated: December 2024</p>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-zinc-400 leading-relaxed">
              tok.box ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              AI-powered video analysis service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li><strong className="text-zinc-300">Account Information:</strong> Email address, name, and authentication data when you create an account</li>
              <li><strong className="text-zinc-300">Video Content:</strong> Videos you upload for analysis (temporarily processed, not permanently stored)</li>
              <li><strong className="text-zinc-300">Usage Data:</strong> Analysis history, mood selections, and interaction patterns</li>
              <li><strong className="text-zinc-300">Payment Information:</strong> Processed securely through Stripe; we do not store your full payment details</li>
              <li><strong className="text-zinc-300">Device Information:</strong> IP address, browser type, and device identifiers for security and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Provide and improve our video analysis service</li>
              <li>Process your payments and manage your subscription</li>
              <li>Send you service-related communications</li>
              <li>Analyze usage patterns to improve our product</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Video Processing</h2>
            <p className="text-zinc-400 leading-relaxed">
              Videos you upload are processed in real-time to generate analysis results. We extract frames 
              temporarily for AI analysis. <strong className="text-zinc-300">We do not permanently store your original 
              video files.</strong> Frame data is processed and then deleted. Analysis results (text-based feedback, 
              scores, and suggestions) are stored in your account history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Data Sharing</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li><strong className="text-zinc-300">Service Providers:</strong> Cloud hosting (Vercel, AWS), authentication (Clerk), payment processing (Stripe), and AI services (OpenAI, Anthropic)</li>
              <li><strong className="text-zinc-300">Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-zinc-400 leading-relaxed">
              We implement industry-standard security measures including encryption in transit (HTTPS), 
              secure authentication, and access controls. However, no method of transmission over the 
              internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
              <li>Access, correct, or delete your personal data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Request restriction of processing</li>
            </ul>
            <p className="text-zinc-400 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@tok.box
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-zinc-400 leading-relaxed">
              We use essential cookies for authentication and session management. We also use analytics 
              cookies (Vercel Analytics) to understand how our service is used. You can disable cookies 
              in your browser settings, but this may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-zinc-400 leading-relaxed">
              Our service is not intended for users under 13 years of age. We do not knowingly collect 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-zinc-400 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-zinc-400 leading-relaxed">
              If you have questions about this privacy policy, please contact us at:{' '}
              <a href="mailto:privacy@tok.box" className="text-purple-400 hover:text-purple-300">
                privacy@tok.box
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.04] mt-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <TokBoxLogo className="w-7 h-7" />
            <span className="text-[14px] font-medium">tok.box</span>
          </div>
          <div className="flex gap-6 text-[14px] text-zinc-500">
            <span className="text-white">Privacy</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
