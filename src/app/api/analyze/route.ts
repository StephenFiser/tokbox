import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  getHookGenerationPrompt,
  parseHookResponse,
} from '@/lib/hooks';
import {
  db,
  initDb,
  trackAnalysis,
  getTotalAnalysisCount,
  getMonthlyAnalysisCount,
  getDailyAnalysisCount,
  getMonthlyPremiumCount,
  hasIpUsedFreeAnalysis,
  USAGE_LIMITS,
  PLAN_IDS,
} from '@/lib/db';

// Route segment config for App Router
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

// Model types for switching between premium and fast
type ModelTier = 'premium' | 'fast';

// Get the appropriate Claude model based on tier
function getClaudeModel(tier: ModelTier): string {
  return tier === 'premium' ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-20241022';
}

// Initialize clients
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'candyshop-1';
const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000';

function generateId(): string {
  return `tokbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface VideoAnalysisResult {
  embedding: number[];
  frames: string[];
  duration: number;
  numFrames: number;
}

async function uploadVideoToS3(videoBuffer: Buffer, filename: string): Promise<string> {
  const s3Key = `tokbox/videos/${Date.now()}_${filename}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: videoBuffer,
    ContentType: filename.endsWith('.mov') ? 'video/quicktime' : 'video/mp4',
  }));
  
  // Return the S3 URL
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${s3Key}`;
}

async function analyzeVideoWithService(videoBuffer: Buffer, filename: string = 'video.mp4'): Promise<VideoAnalysisResult | null> {
  try {
    // Upload to S3 first for reliable transfer
    console.log(`Uploading video to S3: ${filename} (${videoBuffer.length} bytes, ${(videoBuffer.length / (1024*1024)).toFixed(2)} MB)`);
    const videoUrl = await uploadVideoToS3(videoBuffer, filename);
    console.log(`Video uploaded to S3: ${videoUrl}`);
    
    // Send URL to embedding service instead of file
    const formData = new FormData();
    formData.append('video_url', videoUrl);
    formData.append('num_frames', '10');
    
    console.log('Calling embedding service with S3 URL...');
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/analyze-video`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Embedding service error:', errorText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to call embedding service:', error);
    return null;
  }
}

async function uploadBase64ToS3(base64Data: string, s3Key: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');
  
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: 'image/jpeg',
  }));
  
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${s3Key}`;
}

function calculateGrade(scores: { hook: number; visual: number; pacing: number }): { 
  grade: string; 
  color: string;
  potential: number;
} {
  const avg = (scores.hook * 0.4 + scores.visual * 0.35 + scores.pacing * 0.25);
  const potential = Math.round(avg * 10) / 10;
  
  // American grading scale (percentage based)
  // A: 90-100%, B: 80-89%, C: 70-79%, D: 60-69%, F: below 60%
  const percentage = avg * 10;
  
  let grade: string;
  let color: string;
  
  if (percentage >= 97) { grade = 'A+'; color = 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'; }
  else if (percentage >= 93) { grade = 'A'; color = 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'; }
  else if (percentage >= 90) { grade = 'A-'; color = 'bg-gradient-to-br from-green-500 to-teal-500 text-white'; }
  else if (percentage >= 87) { grade = 'B+'; color = 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white'; }
  else if (percentage >= 83) { grade = 'B'; color = 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'; }
  else if (percentage >= 80) { grade = 'B-'; color = 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white'; }
  else if (percentage >= 77) { grade = 'C+'; color = 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'; }
  else if (percentage >= 73) { grade = 'C'; color = 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'; }
  else if (percentage >= 70) { grade = 'C-'; color = 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'; }
  else if (percentage >= 67) { grade = 'D+'; color = 'bg-gradient-to-br from-orange-500 to-red-400 text-white'; }
  else if (percentage >= 63) { grade = 'D'; color = 'bg-gradient-to-br from-orange-500 to-red-500 text-white'; }
  else if (percentage >= 60) { grade = 'D-'; color = 'bg-gradient-to-br from-red-400 to-red-500 text-white'; }
  else { grade = 'F'; color = 'bg-gradient-to-br from-red-500 to-red-600 text-white'; }
  
  return { grade, color, potential };
}

async function analyzeVideoComprehensive(frameUrls: string[], moodKey: string | null, modelTier: ModelTier = 'premium') {
  // Use Claude for the comprehensive analysis (model depends on tier)
  const imageContents = await Promise.all(
    frameUrls.slice(0, 5).map(async (url) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/jpeg' as const,
          data: base64,
        }
      };
    })
  );
  
  // Get mood-specific strategy if available
  const strategy = moodKey ? MOOD_STRATEGIES[moodKey] : null;
  
  // Build mood-specific prompt sections
  let moodSection = '';
  let scoringSection = '';
  let advancedSection = '';
  
  if (strategy) {
    moodSection = `
🎯 CRITICAL CONTEXT: The creator says this is ${strategy.name.toUpperCase()} content.

${strategy.persona}

PSYCHOLOGY OF ${strategy.name.toUpperCase()}:
${strategy.psychology}

WHAT ACTUALLY MATTERS FOR ${strategy.name.toUpperCase()}:
${strategy.whatMatters.map((w, i) => `${i + 1}. ${w}`).join('\n')}

COMMON MISTAKES IN ${strategy.name.toUpperCase()} (watch for these):
${strategy.commonMistakes.map(m => `• ${m}`).join('\n')}

PATTERNS THAT WORK FOR ${strategy.name.toUpperCase()}:
${strategy.famousPatterns.map(p => `• ${p}`).join('\n')}
`;

    scoringSection = `
SCORING CONTEXT: ${strategy.scoringFocus}

For ${strategy.name} content specifically:`;

    advancedSection = `
ADVANCED ${strategy.name.toUpperCase()} INSIGHTS TO CONSIDER:
${strategy.advancedTips.map(t => `• ${t}`).join('\n')}

Your feedback should sound like it's coming from someone who DEEPLY UNDERSTANDS ${strategy.name} content, not generic social media advice.`;
  }
  
  const response = await anthropic.messages.create({
    model: getClaudeModel(modelTier),
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `You're a TOP-TIER creative director who's obsessed with TikTok. You've studied why certain videos break the internet and others flop. Your feedback should be SPECIFIC, INSIGHTFUL, and occasionally CONTRARIAN - not generic social media tips.

${moodSection}

FIRST, identify:
1. Is there TEXT OVERLAY visible? If so, what does it say exactly?
2. Is this following a TREND FORMAT? Which one?
3. What's the ACTUAL INTENT of this video?

DESCRIBE WHAT YOU SEE:
- Literally describe: person, setting, outfit, action, expression
- What changes across frames?
- What's the ENERGY/VIBE being conveyed?
- What would make someone stop scrolling HERE?

${scoringSection}

NOW GIVE SCORES - Be a tough but fair judge:
- 5 = average, 7 = good, 8 = impressive, 9+ = exceptional
- DON'T grade inflate. Most videos are 5-7.

1. HOOK POWER (first 0.5-2 seconds):
   - Would YOU stop scrolling? Why or why not?
   - What's the scroll-stopping element (or lack of)?
   
2. VISUAL QUALITY:
   - Lighting (side light > front light for depth)
   - Composition and framing
   - Does it look intentional?
   
3. EXECUTION:
   - How well does this nail what it's TRYING to do?
   - Is the intent clear?
   - Does everything support the goal?

${advancedSection}

CRITICAL: Identify THE ONE THING that would make the biggest difference. Not 5 things - ONE thing.

Return JSON:
{
  "existing_text_overlay": "exact text if visible, or null",
  "is_trend_format": true/false,
  "trend_type": "specific trend name if applicable, or null",
  "intent": "what this video is trying to accomplish",
  
  "content_description": "1-2 sentences describing what this video IS",
  "summary": "1 sentence that shows you GET what they're going for and gives a verdict",
  
  "scores": {
    "hook": { "score": 1-10, "feedback": "specific, insightful feedback" },
    "visual": { "score": 1-10, "feedback": "specific observation about lighting/composition" },
    "execution": { "score": 1-10, "feedback": "how well they executed their intent" }
  },
  
  "strengths": ["2-3 specific things that WORK - not generic praise"],
  "improvements": ["2-3 specific, actionable improvements that show you understand the format"],
  
  "the_one_thing": "The SINGLE most impactful change they could make. Be specific.",
  "advanced_insight": "One contrarian or non-obvious observation that shows deep understanding"
}`
          }
        ]
      }
    ]
  });
  
  try {
    const textContent = response.content.find(c => c.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error('Failed to parse comprehensive analysis:', e);
    return null;
  }
}

async function generateHooksForContent(
  frameUrls: string[], 
  contentDescription: string,
  existingText: string | null,
  intent: string | null,
  isTrend: boolean,
  moodKey: string | null,
  modelTier: ModelTier = 'premium'
) {
  const imageContents = await Promise.all(
    frameUrls.slice(0, 3).map(async (url) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/jpeg' as const,
          data: base64,
        }
      };
    })
  );
  
  // Get mood-specific strategy
  const strategy = moodKey ? MOOD_STRATEGIES[moodKey] : null;
  
  // Build context-aware prompt
  let contextInfo = `Video shows: ${contentDescription}\n`;
  if (strategy) contextInfo += `Creator's content type: ${strategy.name}\n`;
  if (intent) contextInfo += `Detected intent: ${intent}\n`;
  if (isTrend) contextInfo += `This appears to follow a trend format.\n`;
  
  let existingTextSection = '';
  if (existingText) {
    existingTextSection = `
⚠️ THIS VIDEO ALREADY HAS TEXT: "${existingText}"

Since they already have text, your job is to suggest ALTERNATIVES or IMPROVEMENTS.
The current text might be fine - if so, say why it works and offer slight variations.
Don't ignore the existing text and suggest something completely different.
`;
  }

  // Build mood-specific hook guidance
  let moodHookGuidance = '';
  if (strategy) {
    moodHookGuidance = `
🎯 THIS IS ${strategy.name.toUpperCase()} CONTENT

HOOK STYLE FOR ${strategy.name.toUpperCase()}:
${strategy.hookStyle}

CAPTION STYLE FOR ${strategy.name.toUpperCase()}:
${strategy.captionStyle}

What works for ${strategy.name}:
${strategy.famousPatterns.slice(0, 3).map(p => `• ${p}`).join('\n')}

Your hooks MUST match ${strategy.name} energy. ${
      strategy.name === 'Thirst Trap' ? 'Minimal text, confidence, or nothing at all.' :
      strategy.name === 'Comedy' ? 'The hook IS the setup - create the expectation you\'ll subvert.' :
      strategy.name === 'Relatable' ? 'Specific scenarios that make people think "literally me".' :
      strategy.name === 'Storytime' ? 'Start mid-drama, create unbearable curiosity.' :
      strategy.name === 'Confident' ? 'Short, powerful, unbothered. Less is more.' :
      strategy.name === 'Mysterious' ? 'Cryptic or absent. Let mystery speak.' :
      strategy.name === 'Chaotic' ? 'Immediate confusion or high energy. No setup.' :
      'Match the specific energy and expectations of this content type.'
    }
`;
  }
  
  const response = await anthropic.messages.create({
    model: getClaudeModel(modelTier),
    max_tokens: 1500,
    temperature: 0.9, // Higher temperature for more creative variety
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `${contextInfo}
${existingTextSection}
${moodHookGuidance}

🚨 CRITICAL: GENERATE UNIQUE HOOKS FOR THIS EXACT VIDEO

Look at the images. What do you SPECIFICALLY see?
- What is the person wearing?
- What is their expression?
- What is the setting/background?
- What action is happening?
- What colors dominate?
- What makes THIS video different from others?

Your hooks MUST reference something SPECIFIC to THIS video. Not templates. Not generic hooks that could apply to any video.

⛔ BANNED HOOKS - NEVER USE THESE (or variations):
- "The part they cut out"
- "Not what you think"
- "Wait for it"
- "They don't know"
- "If only they knew"
- "This version hits different"
- "The difference between X and Y"
- "Why [generic item] reveals everything"
- Any hook that could apply to ANY video of this type
- Any hook you've suggested before

✅ GOOD HOOKS reference:
- The specific outfit/look ("That dress was a mistake")
- The specific expression ("The smile before the breakdown")
- The specific setting ("Why I never come here anymore")
- A specific detail only visible in THIS video
- Something that makes the viewer look closer at the image

For ${strategy?.name || 'this content'}:
${strategy?.name === 'Thirst Trap' || strategy?.name === 'Confident' ? 
  'Even minimal hooks should feel CUSTOM. Not "." but maybe "that top" or "the audacity" - something that references THIS look.' :
  strategy?.name === 'Relatable' ? 
  'The hook should be SO SPECIFIC it feels personal. Reference the exact scenario visible.' :
  strategy?.name === 'Storytime' ?
  'Start mid-action with a detail that only makes sense after watching.' :
  'Every hook should pass the test: "Could this ONLY apply to this video?"'}

STYLE 1 - CURIOSITY GAP: Creates anticipation, but must reference THIS video
STYLE 2 - PATTERN INTERRUPT: Bold/unexpected, but grounded in what we SEE
STYLE 3 - ASPIRATIONAL: The vibe, but specific to THIS moment/look/scene

Return JSON:
{
  "existing_text_assessment": "If there's existing text, is it good? What works/doesn't?",
  "what_i_see": "1-2 specific details in this video that hooks could reference",
  "recommended_type": "curiosity_gap" | "pattern_interrupt" | "aspirational",
  "why_this_type": "Why this type fits THIS specific video",
  "hook_set": {
    "curiosity_gap": [
      { "text": "unique hook referencing something specific" },
      { "text": "different angle on a specific detail" }
    ],
    "pattern_interrupt": [
      { "text": "bold hook grounded in what we see" },
      { "text": "alternative unexpected angle" }
    ],
    "aspirational": [
      { "text": "vibe hook specific to THIS moment" },
      { "text": "alternative aspiration angle" }
    ]
  }
}`
          }
        ]
      }
    ]
  });
  
  try {
    const textContent = response.content.find(c => c.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    return {
      hookSet: parseHookResponse(parsed),
      recommendedType: parsed.recommended_type || 'curiosity_gap',
      existingTextAssessment: parsed.existing_text_assessment || null,
      whyThisType: parsed.why_this_type || null,
    };
  } catch (e) {
    console.error('Failed to parse hooks:', e);
    // Don't return generic fallbacks - return content-aware ones
    return {
      hookSet: {
        curiosityGap: [{ text: `(Look at the video - what detail creates curiosity?)` }],
        patternInterrupt: [{ text: `(What unexpected element in this video could stop the scroll?)` }],
        aspirational: [{ text: `(What feeling does this video evoke?)` }],
      },
      recommendedType: 'curiosity_gap' as const,
      existingTextAssessment: null,
      whyThisType: null,
    };
  }
}

async function generateCaptions(contentDescription: string, intent: string | null, existingText: string | null, moodKey: string | null) {
  const strategy = moodKey ? MOOD_STRATEGIES[moodKey] : null;
  
  const context = `Video specifically shows: ${contentDescription}
${strategy ? `Content type: ${strategy.name}` : ''}
${intent ? `Detected intent: ${intent}` : ''}
${existingText ? `Has text overlay: "${existingText}"` : ''}`;

  let captionGuidance = '';
  if (strategy) {
    captionGuidance = `
THIS IS ${strategy.name.toUpperCase()} CONTENT.

Caption style for ${strategy.name}:
${strategy.captionStyle}

What matters for ${strategy.name}:
${strategy.whatMatters.slice(0, 2).map(w => `• ${w}`).join('\n')}

Your captions MUST match ${strategy.name} energy EXACTLY.`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.9, // Higher temp for variety
    messages: [
      {
        role: 'system',
        content: `Generate 3 UNIQUE TikTok captions for THIS SPECIFIC video.
${captionGuidance}

⛔ BANNED CAPTIONS - NEVER USE:
- "When reality hits"
- "Sometimes you just can't"
- "Lost in the [x]"
- "Living my best [x]"
- "That feeling when"
- "Main character energy"
- "It's giving [x]"
- "The way I [x]"
- "No thoughts just [x]"
- Any caption that could work for ANY video

✅ CAPTIONS SHOULD:
- Feel specific to THIS video's content
- Sound like something a real person would type
- Match the ${strategy?.name || 'content'} energy
- Be varied from each other (not 3 versions of the same idea)

CONTENT-TYPE SPECIFIC:
${strategy?.name === 'Thirst Trap' ? '→ MINIMAL. "." or single word that references the look. Not generic confidence phrases.' :
  strategy?.name === 'Confident' ? '→ SHORT. Could reference something specific in the video, or be unbothered silence.' :
  strategy?.name === 'Relatable' ? '→ Specific to the scenario shown. Not generic "relatable" phrases.' :
  strategy?.name === 'Comedy' ? '→ Could quote something from video or be deadpan. Never explain.' :
  strategy?.name === 'Storytime' ? '→ Tease the story or ask for engagement. Reference the content.' :
  strategy?.name === 'Chaotic' ? '→ Unhinged. Could be completely unrelated or keysmash.' :
  strategy?.name === 'Vulnerable' ? '→ Honest, simple. Reference what\'s being shared.' :
  strategy?.name === 'Mysterious' ? '→ Cryptic. "." or something that adds to mystery.' :
  '→ Match the vibe but make it SPECIFIC to this video.'}

Return JSON: { "captions": ["caption1", "caption2", "caption3"] }`
      },
      {
        role: 'user',
        content: context
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 200,
  });
  
  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    return parsed.captions || ['.', 'anyway', 'no caption needed'];
  } catch {
    return ['.', 'anyway', 'no caption needed'];
  }
}

// Deep mood-specific strategies with expert knowledge
interface MoodStrategy {
  name: string;
  persona: string;
  psychology: string;
  whatMatters: string[];
  commonMistakes: string[];
  famousPatterns: string[];
  scoringFocus: string;
  hookStyle: string;
  captionStyle: string;
  advancedTips: string[];
}

const MOOD_STRATEGIES: Record<string, MoodStrategy> = {
  thirst: {
    name: 'Thirst Trap',
    persona: `You're analyzing this as someone who understands why certain people become internet obsessions. You know that the most viral thirst traps aren't about showing the most - they're about CONFIDENCE and TENSION.`,
    psychology: `Thirst traps work through controlled tension. The viewer feels like they're seeing something slightly forbidden, slightly intimate. The creator appears to have a secret, to be "in on it." The most viral ones often have LESS movement, not more - stillness creates tension.`,
    whatMatters: [
      'Confidence projection - do they look like they KNOW they look good, or are they seeking validation?',
      'Eye contact and expression - "I know something you don\'t" energy',
      'Tension without resolution - leaving something to imagination',
      'Controlled energy - stillness is often more powerful than movement',
      'The "unbothered" factor - not trying too hard'
    ],
    commonMistakes: [
      'Trying too hard / over-posing (desperation reads on camera)',
      'Too much movement kills the tension',
      'Breaking eye contact nervously',
      'Over-produced settings (authenticity > production)',
      'Seeking validation instead of projecting confidence',
      'Too much going on - simplicity wins'
    ],
    famousPatterns: [
      'The confident stare - just looking at camera with "I know" energy',
      'The slow reveal - building anticipation',
      'The interrupted moment - caught mid-action',
      'The mirror/reflection shot - adds depth and voyeuristic element',
      'The "getting ready" reveal - transformation element'
    ],
    scoringFocus: 'Weight confidence/presence 50%, visual aesthetic 30%, hook only 20%. A thirst trap can have zero text and still go viral.',
    hookStyle: 'Hooks should be MINIMAL or ABSENT. "." is a valid caption. Let the visual do the work. If text is used, it should be confident/unbothered, never explanatory.',
    captionStyle: 'Minimal. Single word, period, or nothing. ".", "anyway", "no", or completely empty. Never explain what viewers can see.',
    advancedTips: [
      'The most viral thirst traps often have an element of "I wasn\'t even trying" - candid > posed',
      'Silence or slow bass-heavy audio outperforms trending sounds here',
      'The "rewatch" factor: Is there something subtle viewers will catch on second watch?',
      'Lighting from the side creates depth and mood - front lighting is amateur',
      'One color palette > rainbow of distractions'
    ]
  },

  relatable: {
    name: 'Relatable',
    persona: `You understand that relatable content works because it makes people feel SEEN. The best relatable content is specific enough to be real, but universal enough that millions think "that's literally me."`,
    psychology: `Relatable content triggers the recognition response - "I thought I was the only one." It works through SPECIFICITY. Vague relatability ("when life is hard") fails. Specific relatability ("when you rehearse the argument in the shower and absolutely destroy them") wins.`,
    whatMatters: [
      'Specificity - is this a SPECIFIC relatable moment or generic?',
      'The "I thought I was the only one" factor',
      'Authenticity - does it feel real or performed?',
      'The shared experience being depicted',
      'Self-deprecating without being sad'
    ],
    commonMistakes: [
      'Too vague/generic ("when life gets hard")',
      'Trying to be relatable instead of just BEING relatable',
      'Over-acting the emotion',
      'Being depressing instead of funny-sad',
      'Not committing to the bit'
    ],
    famousPatterns: [
      'The internal monologue visualization',
      'The "why do I do this" confession',
      'The specific-universal (hyper-specific scenario everyone relates to)',
      'The "caught in the act" of embarrassing behavior',
      'The comparison (expectation vs reality)'
    ],
    scoringFocus: 'Authenticity 40%, Specificity 30%, Comedy timing 30%. The more specific and real it feels, the more it resonates.',
    hookStyle: 'Hook should be the SPECIFIC scenario. "When you\'re 3 hours into a Wikipedia rabbit hole at 4am and you started with \'how tall is Tom Cruise\'" > "When you can\'t sleep"',
    captionStyle: 'Can be longer, conversational. "no because why is this actually me" or "I feel personally attacked" energy. Self-aware.',
    advancedTips: [
      'The best relatable content makes people tag friends - is this tag-worthy?',
      'Comments should be "literally me" not "lol" - that\'s the metric',
      'Facial expressions carry 80% of relatable content - commit to them',
      'The pause before the relatable moment builds anticipation',
      'Sound choice matters - trending sounds can work but original audio often hits harder'
    ]
  },

  confident: {
    name: 'Confident',
    persona: `You know that confident content is about ENERGY, not words. The most confident creators say less, not more. You understand the difference between confidence and arrogance, between unbothered and trying-to-look-unbothered.`,
    psychology: `Confident content works because people are drawn to those who seem to have figured something out. It's aspirational but accessible. The key is EFFORTLESSNESS - the moment it looks like effort, the spell breaks.`,
    whatMatters: [
      'Effortlessness - does success/confidence look natural?',
      'The "unbothered" energy - not reactive, not defensive',
      'Owning the frame - comfortable in space',
      'Less is more - confident people don\'t over-explain',
      'The slight smile/smirk that says "I know"'
    ],
    commonMistakes: [
      'Over-explaining or justifying',
      'Trying to LOOK confident vs BEING confident',
      'Too many words - confidence is quiet',
      'Defensive energy disguised as confidence',
      'Flexing too hard (insecurity reads)'
    ],
    famousPatterns: [
      'The silent flex - showing without telling',
      'The unbothered response to chaos',
      'The "this is just my life" casual moment',
      'The knowing look to camera',
      'The walk-away/door close'
    ],
    scoringFocus: 'Energy/presence 50%, Authenticity 30%, Visual 20%. Words matter least here.',
    hookStyle: 'Minimal text. If any, it should be SHORT and POWERFUL. "no." or "anyway" or "and what about it" energy.',
    captionStyle: 'One word or short phrase. Never defensive. Never explanatory. "." or "lol" or nothing.',
    advancedTips: [
      'Confident content often performs better with SILENCE or non-trending audio',
      'The best confident moments are "caught" not "staged"',
      'Eye contact with camera should be brief and knowing, not intense/staring',
      'Movement should be slow and deliberate, never rushed',
      'Confident content invites haters - that\'s actually good for engagement'
    ]
  },

  mysterious: {
    name: 'Mysterious',
    persona: `You understand that mystery creates obsession. The most viral mysterious content leaves people needing to know MORE. You never fully explain - you hint, suggest, and leave gaps for imagination.`,
    psychology: `Mystery triggers the completion instinct - humans NEED to close open loops. The best mysterious content opens a loop it never closes, or closes it in a way that opens another. It's addictive because it's unresolved.`,
    whatMatters: [
      'Open loops - what question does this raise?',
      'What\'s left unsaid/unseen?',
      'The "wait, what?" factor',
      'Rewatchability - do people rewatch to understand?',
      'Atmosphere and mood'
    ],
    commonMistakes: [
      'Being confusing instead of mysterious',
      'Explaining the mystery (kills it)',
      'No payoff at all (frustrating, not intriguing)',
      'Trying too hard to be "deep"',
      'Random ≠ mysterious'
    ],
    famousPatterns: [
      'The unexplained visual that people analyze',
      'The story that doesn\'t quite add up',
      'The "context: none" approach',
      'The vibe with no explanation',
      'The ending that raises questions'
    ],
    scoringFocus: 'Intrigue factor 50%, Atmosphere 30%, Rewatchability 20%.',
    hookStyle: 'Either no text (let mystery speak) or cryptic text that adds to mystery, never explains.',
    captionStyle: 'Cryptic or absent. "." or "context: none" or "idk either" or nothing.',
    advancedTips: [
      'Mysterious content NEEDS comments asking questions - that\'s the goal',
      'Slight visual "mistakes" or "glitches" can add to mystery',
      'Audio choice is crucial - eerie, atmospheric, or complete silence',
      'The best mysterious content has something people THINK they figured out',
      'Leave easter eggs for obsessive rewatchers'
    ]
  },

  transformation: {
    name: 'Transformation',
    persona: `You're an expert in the psychology of transformation content - the glow-up, the reveal, the before/after. You know that the TIMING of the reveal is everything, and that the "before" matters as much as the "after."`,
    psychology: `Transformation content triggers hope and aspiration. People watch to see that change is possible. The "before" creates investment, the reveal creates dopamine. The longer you hold the before (without boring), the bigger the payoff.`,
    whatMatters: [
      'The "before" - is it relatable/sympathetic?',
      'The reveal timing - too fast kills impact, too slow loses attention',
      'The contrast - is the transformation dramatic enough?',
      'The authenticity - does it feel real or fake?',
      'The music timing - does the drop match the reveal?'
    ],
    commonMistakes: [
      'Rushing to the reveal (hold the before!)',
      'The "before" isn\'t different enough from "after"',
      'Bad music timing (reveal should hit on the beat)',
      'Over-produced afters that feel fake',
      'No emotional journey, just two images'
    ],
    famousPatterns: [
      'The extended "before" with music build',
      'The multiple-stage transformation',
      'The unexpected transformation (not what you expected)',
      'The process montage',
      'The reaction reveal (showing others\' reactions)'
    ],
    scoringFocus: 'Reveal impact 40%, Before setup 30%, Timing/music sync 30%.',
    hookStyle: 'Hook should HINT at transformation without spoiling. "watch this" or "I can\'t believe this worked" or just start in the "before."',
    captionStyle: 'Can be longer, story-driven. "3 months later..." or "I finally did it" or challenge the viewer.',
    advancedTips: [
      'The best transformations have an emotional element, not just visual',
      'Audio is 50% of transformation content - the drop MUST hit right',
      'Consider the "hold" - freeze on before for 1 extra beat',
      'Multiple reveals in one video increase watch time',
      'The "process" is often more interesting than the result'
    ]
  },

  lifestyle: {
    name: 'Lifestyle',
    persona: `You understand aspirational lifestyle content - the "I want that life" feeling. You know it's not about showing off, it's about creating a VIBE that people want to step into. The best lifestyle content feels like a window into a world.`,
    psychology: `Lifestyle content works through aspiration and escapism. People watch to imagine themselves there. It succeeds when viewers feel like they're getting a glimpse into a life they want, not being shown what they don't have.`,
    whatMatters: [
      'The vibe/aesthetic consistency',
      'Does it feel like a "world" to step into?',
      'Aspirational but not untouchable',
      'The small details that make it feel real',
      'Color palette and visual cohesion'
    ],
    commonMistakes: [
      'Showing off instead of sharing',
      'Too perfect (feels fake/unrelatable)',
      'Inconsistent aesthetic',
      'No personality, just pretty images',
      'Trying too hard to be "aesthetic"'
    ],
    famousPatterns: [
      'The morning routine in beautiful space',
      'The "day in my life" montage',
      'The aesthetic errand run',
      'The cozy moment capture',
      'The travel glimpse'
    ],
    scoringFocus: 'Aesthetic cohesion 40%, Vibe/atmosphere 35%, Aspirational factor 25%.',
    hookStyle: 'Visual hook is primary. Text optional - if used, should add to vibe not explain it.',
    captionStyle: 'Aesthetic and minimal. "this" or "here" or "home" or song lyrics. Never long explanations.',
    advancedTips: [
      'Color grading consistency is everything - develop a signature look',
      'Slow motion on specific moments elevates perceived quality',
      'Audio sets 50% of the vibe - choose carefully',
      'The "in-between" moments often perform better than the "highlight"',
      'Natural light > artificial in almost all cases'
    ]
  },

  workout: {
    name: 'Workout',
    persona: `You understand fitness content beyond just "showing exercises." You know that gym TikTok is about ENERGY, motivation, and making people feel like they can do it too. It's not about being the strongest - it's about being inspiring.`,
    psychology: `Workout content works through motivation and aspiration. The best fitness creators make viewers feel capable, not inadequate. It's about the ENERGY and grind, not just the results.`,
    whatMatters: [
      'Energy and intensity - is it motivating?',
      'Form (fitness people WILL comment on bad form)',
      'The grind/effort visible',
      'Authenticity of the workout',
      'Music/energy sync'
    ],
    commonMistakes: [
      'Bad form (instant credibility killer)',
      'Too much posing, not enough working out',
      'Not actually doing hard exercises',
      'Poor music choice',
      'Coming across as intimidating vs motivating'
    ],
    famousPatterns: [
      'The PR/personal record moment',
      'The workout montage with beat sync',
      'The "what I\'d do differently" advice',
      'The form correction/tip',
      'The progress update'
    ],
    scoringFocus: 'Energy/motivation 40%, Authenticity 30%, Form/technique 30%.',
    hookStyle: 'Can be instructional ("try this for bigger arms") or energy-based (just start mid-lift with intensity).',
    captionStyle: 'Action-oriented. "let\'s get it" or the specific exercise or motivational. Can include tips.',
    advancedTips: [
      'The effort/struggle is the content - don\'t make it look too easy',
      'Beat-synced lifts are satisfying to watch',
      'POV angles from interesting perspectives stand out',
      'Authenticity beats perfect lighting - gym lighting is fine',
      'Rest between sets is dead time - cut it'
    ]
  },

  funny: {
    name: 'Comedy',
    persona: `You're analyzing this as someone who understands comedy TIMING - the most important element of funny TikTok. You know that a joke that lands is all about the setup length, the pause, the cut, the delivery. You can tell if something is funny on first watch vs needs explanation (bad sign).`,
    psychology: `Comedy on TikTok works through surprise and recognition. The best comedy either subverts expectations (you thought one thing, got another) or validates a shared experience (I thought I was the only one who did this). The TIMING determines if it lands.`,
    whatMatters: [
      'Timing - setup length vs payoff',
      'Does it land on FIRST watch?',
      'The element of surprise/subversion',
      'Commitment to the bit',
      'The cut/edit timing'
    ],
    commonMistakes: [
      'Setup too long (lost them before the punchline)',
      'Explaining the joke',
      'Laughing at your own joke before the audience',
      'The joke only makes sense on rewatch',
      'Not committing fully to the bit'
    ],
    famousPatterns: [
      'The cut before the punchline (let imagination do the work)',
      'The escalation (each beat funnier than last)',
      'The anti-joke (subverting comedy expectations)',
      'The deadpan delivery',
      'The chaotic energy burst'
    ],
    scoringFocus: 'Timing 50%, Originality 25%, Commitment 25%.',
    hookStyle: 'The hook IS the setup. It should create the expectation you\'ll subvert. Don\'t explain - show.',
    captionStyle: 'Can add to joke or be minimal. "no context" or quotes from video or just "lol". Never explain.',
    advancedTips: [
      'The pause before the punchline is as important as the punchline',
      'Cut BEFORE the full reaction - let viewers imagine the rest',
      'Audio timing is crucial - the beat drop or sound effect on the punchline',
      'Rewatch value: Is there something subtle people catch second time?',
      'The best comedy feels effortless even when meticulously timed'
    ]
  },

  storytime: {
    name: 'Storytime',
    persona: `You understand narrative hooks and story structure for short-form. You know that the best storytimes don't start at the beginning - they start at the most INTERESTING point and make you desperate to know how they got there.`,
    psychology: `Storytime content works through narrative tension. The viewer needs to know what happens next. The hook should raise a question that CAN'T be ignored. Starting mid-drama > starting at the beginning.`,
    whatMatters: [
      'The hook - does it create UNBEARABLE curiosity?',
      'Narrative momentum - does each beat pull you forward?',
      'Stakes - why should we care?',
      'The voice/delivery - engaging speaker?',
      'The payoff - worth the buildup?'
    ],
    commonMistakes: [
      'Starting at the beginning instead of the interesting part',
      '"So basically..." (boring opener)',
      'Too much backstory before the drama',
      'Burying the interesting part',
      'No real payoff/anticlimactic ending'
    ],
    famousPatterns: [
      'Starting mid-crisis ("I\'m hiding in my car right now")',
      'The "you won\'t believe this" but actually delivering',
      'The mystery that unfolds',
      'The escalating disaster',
      'The "wait it gets worse" structure'
    ],
    scoringFocus: 'Hook strength 40%, Narrative momentum 35%, Payoff 25%.',
    hookStyle: 'START IN THE MIDDLE. "I just got fired" > "So let me tell you about my job." The hook should make scrolling away IMPOSSIBLE.',
    captionStyle: 'Can tease: "the ending..." or "storytime:" or just let the video hook work.',
    advancedTips: [
      'The first 3 seconds determine everything - start LATE in the story',
      'Leave out unnecessary characters/details - get to the drama',
      'End with a question or cliffhanger for multi-part potential',
      'Your face should show the emotion of what you\'re describing',
      'Pacing: Fast through boring parts, slow through the good parts'
    ]
  },

  tutorial: {
    name: 'Tutorial',
    persona: `You understand that the best tutorial content doesn't feel like learning - it feels like getting insider information. You know that tutorials compete with millions of others, so the HOOK and ANGLE matter as much as the information.`,
    psychology: `Tutorial content works when viewers feel like they're getting VALUABLE insider knowledge efficiently. It fails when it feels like homework. The best tutorials feel like a friend showing you a secret.`,
    whatMatters: [
      'The angle - what makes THIS tutorial different?',
      'Clarity - can someone actually follow this?',
      'The hook - why should I watch THIS tutorial?',
      'Credibility - do you seem like you know?',
      'Efficiency - no wasted time'
    ],
    commonMistakes: [
      'Too long intro before the actual tip',
      'Explaining obvious things',
      'No clear hook/differentiation',
      'Unclear steps',
      'Boring delivery (education doesn\'t have to be boring)'
    ],
    famousPatterns: [
      'The "thing I wish I knew sooner"',
      'The "you\'ve been doing it wrong"',
      'The "industry secret"',
      'The quick transformation tutorial',
      'The mistake/correction format'
    ],
    scoringFocus: 'Hook/angle 35%, Clarity 35%, Value delivered 30%.',
    hookStyle: 'Should promise VALUE immediately. "Stop doing [common thing]" or "The trick no one talks about" - specificity wins.',
    captionStyle: 'Can be instructional. Save this, share with someone who needs this, tag-worthy language.',
    advancedTips: [
      'Get to the tip in the first 3 seconds - don\'t "intro"',
      'The hook should make viewers feel they\'ve been doing it WRONG',
      'Show, don\'t just tell - visual demonstration',
      'End with a clear result/before-after when possible',
      'Comments asking follow-up questions = success'
    ]
  },

  trend: {
    name: 'Trend',
    persona: `You understand that trend content lives and dies by TIMING and EXECUTION. You know that being early matters, but doing it WELL matters more. A late but excellent trend video beats an early but mediocre one.`,
    psychology: `Trend content works through recognition and variation. People enjoy seeing a familiar format done well, with a unique twist. The best trend videos make you think "why didn't I think of that?"`,
    whatMatters: [
      'Execution quality - nailed the format?',
      'Unique spin - what makes this version special?',
      'Timing - is this trend still hot?',
      'Technical execution (hitting beats, transitions)',
      'Personality coming through despite format'
    ],
    commonMistakes: [
      'Following the trend too literally (no unique spin)',
      'Missing the point of the trend',
      'Poor technical execution (wrong timing, bad transitions)',
      'Too late to the trend',
      'Forcing a trend that doesn\'t fit your niche'
    ],
    famousPatterns: [
      'The perfect execution of current trend',
      'The unexpected niche take on trend',
      'The elevated/high-production trend version',
      'The parody of the trend itself',
      'The combo of two trends'
    ],
    scoringFocus: 'Execution 40%, Unique angle 35%, Technical precision 25%.',
    hookStyle: 'Follow the trend format for hooks - viewers expect a certain structure.',
    captionStyle: 'Often minimal for trends, or trend-specific. Can play into or subvert the trend.',
    advancedTips: [
      'The audio timing is CRITICAL - every beat must hit perfectly',
      'Small unique twists stand out more than complete reinvention',
      'Your personality should still come through',
      'If you\'re late, you MUST have a unique angle',
      'Transitions should be SHARP - practice before recording'
    ]
  },

  grwm: {
    name: 'GRWM',
    persona: `You understand that GRWM content is fundamentally about PARASOCIAL connection. It's not really about the makeup or outfit - it's about spending time with someone. The viewer feels like they're hanging out with a friend.`,
    psychology: `GRWM works because it creates intimacy. Viewers feel they're in your space, sharing a private moment. The content matters less than the CONNECTION. The most successful GRWMs make people want to be your friend.`,
    whatMatters: [
      'Personality and warmth - would I want to hang out with them?',
      'The "confiding in a friend" energy',
      'Interesting conversation/tea/stories',
      'Pacing - not too fast, not boring',
      'Aesthetic of the space and routine'
    ],
    commonMistakes: [
      'Just showing process with no personality',
      'Too focused on the makeup/outfit, not enough "get ready WITH me"',
      'Awkward silence without purpose',
      'Trying too hard to be relatable',
      'Boring routine with nothing interesting happening'
    ],
    famousPatterns: [
      'The "spilling tea while getting ready"',
      'The life update GRWM',
      'The "opinions while I do my makeup"',
      'The event-specific GRWM',
      'The vlog-style GRWM'
    ],
    scoringFocus: 'Personality/likability 50%, Content value 30%, Aesthetic 20%.',
    hookStyle: 'Either visual routine start OR hook with the tea/topic. "So this happened..." while doing makeup.',
    captionStyle: 'Can be topic-based. "GRWM while I talk about..." or casual, conversational.',
    advancedTips: [
      'The routine is just the VEHICLE for the content - what are you saying?',
      'Eye contact with camera creates intimacy',
      'Small talk and tangents make it feel real',
      'Your bathroom/vanity aesthetic matters - it\'s the "set"',
      'Longer form often works better for GRWM - commit to the hang'
    ]
  },

  pov: {
    name: 'POV',
    persona: `You understand that POV content is about IMMERSION. The viewer should FEEL like they're in the scenario. You know the difference between "POV: thing happens to you" (correct) and just labeling any video "POV" (incorrect).`,
    psychology: `POV works through immersion and fantasy. Done right, the viewer experiences the scenario emotionally. They're not watching - they're IN it. This creates powerful emotional connection.`,
    whatMatters: [
      'Immersion - do I feel IN the scenario?',
      'Is this actual POV (viewer\'s perspective)?',
      'The scenario - interesting/engaging?',
      'Acting quality - believable?',
      'Camera work supporting the POV'
    ],
    commonMistakes: [
      'Mislabeled POV (showing yourself, not viewer\'s perspective)',
      'Breaking the fourth wall unintentionally',
      'Scenario too confusing to understand quickly',
      'Bad acting that breaks immersion',
      'Too much happening, unclear focus'
    ],
    famousPatterns: [
      'The "POV: you\'re [desirable thing]"',
      'The comfort/romantic scenario',
      'The funny/awkward situation',
      'The nostalgia trigger POV',
      'The wish fulfillment scenario'
    ],
    scoringFocus: 'Immersion 45%, Scenario appeal 30%, Execution 25%.',
    hookStyle: 'The POV label IS the hook. Must be specific and intriguing. "POV: your..." not "POV: something happens"',
    captionStyle: 'Usually minimal beyond the POV setup. Let the video speak.',
    advancedTips: [
      'Camera angle is everything - it should be where the viewer\'s eyes would be',
      'Direct address to camera enhances immersion',
      'Audio from the scenario (not background music) often works better',
      'The scenario should be immediately understandable in 1 second',
      'Emotion on your face = emotion viewer feels'
    ]
  },

  vlog: {
    name: 'Day in Life',
    persona: `You understand that vlog content works through AUTHENTICITY and curiosity about how others live. The best vlogs make mundane moments feel interesting through personality and perspective.`,
    psychology: `Vlog content satisfies curiosity about how others live their lives. It works when the creator's personality makes ordinary moments entertaining, or when the life itself is aspirational/interesting.`,
    whatMatters: [
      'Personality that makes mundane interesting',
      'Pacing - highlights only, no dead time',
      'The life/routine being shown',
      'Authenticity vs performance',
      'Visual quality and variety'
    ],
    commonMistakes: [
      'Including boring transitions/dead time',
      'Just showing activities without personality',
      'Too much "and then I did this"',
      'Poor pacing - too fast or too slow',
      'Trying too hard to seem interesting'
    ],
    famousPatterns: [
      'The productive morning routine',
      'The "day in my life as a [interesting thing]"',
      'The city/lifestyle vlog',
      'The "romanticizing my life" edit',
      'The chaos/real life vlog'
    ],
    scoringFocus: 'Personality 35%, Pacing 35%, Visual quality 30%.',
    hookStyle: 'Either start mid-action or tease the interesting part. Don\'t start with "good morning."',
    captionStyle: 'Can be longer, contextualized. "A day in my life as a..." or casual commentary.',
    advancedTips: [
      'Cut between moments - no one needs to see you walking from A to B',
      'Music choice sets the entire vibe - choose carefully',
      'The end of the day should have a natural conclusion/vibe',
      'B-roll of aesthetic moments breaks up talking',
      'Voiceover can add context without slowing down visuals'
    ]
  },

  flex: {
    name: 'Flex',
    persona: `You understand the PSYCHOLOGY of flexing. The best flexes don't feel like showing off - they feel like sharing something cool. You know the line between confidence and arrogance, between aspirational and obnoxious.`,
    psychology: `Flex content walks a fine line. Done well, it's aspirational and exciting. Done poorly, it's obnoxious and alienating. The key is making the viewer EXCITED for you, not resentful of you.`,
    whatMatters: [
      'Likability despite the flex',
      'The delivery - humble brag vs arrogant brag',
      'Is the flex actually impressive to the audience?',
      'Authenticity - is this real or rented?',
      'Does it inspire or alienate?'
    ],
    commonMistakes: [
      'Coming across as arrogant not aspirational',
      'Flexing things your audience doesn\'t care about',
      'Obvious wealth display without personality',
      'Fake flexes (people can tell)',
      'No humor or self-awareness'
    ],
    famousPatterns: [
      'The casual flex (not trying to show off, just sharing)',
      'The "I can\'t believe this is my life"',
      'The achievement flex (earned, not bought)',
      'The comparison flex (where I started vs now)',
      'The funny flex (self-aware about the flex)'
    ],
    scoringFocus: 'Likability 40%, Authenticity 30%, Impressiveness 30%.',
    hookStyle: 'Casual, not announcing the flex. Let viewers discover it or be surprised by it.',
    captionStyle: 'Self-aware is key. "I\'m sorry but..." or "not me being annoying but" or keep it simple.',
    advancedTips: [
      'The casual "accidentally" revealed flex outperforms the intentional flex',
      'Self-deprecating humor makes flexes more palatable',
      'Achievement flexes (things you worked for) > purchase flexes (things you bought)',
      'A flex with a story is more engaging than a flex with no context',
      'Inviting viewers in ("would you do this?") beats talking at them'
    ]
  },

  vulnerable: {
    name: 'Vulnerable',
    persona: `You understand that vulnerable content requires a careful balance. Too polished feels fake, too raw can be uncomfortable. The best vulnerable content makes people feel LESS alone. It's sharing, not venting.`,
    psychology: `Vulnerable content works through connection and validation. When someone shares something real, viewers feel seen and less alone in their own struggles. But it has to feel like sharing with a friend, not performing pain.`,
    whatMatters: [
      'Does it feel genuine or performed?',
      'Will this make viewers feel less alone?',
      'Is it sharing or venting?',
      'The strength within the vulnerability',
      'Does it offer something (hope, solidarity, understanding)?'
    ],
    commonMistakes: [
      'Trauma dumping without purpose',
      'Too polished/produced for the content',
      'Performing sadness vs sharing honestly',
      'No redemption or connection point',
      'Making it about pity, not connection'
    ],
    famousPatterns: [
      'The "I need to talk about this"',
      'The honest update/check-in',
      'The "you\'re not alone if you feel this"',
      'The journey/progress share',
      'The lesson learned through pain'
    ],
    scoringFocus: 'Authenticity 50%, Connection/value 30%, Delivery 20%.',
    hookStyle: 'Honest and direct. Don\'t sensationalize. "I need to be honest about something" or just start talking.',
    captionStyle: 'Keep it simple. Heart emoji, or honest statement, or nothing. Don\'t over-explain.',
    advancedTips: [
      'Crying is okay but shouldn\'t feel like the point',
      'Offering solidarity/hope makes vulnerable content shareable',
      'Raw audio often works better than music for vulnerable content',
      'Looking at camera creates more connection than looking away',
      'End with something - hope, solidarity, or simply "thanks for listening"'
    ]
  },

  chaotic: {
    name: 'Chaotic',
    persona: `You understand that chaotic content breaks all the rules ON PURPOSE. It's not random - it's controlled chaos. The best chaotic content has internal logic even if it seems unhinged. You can't analyze it with normal metrics.`,
    psychology: `Chaotic content works through surprise, absurdity, and the joy of things not making sense. It appeals to the part of people that's tired of polished content. The key is commitment - half-chaotic is just confusing.`,
    whatMatters: [
      'COMMITMENT - going all in on the chaos',
      'Internal logic (chaotic but not random)',
      'The energy level',
      'Surprise/unpredictability',
      'Does it make people say "what did I just watch?"'
    ],
    commonMistakes: [
      'Random ≠ chaotic (needs internal logic)',
      'Not committing fully',
      'Trying to explain the chaos',
      'Chaos without energy',
      'Too long - chaos works best SHORT'
    ],
    famousPatterns: [
      'The energy burst',
      'The escalating absurdity',
      'The "no context needed"',
      'The unhinged statement/action',
      'The chaos behind normal facade'
    ],
    scoringFocus: 'Commitment 40%, Energy 35%, Surprise factor 25%.',
    hookStyle: 'Should be IMMEDIATELY confusing or high-energy. No setup. Just chaos from frame 1.',
    captionStyle: 'None, or adds to chaos. Keysmashing, or completely unrelated statement.',
    advancedTips: [
      'Chaotic content should make people rewatch to understand what happened',
      'The commitment level is everything - can\'t be half in',
      'Audio should either be loud/chaotic or ironically calm',
      'Keep it SHORT - chaos loses impact over time',
      'The end should be abrupt - don\'t wrap it up neatly'
    ]
  },

  asmr: {
    name: 'Satisfying',
    persona: `You understand that satisfying/ASMR content triggers physiological responses. It's not about what's happening - it's about HOW it's captured. The sound design, the visual texture, the timing of movements.`,
    psychology: `Satisfying content works through sensory triggers - visual and auditory stimulation that creates a physical response (relaxation, "tingles," satisfaction). It's almost meditative - people watch to FEEL, not to learn.`,
    whatMatters: [
      'The sensory quality - does it FEEL satisfying?',
      'Audio quality (CRUCIAL for ASMR)',
      'Visual texture and detail',
      'Pacing - satisfying pace vs rushed',
      'The completion/resolution moment'
    ],
    commonMistakes: [
      'Poor audio quality (kills ASMR instantly)',
      'Too fast - satisfaction needs time',
      'Distracting background noise',
      'Cutting before the satisfying completion',
      'Over-produced (authenticity matters)'
    ],
    famousPatterns: [
      'The process video (making/creating)',
      'The texture/sound focus',
      'The organization/cleaning',
      'The perfect fit/completion',
      'The repetitive soothing action'
    ],
    scoringFocus: 'Sensory satisfaction 50%, Audio quality 30%, Pacing 20%.',
    hookStyle: 'Visual or audio hook should trigger the response immediately. No text needed usually.',
    captionStyle: 'Minimal. Maybe describing the sound/texture. Or nothing at all.',
    advancedTips: [
      'Audio is 60% of satisfying content - invest in good capture',
      'Slow motion on key moments enhances satisfaction',
      'The COMPLETION moment is everything - don\'t cut before it',
      'Consistent aesthetic/style builds following',
      'Loop potential: Can this video loop satisfyingly?'
    ]
  }
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Initialize database tables if needed
    await initDb();
    
    // Get client IP for anonymous tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Get authenticated user (optional - anonymous users allowed for first analysis)
    const { userId, has } = await auth();
    const user = userId ? await currentUser() : null;
    
    // Determine user's plan and usage
    let userPlan: 'anonymous' | 'free' | 'creator' | 'pro' = 'anonymous';
    let totalCount = 0;
    let monthlyCount = 0;
    let dailyCount = 0;
    let premiumCount = 0;
    
    if (userId) {
      // Authenticated user - check their plan and usage
      const hasPro = has?.({ plan: 'pro' }) || false;
      const hasCreator = has?.({ plan: 'creator' }) || false;
      userPlan = hasPro ? 'pro' : hasCreator ? 'creator' : 'free';
      
      totalCount = await getTotalAnalysisCount(userId);
      monthlyCount = await getMonthlyAnalysisCount(userId);
      dailyCount = await getDailyAnalysisCount(userId);
      premiumCount = await getMonthlyPremiumCount(userId);
      
      // Enforce limits based on plan
      if (userPlan === 'free' && totalCount >= USAGE_LIMITS.free.totalAnalyses) {
        return NextResponse.json({ 
          error: 'limit_reached',
          message: 'You\'ve used your free analysis. Upgrade to continue!',
          upgradeRequired: true,
          currentPlan: 'free',
          usage: { total: totalCount, limit: USAGE_LIMITS.free.totalAnalyses }
        }, { status: 403 });
      }
      
      if (userPlan === 'creator' && monthlyCount >= USAGE_LIMITS.creator.monthlyAnalyses) {
        return NextResponse.json({ 
          error: 'limit_reached',
          message: 'You\'ve reached your 30 analyses this month. Upgrade to Pro for more!',
          upgradeRequired: true,
          currentPlan: 'creator',
          usage: { monthly: monthlyCount, limit: USAGE_LIMITS.creator.monthlyAnalyses }
        }, { status: 403 });
      }
      
      if (userPlan === 'pro' && dailyCount >= USAGE_LIMITS.pro.dailyAnalyses) {
        return NextResponse.json({ 
          error: 'limit_reached',
          message: 'You\'ve reached your 5 analyses for today. Come back tomorrow!',
          upgradeRequired: false,
          currentPlan: 'pro',
          usage: { daily: dailyCount, limit: USAGE_LIMITS.pro.dailyAnalyses }
        }, { status: 403 });
      }
    } else {
      // Anonymous user - check if IP has already used free analysis
      const ipUsed = await hasIpUsedFreeAnalysis(clientIp);
      if (ipUsed) {
        return NextResponse.json({ 
          error: 'limit_reached',
          message: 'Sign up to continue analyzing videos!',
          upgradeRequired: true,
          currentPlan: 'anonymous',
          requiresSignUp: true,
        }, { status: 403 });
      }
    }
    
    // Determine model tier based on premium usage
    let modelTier: ModelTier = 'premium';
    if (userPlan === 'creator' && premiumCount >= USAGE_LIMITS.creator.premiumAnalyses) {
      modelTier = 'fast';
    } else if (userPlan === 'pro' && premiumCount >= USAGE_LIMITS.pro.premiumAnalyses) {
      modelTier = 'fast';
    }
    
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const mood = formData.get('mood') as string | null;
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    
    const analysisId = generateId();
    const moodStrategy = mood ? MOOD_STRATEGIES[mood] : null;
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const originalFilename = videoFile.name || 'video.mp4';
    
    console.log(`Video file received: ${originalFilename}, size: ${videoFile.size} bytes, buffer size: ${videoBuffer.length} bytes`);
    console.log(`Starting analysis for ${userId || `anonymous (${clientIp})`} (${userPlan} plan, ${modelTier} tier)`);
    
    // Call embedding service (uploads to S3 first for reliable transfer)
    console.log(`Processing video: ${originalFilename}...`);
    const videoAnalysis = await analyzeVideoWithService(videoBuffer, originalFilename);
    
    if (!videoAnalysis || videoAnalysis.frames.length === 0) {
      return NextResponse.json({ 
        error: 'Could not process video. Make sure the embedding service is running.',
        hint: 'Run: cd embedding-service && python main.py'
      }, { status: 503 });
    }
    
    const { frames } = videoAnalysis;
    
    // Upload frames to S3
    console.log('Uploading frames...');
    const frameUrls: string[] = [];
    for (let i = 0; i < frames.length; i++) {
      const frameS3Key = `tokbox/${analysisId}/frames/${String(i + 1).padStart(3, '0')}.jpg`;
      const frameUrl = await uploadBase64ToS3(frames[i], frameS3Key);
      frameUrls.push(frameUrl);
    }
    
    // Comprehensive analysis with mood-specific strategy
    console.log(`Analyzing video (${modelTier} model)...`);
    const analysis = await analyzeVideoComprehensive(frameUrls, mood, modelTier);
    
    if (!analysis) {
      return NextResponse.json({ 
        error: 'Analysis failed. Please try again.',
      }, { status: 500 });
    }
    
    const contentDescription = analysis.content_description || 'Video content';
    const existingText = analysis.existing_text_overlay || null;
    const intent = analysis.intent || null;
    const isTrend = analysis.is_trend_format || false;
    
    // Generate hooks specific to this content with mood strategy
    console.log(`Generating hooks (${modelTier} model)...`);
    const { hookSet, recommendedType, existingTextAssessment, whyThisType } = await generateHooksForContent(
      frameUrls, 
      contentDescription,
      existingText,
      intent,
      isTrend,
      mood,
      modelTier
    );
    
    // Generate captions with mood strategy
    console.log('Generating captions...');
    const captions = await generateCaptions(contentDescription, intent, existingText, mood);
    
    // Calculate grade - use execution instead of pacing
    const scores = {
      hook: analysis.scores?.hook?.score || 5,
      visual: analysis.scores?.visual?.score || 5,
      pacing: analysis.scores?.execution?.score || analysis.scores?.pacing?.score || 5,
    };
    const { grade, color, potential } = calculateGrade(scores);
    
    // Track the analysis for usage limits and leads
    await trackAnalysis({
      userId: userId || null,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
      ipAddress: !userId ? clientIp : null, // Only track IP for anonymous users
      mood: mood || 'unspecified',
      videoDurationSeconds: videoAnalysis.duration || undefined,
      grade,
      viralScore: potential,
      modelUsed: modelTier,
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`Analysis complete in ${processingTime}ms for ${userId} (${mood || 'no mood'})`);
    
    return NextResponse.json({
      id: analysisId,
      processingTimeMs: processingTime,
      
      // Grade & Summary
      grade,
      gradeColor: color,
      viralPotential: potential,
      summary: analysis.summary || 'Analysis complete',
      
      // Context awareness
      existingTextOverlay: existingText,
      isTrendFormat: isTrend,
      trendType: analysis.trend_type || null,
      intent: intent,
      
      // Detailed scores
      scores: {
        hook: {
          score: analysis.scores?.hook?.score || 5,
          label: 'Hook Power',
          feedback: analysis.scores?.hook?.feedback || 'Consider a stronger opening',
        },
        visual: {
          score: analysis.scores?.visual?.score || 5,
          label: 'Visual Quality',
          feedback: analysis.scores?.visual?.feedback || 'Lighting could be improved',
        },
        pacing: {
          score: analysis.scores?.execution?.score || analysis.scores?.pacing?.score || 5,
          label: 'Execution',
          feedback: analysis.scores?.execution?.feedback || analysis.scores?.pacing?.feedback || 'Consider the overall execution',
        },
      },
      
      // What AI sees
      contentDescription,
      
      // Strengths & Improvements
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      
      // Advanced insights (new)
      theOneThing: analysis.the_one_thing || null,
      advancedInsight: analysis.advanced_insight || null,
      
      // Hooks (tabbed)
      hooks: hookSet,
      recommendedHookType: recommendedType,
      existingTextAssessment: existingTextAssessment,
      whyThisHookType: whyThisType,
      
      // Captions
      captions,
      
      // Mood strategy info (for display)
      moodStrategy: moodStrategy ? {
        name: moodStrategy.name,
        whatMatters: moodStrategy.whatMatters.slice(0, 3),
        advancedTips: moodStrategy.advancedTips.slice(0, 2),
      } : null,
      
      // Usage info (for conversion UI)
      usage: {
        plan: userPlan,
        modelUsed: modelTier,
        analysesUsed: userPlan === 'anonymous' ? 1 :
                      userPlan === 'free' ? totalCount + 1 : 
                      userPlan === 'creator' ? monthlyCount + 1 : 
                      dailyCount + 1,
        analysesLimit: userPlan === 'anonymous' ? 1 :
                       userPlan === 'free' ? USAGE_LIMITS.free.totalAnalyses :
                       userPlan === 'creator' ? USAGE_LIMITS.creator.monthlyAnalyses :
                       USAGE_LIMITS.pro.dailyAnalyses,
        isLastFreeAnalysis: userPlan === 'anonymous' || (userPlan === 'free' && totalCount === 0),
      },
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
