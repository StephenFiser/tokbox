'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/analyze';

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-purple-500/[0.07] via-purple-500/[0.02] to-transparent rounded-full blur-3xl" />
      </div>

      <Navbar showPricing={false} />

      {/* Sign Up */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20 pt-8">
        <SignUp 
          forceRedirectUrl={redirectUrl}
          signInForceRedirectUrl={redirectUrl}
          appearance={{
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
            elements: {
              rootBox: 'mx-auto w-full max-w-[400px]',
              card: 'bg-[#18181b] border border-white/[0.08] shadow-2xl rounded-2xl',
              headerTitle: 'text-white text-xl',
              headerSubtitle: 'text-zinc-400',
              socialButtonsBlockButton: 
                'bg-zinc-800 border border-white/[0.1] hover:bg-zinc-700 text-white rounded-xl h-12 w-full flex items-center justify-center gap-3',
              socialButtonsBlockButtonText: 'text-white font-medium text-[15px]',
              socialButtonsProviderIcon: 'w-5 h-5',
              dividerLine: 'bg-white/[0.08]',
              dividerText: 'text-zinc-500 text-[13px]',
              formFieldLabel: 'text-zinc-300 text-[14px]',
              formFieldInput: 
                'bg-zinc-800 border border-white/[0.1] text-white rounded-xl h-12 focus:border-purple-500/50 focus:ring-purple-500/20 placeholder:text-zinc-500',
              formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-white',
              formButtonPrimary: 
                'bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl h-12 text-[15px]',
              footerAction: 'pt-4',
              footerActionText: 'text-zinc-400 text-[14px]',
              footerActionLink: 'text-purple-400 hover:text-purple-300 font-medium',
              identityPreview: 'bg-zinc-800 border border-white/[0.1] rounded-xl',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-purple-400 hover:text-purple-300',
              formResendCodeLink: 'text-purple-400 hover:text-purple-300',
              otpCodeFieldInput: 'bg-zinc-800 border border-white/[0.1] text-white rounded-lg',
              alert: 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl',
              alertText: 'text-red-400',
            },
          }}
        />
      </main>
    </div>
  );
}
