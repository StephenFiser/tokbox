import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getTotalAnalysisCount, getMonthlyAnalysisCount, getDailyAnalysisCount, USAGE_LIMITS } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId, has } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        limitReached: false,
        message: 'Not signed in' 
      });
    }
    
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    // Admin emails with unlimited access
    const ADMIN_EMAILS = ['faincapital@gmail.com'];
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    
    if (isAdmin) {
      return NextResponse.json({
        limitReached: false,
        plan: 'admin',
        message: '',
        analysesUsed: 0,
        analysesLimit: 999999,
        periodLabel: 'unlimited',
        email: userEmail,
      });
    }
    
    const hasPro = has?.({ plan: 'pro' }) || false;
    const hasCreator = has?.({ plan: 'creator' }) || false;
    const plan = hasPro ? 'pro' : hasCreator ? 'creator' : 'free';
    
    let limitReached = false;
    let message = '';
    let analysesUsed = 0;
    let analysesLimit = 1;
    let periodLabel = 'total';
    
    if (plan === 'free') {
      const totalCount = await getTotalAnalysisCount(userId);
      analysesUsed = totalCount;
      analysesLimit = USAGE_LIMITS.free.totalAnalyses;
      periodLabel = 'total';
      limitReached = totalCount >= analysesLimit;
      message = limitReached ? 'You\'ve used your free analysis. Upgrade to continue!' : '';
    } else if (plan === 'creator') {
      const monthlyCount = await getMonthlyAnalysisCount(userId);
      analysesUsed = monthlyCount;
      analysesLimit = USAGE_LIMITS.creator.monthlyAnalyses;
      periodLabel = 'this month';
      limitReached = monthlyCount >= analysesLimit;
      message = limitReached ? 'You\'ve reached your 30 analyses this month.' : '';
    } else if (plan === 'pro') {
      const monthlyCount = await getMonthlyAnalysisCount(userId);
      analysesUsed = monthlyCount;
      analysesLimit = USAGE_LIMITS.pro.monthlyAnalyses;
      periodLabel = 'this month';
      limitReached = monthlyCount >= analysesLimit;
      message = limitReached ? 'You\'ve reached your 150 analyses this month.' : '';
    }
    
    return NextResponse.json({
      limitReached,
      plan,
      message,
      analysesUsed,
      analysesLimit,
      periodLabel,
      email: user?.emailAddresses?.[0]?.emailAddress,
    });
    
  } catch (error) {
    console.error('Failed to check usage:', error);
    return NextResponse.json({ limitReached: false });
  }
}
