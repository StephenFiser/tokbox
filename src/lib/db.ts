import { createClient } from '@libsql/client';

// Turso database client
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Initialize the analyses table if it doesn't exist
export async function initDb() {
  // Check if we need to migrate the table (user_id needs to allow NULL for anonymous users)
  try {
    // Try to insert a test row with NULL user_id to check constraint
    await db.execute(`
      INSERT INTO analyses (user_id, mood, ip_address) VALUES (NULL, '_test_', '_test_')
    `);
    // If it worked, delete the test row
    await db.execute(`DELETE FROM analyses WHERE mood = '_test_'`);
  } catch {
    // Constraint failed - need to recreate table with correct schema
    console.log('Migrating analyses table to allow NULL user_id...');
    
    // Rename old table
    await db.execute(`ALTER TABLE analyses RENAME TO analyses_old`);
    
    // Create new table with correct schema
    await db.execute(`
      CREATE TABLE analyses (
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
    
    // Copy data from old table
    await db.execute(`
      INSERT INTO analyses (id, user_id, user_email, mood, video_duration_seconds, grade, viral_score, created_at, model_used)
      SELECT id, user_id, user_email, mood, video_duration_seconds, grade, viral_score, created_at, model_used
      FROM analyses_old
    `);
    
    // Drop old table
    await db.execute(`DROP TABLE analyses_old`);
    
    console.log('Migration complete.');
  }
  
  // Ensure table exists (for fresh installs)
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
      model_used TEXT DEFAULT 'premium',
      results_json TEXT,
      video_url TEXT
    )
  `);
  
  // Add results_json column if it doesn't exist (migration for existing tables)
  try {
    await db.execute(`ALTER TABLE analyses ADD COLUMN results_json TEXT`);
  } catch {
    // Column already exists
  }
  
  // Add video_url column if it doesn't exist (migration for existing tables)
  try {
    await db.execute(`ALTER TABLE analyses ADD COLUMN video_url TEXT`);
  } catch {
    // Column already exists
  }
  
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
  resultsJson,
  videoUrl,
}: {
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  mood: string;
  videoDurationSeconds?: number;
  grade?: string;
  viralScore?: number;
  modelUsed: 'premium' | 'fast';
  resultsJson?: string;
  videoUrl?: string;
}): Promise<number> {
  const result = await db.execute({
    sql: `
      INSERT INTO analyses (user_id, user_email, ip_address, mood, video_duration_seconds, grade, viral_score, model_used, results_json, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [userId || null, userEmail || null, ipAddress || null, mood, videoDurationSeconds || null, grade || null, viralScore || null, modelUsed, resultsJson || null, videoUrl || null],
  });
  return Number(result.lastInsertRowid);
}

// Get user's analysis history
export async function getUserAnalysisHistory(userId: string, limit: number = 50) {
  const result = await db.execute({
    sql: `
      SELECT id, mood, grade, viral_score, created_at, results_json, video_url
      FROM analyses 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [userId, limit],
  });
  return result.rows;
}

// Get a single analysis by ID (for viewing details)
export async function getAnalysisById(analysisId: number, userId: string) {
  const result = await db.execute({
    sql: `SELECT * FROM analyses WHERE id = ? AND user_id = ?`,
    args: [analysisId, userId],
  });
  return result.rows[0] || null;
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
