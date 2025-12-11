import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {
  getHookGenerationPrompt,
  parseHookResponse,
} from '@/lib/hooks';

// Route segment config for App Router
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

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

async function analyzeVideoWithService(videoBlob: Blob): Promise<VideoAnalysisResult | null> {
  try {
    const formData = new FormData();
    formData.append('video', videoBlob, 'video.mp4');
    formData.append('num_frames', '10');
    
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/analyze-video`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      console.error('Embedding service error:', await response.text());
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

async function analyzeVideoComprehensive(frameUrls: string[]) {
  // Use Claude for the comprehensive analysis
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
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `You're a TikTok strategist analyzing a video. Your job is to give ACTUALLY USEFUL feedback, not generic advice.

FIRST, identify:
1. Is there TEXT OVERLAY visible in the video? If so, what does it say? This is critical.
2. Is this following a TREND FORMAT? (POV videos, transition trends, photo dump style, etc.)
3. What's the INTENT? (humor, thirst trap, relatable content, transformation, etc.)

DESCRIBE THE VIDEO:
- What do you literally see? Person, setting, outfit, action.
- If there are multiple frames/scenes, what changes?
- What's the vibe/energy trying to be conveyed?

NOW SCORE - but be CONTEXTUALLY AWARE:
- If it's a trend format, judge it AS that format, not against unrelated criteria
- If it's intentionally static (like a pose trend), don't dock points for lack of movement
- A 7 is genuinely good. 8+ is legitimately impressive. Don't grade inflate.

1. HOOK POWER (0-3 seconds):
   - Given what this video IS, does the opening work?
   - Will it stop the scroll for the TARGET AUDIENCE?
   
2. VISUAL QUALITY:
   - Lighting, composition, aesthetic
   - Does it look intentional and polished?
   
3. EXECUTION:
   - How well does it execute what it's TRYING to do?
   - If it's a trend, does it nail the format?
   - If it's meant to be static, is that done well?

CRITICAL: If the video ALREADY HAS text overlay, note this in your response. Don't suggest they add text if they already have it - suggest how to IMPROVE the existing text or note if it works.

Return JSON:
{
  "existing_text_overlay": "exact text if visible, or null",
  "is_trend_format": true/false,
  "trend_type": "describe the trend/format if applicable, or null",
  "intent": "what is this video trying to accomplish",
  
  "content_description": "1-2 sentences - what this video actually is",
  "summary": "1 sentence verdict that shows you UNDERSTAND what they're going for",
  
  "scores": {
    "hook": { "score": 1-10, "feedback": "specific to THIS type of content" },
    "visual": { "score": 1-10, "feedback": "specific observation" },
    "execution": { "score": 1-10, "feedback": "how well they executed their intent" }
  },
  
  "strengths": ["2-3 things that work FOR THIS TYPE of content"],
  "improvements": ["2-3 actually useful suggestions that understand the format"]
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
  moodContext: string | null
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
  
  // Build context-aware prompt
  let contextInfo = `Video shows: ${contentDescription}\n`;
  if (moodContext) contextInfo += `Creator's intended vibe: ${moodContext}\n`;
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
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `${contextInfo}
${existingTextSection}

Generate text overlay options in 3 styles.

IMPORTANT ABOUT LENGTH:
- Hooks can be ANY length that works
- Longer hooks (full sentences, even multiple sentences) can INCREASE watch time because people have to read them
- Don't artificially limit to short hooks - match the vibe
- A relatable rant can be 15+ words. A confident statement might be 3 words.
- Match the LENGTH to the VIBE

${moodContext ? `THE CREATOR SAID THIS IS: ${moodContext}
Your hooks MUST match this energy. If they said "thirst trap", don't give them relatable humor hooks.` : ''}

CRITICAL RULES:
1. Must make sense for THIS SPECIFIC video
2. Must match the VIBE the creator is going for
3. NO generic garbage like "they don't know" or "wait for it"
4. NO nonsense that doesn't relate to the actual content

BAD HOOKS (never do these):
- "Why [random item] reveals everything" - makes no sense
- Generic mystery that doesn't connect to content
- Mismatched tone (funny hook for serious content or vice versa)
- Anything that sounds like clickbait spam

GOOD HOOKS:
- Match the energy/vibe perfectly
- Reference something the viewer will actually see
- Can be long (forces them to read = more watch time)
- Feel like something a real creator would write

STYLE 1 - CURIOSITY GAP: Creates anticipation, open loop, they need to watch to close it
STYLE 2 - PATTERN INTERRUPT: Bold, unexpected, breaks the scroll, makes them stop
STYLE 3 - ASPIRATIONAL: Makes them want the vibe/feeling/life/look

Return JSON:
{
  "existing_text_assessment": "If there's existing text, is it good? What works/doesn't?",
  "recommended_type": "curiosity_gap" | "pattern_interrupt" | "aspirational",
  "hook_set": {
    "curiosity_gap": [
      { "text": "hook that creates anticipation - can be longer" },
      { "text": "alternative approach" }
    ],
    "pattern_interrupt": [
      { "text": "bold/unexpected hook" },
      { "text": "alternative" }
    ],
    "aspirational": [
      { "text": "vibe-based hook" },
      { "text": "alternative" }
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
    };
  } catch (e) {
    console.error('Failed to parse hooks:', e);
    return {
      hookSet: {
        curiosityGap: [{ text: 'The part they cut out' }],
        patternInterrupt: [{ text: 'Not what you think' }],
        aspirational: [{ text: 'This version hits different' }],
      },
      recommendedType: 'curiosity_gap' as const,
      existingTextAssessment: null,
    };
  }
}

async function generateCaptions(contentDescription: string, intent: string | null, existingText: string | null, moodContext: string | null) {
  const context = `Video: ${contentDescription}
${moodContext ? `Creator's vibe: ${moodContext}` : ''}
${intent ? `Detected intent: ${intent}` : ''}
${existingText ? `Has text overlay: "${existingText}"` : ''}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Generate 3 TikTok captions that a real creator would actually use.

${moodContext ? `THE CREATOR SAID THIS IS: ${moodContext}
Your captions MUST match this energy exactly.` : ''}

CRITICAL - AVOID THESE CRINGE PATTERNS:
- "When reality hits" - overused garbage
- "Sometimes you just can't" - meaningless
- "Lost in the [x]" - pretentious
- "Living my best [x]" - dead phrase
- "That feeling when" - 2015 meme energy
- Anything that sounds like an Instagram caption from 2018
- Generic "relatable" phrases that could apply to anything

MATCH THE VIBE:
- Thirst trap: Confident, mysterious, or just "." or emoji
- Relatable: Casual, self-deprecating, conversational
- Confident: Unbothered, short, powerful
- Funny: Actually funny, not trying-too-hard funny
- Trend: Can be minimal or reference the trend

Rules:
- Can be 1 word to 15 words - whatever fits the vibe
- NO emojis in the text
- NO hashtags  
- Must feel NATURAL, like a real person wrote it
- "." is a valid caption for thirst traps
- "no" or "anyway" or "lol" are valid captions

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

// Mood descriptions for the AI
const MOOD_CONTEXT: Record<string, string> = {
  thirst: 'Thirst trap - confident, alluring, attention-grabbing, sensual without being explicit',
  relatable: 'Relatable content - funny, self-deprecating, everyday struggles everyone understands',
  confident: 'Confident energy - unbothered, self-assured, boss vibes, not trying too hard',
  mysterious: 'Mysterious vibe - intriguing, enigmatic, leaves viewers wanting more',
  transformation: 'Transformation content - glow up, before/after, showing evolution',
  lifestyle: 'Lifestyle content - aspirational, living well, aesthetic moments',
  workout: 'Fitness content - workout motivation, gym energy, physical achievement',
  funny: 'Comedy - making people laugh, jokes, chaotic energy',
  storytime: 'Storytime - narrative, tea to spill, drama, building to a reveal',
  tutorial: 'Tutorial - teaching something, how-to, sharing tips',
  trend: 'Trend content - following a viral format, sound, or challenge',
  grwm: 'GRWM - get ready with me, routine content, process-focused',
  pov: 'POV - point of view storytelling, immersive perspective',
  vlog: 'Day in life - vlog style, authentic daily content',
  flex: 'Flex content - showing off achievements, humble brag, wins',
  vulnerable: 'Vulnerable content - real talk, honest emotions, opening up',
  chaotic: 'Chaotic energy - unhinged, random, unpredictable, no rules',
  asmr: 'Satisfying content - ASMR vibes, calming, visually or audibly satisfying',
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const mood = formData.get('mood') as string | null;
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    
    const analysisId = generateId();
    const moodContext = mood ? MOOD_CONTEXT[mood] : null;
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
    
    // Call embedding service for frames
    console.log('Extracting frames...');
    const videoAnalysis = await analyzeVideoWithService(videoBlob);
    
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
    
    // Comprehensive analysis
    console.log('Analyzing video...');
    const analysis = await analyzeVideoComprehensive(frameUrls);
    
    if (!analysis) {
      return NextResponse.json({ 
        error: 'Analysis failed. Please try again.',
      }, { status: 500 });
    }
    
    const contentDescription = analysis.content_description || 'Video content';
    const existingText = analysis.existing_text_overlay || null;
    const intent = analysis.intent || null;
    const isTrend = analysis.is_trend_format || false;
    
    // Generate hooks specific to this content
    console.log('Generating hooks...');
    const { hookSet, recommendedType, existingTextAssessment } = await generateHooksForContent(
      frameUrls, 
      contentDescription,
      existingText,
      intent,
      isTrend,
      moodContext
    );
    
    // Generate captions
    console.log('Generating captions...');
    const captions = await generateCaptions(contentDescription, intent, existingText, moodContext);
    
    // Calculate grade - use execution instead of pacing
    const scores = {
      hook: analysis.scores?.hook?.score || 5,
      visual: analysis.scores?.visual?.score || 5,
      pacing: analysis.scores?.execution?.score || analysis.scores?.pacing?.score || 5,
    };
    const { grade, color, potential } = calculateGrade(scores);
    
    const processingTime = Date.now() - startTime;
    console.log(`Analysis complete in ${processingTime}ms`);
    
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
      
      // Hooks (tabbed)
      hooks: hookSet,
      recommendedHookType: recommendedType,
      existingTextAssessment: existingTextAssessment,
      
      // Captions
      captions,
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
