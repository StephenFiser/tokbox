import { createClient } from '@libsql/client';

// Turso database client
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Initialize the analyses table if it doesn't exist
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      user_email TEXT,
      ip_address TEXT,
      mood TEXT NOT NULL,
      video_duration_seconds REAL,
      grade TEXT,
      viral_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      model_used TEXT DEFAULT 'premium'
    )
  `);
  
  // Index for fast user lookups
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id)
  `);
  
  // Index for finding thirst trap leads
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_analyses_mood ON analyses(mood)
  `);
  
  // Index for IP lookups (anonymous users)
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_analyses_ip ON analyses(ip_address)
  `);
}

// Track a new analysis
export async function trackAnalysis({
  userId,
  userEmail,
  ipAddress,
  mood,
  videoDurationSeconds,
  grade,
  viralScore,
  modelUsed,
}: {
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  mood: string;
  videoDurationSeconds?: number;
  grade?: string;
  viralScore?: number;
  modelUsed: 'premium' | 'fast';
}) {
  await db.execute({
    sql: `
      INSERT INTO analyses (user_id, user_email, ip_address, mood, video_duration_seconds, grade, viral_score, model_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [userId || null, userEmail || null, ipAddress || null, mood, videoDurationSeconds || null, grade || null, viralScore || null, modelUsed],
  });
}

// Check if IP has already used free analysis
export async function hasIpUsedFreeAnalysis(ipAddress: string): Promise<boolean> {
  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM analyses WHERE ip_address = ? AND user_id IS NULL`,
    args: [ipAddress],
  });
  return Number(result.rows[0]?.count || 0) > 0;
}

// Get user's analysis count for current month
export async function getMonthlyAnalysisCount(userId: string): Promise<number> {
  const result = await db.execute({
    sql: `
      SELECT COUNT(*) as count FROM analyses 
      WHERE user_id = ? 
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `,
    args: [userId],
  });
  return Number(result.rows[0]?.count || 0);
}

// Get user's analysis count for today
export async function getDailyAnalysisCount(userId: string): Promise<number> {
  const result = await db.execute({
    sql: `
      SELECT COUNT(*) as count FROM analyses 
      WHERE user_id = ? 
      AND date(created_at) = date('now')
    `,
    args: [userId],
  });
  return Number(result.rows[0]?.count || 0);
}

// Get user's total analysis count (for free tier)
export async function getTotalAnalysisCount(userId: string): Promise<number> {
  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM analyses WHERE user_id = ?`,
    args: [userId],
  });
  return Number(result.rows[0]?.count || 0);
}

// Get user's premium analysis count for current month (for model switching)
export async function getMonthlyPremiumCount(userId: string): Promise<number> {
  const result = await db.execute({
    sql: `
      SELECT COUNT(*) as count FROM analyses 
      WHERE user_id = ? 
      AND model_used = 'premium'
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `,
    args: [userId],
  });
  return Number(result.rows[0]?.count || 0);
}

// Get thirst trap leads (for your other tool)
export async function getThirstTrapLeads() {
  const result = await db.execute(`
    SELECT DISTINCT user_id, user_email, COUNT(*) as analysis_count, MAX(created_at) as last_analysis
    FROM analyses 
    WHERE mood = 'thirst_trap'
    AND user_email IS NOT NULL
    GROUP BY user_id, user_email
    ORDER BY last_analysis DESC
  `);
  return result.rows;
}

// Usage limits configuration
export const USAGE_LIMITS = {
  free: {
    totalAnalyses: 1,
    premiumAnalyses: 1, // All free analyses are premium
  },
  creator: {
    monthlyAnalyses: 30,
    premiumAnalyses: 20, // Switch to fast after 20
  },
  pro: {
    dailyAnalyses: 5,
    monthlyAnalyses: 150, // 5/day * 30 days
    premiumAnalyses: 50, // Switch to fast after 50
  },
};

// Plan IDs from Clerk
export const PLAN_IDS = {
  creator: 'cplan_36hucHMFdLh2PMcVTuVJ3nzE90D',
  pro: 'cplan_36huqQZ9Y6fuZZkmdm0xMOHbwh9',
};
