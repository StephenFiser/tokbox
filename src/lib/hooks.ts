/**
 * Narrative Hook System v2
 * 
 * Three core hook types that drive watch-through:
 * 1. Curiosity Gap - "Something is about to be revealed"
 * 2. Pattern Interrupt - "Wait, what?"
 * 3. Aspirational Jealousy - "I want that life/look/feeling"
 */

export type HookType = 'curiosity_gap' | 'pattern_interrupt' | 'aspirational';

export type HookTone = 
  | 'heavy'        // Introspective, transformation journey
  | 'elevated'     // Sophisticated, aspirational
  | 'sensual'      // Alluring, mysterious
  | 'confident'    // Unbothered, self-assured
  | 'playful';     // Fun, cheeky

export interface HookOption {
  text: string;
  timing?: string;
}

export interface HookSet {
  curiosityGap: HookOption[];
  patternInterrupt: HookOption[];
  aspirational: HookOption[];
}

export const HOOK_TYPE_INFO: Record<HookType, {
  name: string;
  iconName: 'lightbulb' | 'bolt' | 'sparkles';
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  example: string;
}> = {
  curiosity_gap: {
    name: 'Curiosity Gap',
    iconName: 'lightbulb',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Creates an open loop they HAVE to close',
    example: 'Everything changed between these two moments.',
  },
  pattern_interrupt: {
    name: 'Pattern Interrupt',
    iconName: 'bolt',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: 'Breaks the scroll with something unexpected',
    example: 'Exactly what it looks like.',
  },
  aspirational: {
    name: 'Aspirational',
    iconName: 'sparkles',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Makes them want that life/feeling',
    example: 'This is the version I was waiting for.',
  },
};

export function getHookGenerationPrompt(preferredTone?: HookTone): string {
  const toneGuidance = preferredTone ? `
TONE PREFERENCE: ${preferredTone.toUpperCase()}
Match the hooks to this tone. Avoid mismatches.
` : '';

  return `You are creating text overlay hooks for a short-form video. Generate hooks in THREE categories.

${toneGuidance}

THE THREE HOOK TYPES:

1. CURIOSITY GAP
   The viewer knows they'll learn/see something, but not what.
   Examples:
   - "Everything changed between these two moments."
   - "There's a whole story between these shots."
   - "They have no idea."
   - "If you knew what led to this..."
   
2. PATTERN INTERRUPT
   Something unexpected that breaks the scroll.
   Examples:
   - "Exactly what it looks like."
   - "Plot twist."
   - "Not what you expected."
   - "No explanation needed."
   
3. ASPIRATIONAL
   DESIRE for that feeling/life/look.
   Examples:
   - "This is the version I was waiting for."
   - "Different day. Different life."
   - "The view from here."
   - "Not sorry about it."

RULES:
- Each hook: 2-10 words max
- NEVER describe the video literally
- NEVER use: vibes, energy, mood, aesthetic, main character, pov
- Hooks must work EVEN IF the viewer doesn't know the video content`;
}

export function getHookResponseSchema(): string {
  return `{
  "suggested_tone": "heavy|elevated|sensual|confident|playful",
  
  "hook_set": {
    "curiosity_gap": [
      { "text": "Hook 1", "timing": "0-2s" },
      { "text": "Hook 2" },
      { "text": "Hook 3" }
    ],
    "pattern_interrupt": [
      { "text": "Hook 1", "timing": "0-2s" },
      { "text": "Hook 2" }
    ],
    "aspirational": [
      { "text": "Hook 1", "timing": "0-2s" },
      { "text": "Hook 2" }
    ]
  },
  
  "recommended_type": "curiosity_gap|pattern_interrupt|aspirational",
  "recommended_hook": "The single best hook for this specific content",
  "why_this_works": "1 sentence on why this hook type fits"
}`;
}

export function parseHookResponse(response: Record<string, unknown>): HookSet {
  const hookSet = (response.hook_set || {}) as Record<string, unknown>;
  
  const parseHooks = (arr: unknown): HookOption[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((h: unknown) => ({
      text: typeof h === 'string' ? h : ((h as Record<string, unknown>)?.text as string || ''),
      timing: (h as Record<string, unknown>)?.timing as string | undefined,
    })).filter(h => h.text);
  };
  
  return {
    curiosityGap: parseHooks(hookSet.curiosity_gap),
    patternInterrupt: parseHooks(hookSet.pattern_interrupt),
    aspirational: parseHooks(hookSet.aspirational),
  };
}
