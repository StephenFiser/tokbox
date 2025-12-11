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
    const hasPro = has?.({ plan: 'pro' }) || false;
    const hasCreator = has?.({ plan: 'creator' }) || false;
    const plan = hasPro ? 'pro' : hasCreator ? 'creator' : 'free';
    
    let limitReached = false;
    let message = '';
    
    if (plan === 'free') {
      const totalCount = await getTotalAnalysisCount(userId);
      limitReached = totalCount >= USAGE_LIMITS.free.totalAnalyses;
      message = limitReached ? 'You\'ve used your free analysis. Upgrade to continue!' : '';
    } else if (plan === 'creator') {
      const monthlyCount = await getMonthlyAnalysisCount(userId);
      limitReached = monthlyCount >= USAGE_LIMITS.creator.monthlyAnalyses;
      message = limitReached ? 'You\'ve reached your 30 analyses this month.' : '';
    } else if (plan === 'pro') {
      const dailyCount = await getDailyAnalysisCount(userId);
      limitReached = dailyCount >= USAGE_LIMITS.pro.dailyAnalyses;
      message = limitReached ? 'You\'ve reached your 5 analyses for today. Come back tomorrow!' : '';
    }
    
    return NextResponse.json({
      limitReached,
      plan,
      message,
      email: user?.emailAddresses?.[0]?.emailAddress,
    });
    
  } catch (error) {
    console.error('Failed to check usage:', error);
    return NextResponse.json({ limitReached: false });
  }
}
