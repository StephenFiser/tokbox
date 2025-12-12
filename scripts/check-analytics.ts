// Quick script to check TokBox analytics
// Run with: npx tsx scripts/check-analytics.ts

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Parse .env.local manually
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const db = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('\n📊 TokBox Analytics\n');
  console.log('='.repeat(50));

  // Total analyses
  const total = await db.execute('SELECT COUNT(*) as count FROM analyses');
  console.log(`\n📈 Total analyses: ${total.rows[0].count}`);

  // Unique users (excluding anonymous)
  const uniqueUsers = await db.execute('SELECT COUNT(DISTINCT user_id) as count FROM analyses WHERE user_id IS NOT NULL');
  console.log(`👤 Unique registered users who analyzed: ${uniqueUsers.rows[0].count}`);

  // Anonymous analyses (by IP)
  const anonymous = await db.execute('SELECT COUNT(*) as count FROM analyses WHERE user_id IS NULL');
  console.log(`🔓 Anonymous analyses: ${anonymous.rows[0].count}`);

  // Unique IPs for anonymous
  const uniqueIps = await db.execute('SELECT COUNT(DISTINCT ip_address) as count FROM analyses WHERE user_id IS NULL AND ip_address IS NOT NULL');
  console.log(`🌐 Unique anonymous IPs: ${uniqueIps.rows[0].count}`);

  // Analyses by mood
  console.log('\n📋 By Mood:');
  const byMood = await db.execute('SELECT mood, COUNT(*) as count FROM analyses GROUP BY mood ORDER BY count DESC');
  byMood.rows.forEach(row => {
    console.log(`   ${row.mood}: ${row.count}`);
  });

  // Analyses by grade
  console.log('\n🎓 By Grade:');
  const byGrade = await db.execute('SELECT grade, COUNT(*) as count FROM analyses WHERE grade IS NOT NULL GROUP BY grade ORDER BY count DESC');
  byGrade.rows.forEach(row => {
    console.log(`   ${row.grade}: ${row.count}`);
  });

  // Recent analyses (last 10)
  console.log('\n🕐 Last 10 Analyses:');
  const recent = await db.execute(`
    SELECT 
      id,
      COALESCE(user_email, 'anonymous') as user,
      mood,
      grade,
      viral_score,
      created_at
    FROM analyses 
    ORDER BY created_at DESC 
    LIMIT 10
  `);
  recent.rows.forEach(row => {
    const date = new Date(row.created_at as string).toLocaleString();
    console.log(`   [${row.grade || '?'}] ${row.mood} - ${row.user} (${date})`);
  });

  // Registered users with emails
  console.log('\n📧 Registered Users:');
  const users = await db.execute(`
    SELECT 
      user_email,
      COUNT(*) as analysis_count,
      MAX(created_at) as last_analysis
    FROM analyses 
    WHERE user_email IS NOT NULL
    GROUP BY user_email
    ORDER BY last_analysis DESC
  `);
  if (users.rows.length === 0) {
    console.log('   No registered users yet');
  } else {
    users.rows.forEach(row => {
      console.log(`   ${row.user_email}: ${row.analysis_count} analyses`);
    });
  }

  // Thirst trap leads (your other tool interest)
  const thirstTrap = await db.execute(`
    SELECT COUNT(*) as count FROM analyses WHERE mood = 'thirst_trap'
  `);
  if (Number(thirstTrap.rows[0].count) > 0) {
    console.log(`\n🔥 Thirst Trap leads: ${thirstTrap.rows[0].count}`);
  }

  console.log('\n' + '='.repeat(50));
}

main().catch(console.error);
