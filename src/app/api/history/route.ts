import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserAnalysisHistory, getAnalysisById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');
    
    // If ID is provided, get single analysis
    if (analysisId) {
      const analysis = await getAnalysisById(Number(analysisId), userId);
      if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }
      return NextResponse.json({ analysis });
    }
    
    // Otherwise get full history
    const limit = Number(searchParams.get('limit')) || 50;
    const history = await getUserAnalysisHistory(userId, limit);
    
    return NextResponse.json({ 
      history: history.map(row => ({
        id: row.id,
        mood: row.mood,
        grade: row.grade,
        viralScore: row.viral_score,
        createdAt: row.created_at,
        hasResults: !!row.results_json,
      }))
    });
    
  } catch (error) {
    console.error('Failed to get history:', error);
    return NextResponse.json({ error: 'Failed to get history' }, { status: 500 });
  }
}
