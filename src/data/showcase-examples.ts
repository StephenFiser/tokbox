// Curated showcase examples for marketing
// Video URLs can be added once files are uploaded to S3 or public folder

export interface ShowcaseExample {
  id: string;
  title: string;
  subtitle: string;
  mood: string;
  grade: string;
  viralScore: number;
  videoUrl?: string; // Add video URL when available
  thumbnailUrl?: string; // Optional thumbnail
  results: {
    grade: string;
    gradeColor: string;
    viralPotential: number;
    summary: string;
    existingTextOverlay?: string;
    isTrendFormat?: boolean;
    trendType?: string;
    scores: {
      hook: { score: number; label: string; feedback: string };
      visual: { score: number; label: string; feedback: string };
      pacing: { score: number; label: string; feedback: string };
    };
    contentDescription: string;
    strengths: string[];
    improvements: string[];
    theOneThing: string;
    advancedInsight?: string;
    hooks: {
      curiosityGap: { text: string }[];
      patternInterrupt: { text: string }[];
      aspirational: { text: string }[];
    };
    recommendedHookType: string;
    existingTextAssessment?: string;
    whyThisHookType?: string;
    captions: string[];
    moodStrategy?: {
      name: string;
      whatMatters: string[];
      advancedTips?: string[];
    };
  };
}

export const SHOWCASE_EXAMPLES: ShowcaseExample[] = [
  {
    id: 'trend-engagement-bait',
    title: '"Spot the Difference" Trend',
    subtitle: 'How to nail engagement bait formats',
    mood: 'trend',
    grade: 'C',
    viralScore: 7.6,
    videoUrl: 'https://candyshop-1.s3.us-east-2.amazonaws.com/tokbox/videos/1765946144072_bc_0001.mp4',
    results: {
      grade: 'C',
      gradeColor: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
      viralPotential: 7.6,
      summary: 'Perfect execution of the spot-the-difference bait format that\'s designed to drive comments, paired with \'making money online\' content.',
      existingTextOverlay: 'BOMB vs CRUSH (spot the difference)',
      isTrendFormat: true,
      trendType: 'Spot the difference meme/visual illusion trend',
      scores: {
        hook: {
          score: 8,
          label: 'Hook Power',
          feedback: 'The \'spot the difference\' format is proven engagement bait - people WILL comment looking for differences even when there aren\'t any. Clean, readable text overlay.'
        },
        visual: {
          score: 6,
          label: 'Visual Quality',
          feedback: 'Simple gray slides are functional but basic. The TikTok video portion has decent natural lighting and clear framing, though nothing exceptional.'
        },
        pacing: {
          score: 9,
          label: 'Execution',
          feedback: 'Nails the format perfectly - identical images with confident framing that makes people assume there IS a difference. The transition to actual content is smooth.'
        }
      },
      contentDescription: 'Two identical gray slides with \'BOMB vs CRUSH (spot the difference)\' text, followed by TikTok video of creator claiming to make $4,000 from brand emails.',
      strengths: [
        'Perfect psychological manipulation - the format makes people obsessively search for differences that don\'t exist',
        'Clean, professional text overlay that\'s immediately readable',
        'Smart pairing of engagement bait with valuable-seeming content about making money'
      ],
      improvements: [
        'The gray slides are too plain - add subtle visual interest while keeping them identical (textures, gradients, etc.)',
        'The TikTok portion could use better visual storytelling - show the laptop screen, emails, or other \'proof\' elements',
        'Consider adding a subtle audio cue or beat drop at the transition to the actual content'
      ],
      theOneThing: 'Add visual complexity to the gray slides (subtle patterns, textures, or multiple elements) while keeping them identical - this makes people search harder and comment more.',
      advancedInsight: 'This format works because it exploits the psychological principle of \'forced attention\' - once someone commits to looking for differences, they can\'t stop until they find them or give up and comment. The beauty is there ARE no differences, so engagement is guaranteed.',
      hooks: {
        curiosityGap: [
          { text: 'IDENTICAL vs IDENTICAL (spot the trick)' },
          { text: 'GRAY vs GRAY (find what\'s really different)' }
        ],
        patternInterrupt: [
          { text: 'BAIT vs SWITCH (spot the business lesson)' },
          { text: 'TREND vs TRUTH (one makes you $4000)' }
        ],
        aspirational: [
          { text: 'BROKE vs LAPTOP MONEY (spot the difference)' },
          { text: 'SCROLLING vs EARNING (which one are you)' }
        ]
      },
      recommendedHookType: 'pattern_interrupt',
      existingTextAssessment: 'The \'BOMB vs CRUSH (spot the difference)\' text works perfectly for the trend format - it\'s the exact structure viewers expect.',
      whyThisHookType: 'This video is essentially a bait-and-switch - promising a spot-the-difference game but delivering entrepreneurship content.',
      captions: [
        'Can you spot the hidden dollar signs? 💰👀',
        'BOMB or CRUSH? Let\'s see who can find the clues!',
        'The real difference? One\'s making bank! 💸'
      ],
      moodStrategy: {
        name: 'Trend',
        whatMatters: [
          'Execution quality - nailed the format?',
          'Unique spin - what makes this version special?',
          'Timing - is this trend still hot?'
        ],
        advancedTips: [
          'The audio timing is CRITICAL - every beat must hit perfectly',
          'Small unique twists stand out more than complete reinvention'
        ]
      }
    }
  },
  {
    id: 'tutorial-suspense',
    title: 'Tutorial with Suspense Hook',
    subtitle: 'Building anticipation before the reveal',
    mood: 'tutorial',
    grade: 'C-',
    viralScore: 7.2,
    videoUrl: 'https://candyshop-1.s3.us-east-2.amazonaws.com/tokbox/videos/1765558923913_048880fd2afb407294b9e16fc01a238a.mov',
    results: {
      grade: 'C-',
      gradeColor: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
      viralPotential: 7.2,
      summary: 'Strong visual hook with proper suspense building, but the payoff/tutorial content isn\'t visible in these frames.',
      existingTextOverlay: 'I honestly can\'t believe this isn\'t everywhere yet. (for creators)',
      isTrendFormat: true,
      trendType: 'hands covering mouth/face for suspense reveal',
      scores: {
        hook: {
          score: 8,
          label: 'Hook Power',
          feedback: 'The hands-over-mouth with that text overlay creates genuine curiosity - \'what secret am I missing?\' The pink nails and dramatic expression sell the surprise effectively.'
        },
        visual: {
          score: 7,
          label: 'Visual Quality',
          feedback: 'Clean lighting and composition, nice depth with the kitchen background. The consistent framing across the reveal sequence maintains visual flow well.'
        },
        pacing: {
          score: 6,
          label: 'Execution',
          feedback: 'Nails the suspense buildup perfectly, but without seeing the actual tutorial content, this could be all buildup with no payoff - the biggest tutorial content killer.'
        }
      },
      contentDescription: 'Creator uses hands-over-mouth gesture across multiple frames to build suspense around revealing some creator tip or knowledge.',
      strengths: [
        'Excellent use of the \'industry secret\' psychological hook - makes viewers feel they\'re missing out on insider knowledge',
        'The \'(for creators)\' specificity immediately tells the target audience this is for them',
        'Strong visual storytelling with the progressive hand reveals building genuine anticipation'
      ],
      improvements: [
        'Need to see the actual tutorial delivery - most \'big reveal\' tutorial content fails because the payoff doesn\'t match the buildup',
        'The \'isn\'t everywhere yet\' claim needs to be backed up with something genuinely unique, not basic advice',
        'Consider starting the actual tip sooner - too much suspense can feel manipulative if the content doesn\'t deliver'
      ],
      theOneThing: 'Make sure your actual tutorial content is as compelling as your buildup - viewers will feel cheated if this dramatic reveal leads to basic advice they\'ve heard before.',
      advancedInsight: 'The \'(for creators)\' tag is smart niche targeting, but it also raises the bar - creator audiences are more skeptical of \'secret tips\' because they\'ve seen them all.',
      hooks: {
        curiosityGap: [
          { text: 'The creator secret I\'m covering my mouth about (it\'s that shocking)' },
          { text: 'Why I literally had to cover my mouth when I learned this creator hack' }
        ],
        patternInterrupt: [
          { text: 'Stop covering your mouth and start covering this mistake' },
          { text: 'The blue tank revelation that changed my creator game' }
        ],
        aspirational: [
          { text: 'The kitchen counter epiphany every creator needs' },
          { text: 'When the creator lightbulb moment hits this hard' }
        ]
      },
      recommendedHookType: 'curiosity_gap',
      existingTextAssessment: 'The current text works well for tutorial content - it creates mystery with \'can\'t believe this isn\'t everywhere yet\' and directly targets creators.',
      whyThisHookType: 'The hands-over-mouth gesture is perfectly set up for curiosity gap hooks - it\'s literally the visual representation of \'I can\'t believe I\'m about to tell you this secret\'',
      captions: [
        'Hold your breath! Discover the secret tip that every creator needs to know!',
        'Get ready for a game-changing revelation! Follow along as I unveil a creator tip that will elevate your content!',
        'Are you ready to level up your creation game? Stay tuned as I share a little-known tip that\'s about to change everything for you!'
      ],
      moodStrategy: {
        name: 'Tutorial',
        whatMatters: [
          'The angle - what makes THIS tutorial different?',
          'Clarity - can someone actually follow this?',
          'The hook - why should I watch THIS tutorial?'
        ],
        advancedTips: [
          'Get to the tip in the first 3 seconds - don\'t "intro"',
          'The hook should make viewers feel they\'ve been doing it WRONG'
        ]
      }
    }
  },
  {
    id: 'comedy-timing',
    title: 'Comedy: Expectation vs Reality',
    subtitle: 'Why timing makes or breaks the joke',
    mood: 'funny',
    grade: 'D+',
    viralScore: 6.9,
    videoUrl: 'https://candyshop-1.s3.us-east-2.amazonaws.com/tokbox/videos/1765579163039_tok_said_no.mp4',
    results: {
      grade: 'D+',
      gradeColor: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
      viralPotential: 6.9,
      summary: 'Solid POV format execution but the punchline lands with a thud instead of a laugh due to timing issues.',
      existingTextOverlay: 'POV: me thinking my last video was great',
      isTrendFormat: true,
      trendType: 'POV expectation vs reality reveal',
      scores: {
        hook: {
          score: 7,
          label: 'Hook Power',
          feedback: 'POV format + relatable creator anxiety is scroll-stopping for the target audience, but the energy feels slightly manufactured'
        },
        visual: {
          score: 8,
          label: 'Visual Quality',
          feedback: 'Excellent natural lighting from the side, creates depth and warmth. Blue top pops against neutral background. Composition is clean and intentional.'
        },
        pacing: {
          score: 5,
          label: 'Execution',
          feedback: 'The concept works but the reveal timing kills the comedy - we see the grade too long and the creator\'s reaction isn\'t committed enough to sell the devastation'
        }
      },
      contentDescription: 'A creator shows overly confident expressions while text says she thinks her last video was great, then reveals a D- grade analysis report as the punchline.',
      strengths: [
        'Nails the overconfident creator energy in the setup - the smug expressions are perfectly punchable',
        'Visual quality is genuinely impressive with great natural lighting and color contrast',
        'Chose a universally relatable creator experience that hits the target audience'
      ],
      improvements: [
        'Cut the grade reveal shorter - flash it for 1 second max, then cut to genuine devastation reaction',
        'Commit harder to the emotional whiplash - go from delusional confidence to actual visible defeat',
        'The \'Analysis Complete\' screen holds too long - by the time we process it, the joke momentum is dead'
      ],
      theOneThing: 'Cut the grade reveal to 1 second and follow immediately with a genuine \'soul leaving body\' reaction - the current timing lets all the comedic tension deflate.',
      advancedInsight: 'The funniest part isn\'t the bad grade itself, it\'s the psychological violence of going from delusional to devastated - but you\'re not mining that emotional whiplash hard enough.',
      hooks: {
        curiosityGap: [
          { text: 'Why I spent 2 hours on my hair for this' },
          { text: 'The blue top was supposed to be lucky' }
        ],
        patternInterrupt: [
          { text: 'Full glam for a reality check' },
          { text: 'Dressed up to get humbled' }
        ],
        aspirational: [
          { text: 'Confidence level: blue ribbed tank' },
          { text: 'When your hair looks better than your content' }
        ]
      },
      recommendedHookType: 'pattern_interrupt',
      existingTextAssessment: 'The current text \'POV: me thinking my last video was great\' works well as a clear setup for the comedy - it establishes the overconfident delusion before the reality check.',
      whyThisHookType: 'The overly polished look creates a strong visual contrast with the eventual reality check - pattern interrupt hooks can play with this disconnect',
      captions: [
        'A solid D for dedication! 😂',
        'POV: confidence level = 100, grades = 0',
        'When you think you\'re a star but the report says \'meh\''
      ],
      moodStrategy: {
        name: 'Comedy',
        whatMatters: [
          'Timing - setup length vs payoff',
          'Does it land on FIRST watch?',
          'The element of surprise/subversion'
        ],
        advancedTips: [
          'The pause before the punchline is as important as the punchline',
          'Cut BEFORE the full reaction - let viewers imagine the rest'
        ]
      }
    }
  },
  {
    id: 'relatable-miss',
    title: 'When "Relatable" Becomes a Flex',
    subtitle: 'A case study in alienating your audience',
    mood: 'relatable',
    grade: 'F',
    viralScore: 4.4,
    videoUrl: 'https://candyshop-1.s3.us-east-2.amazonaws.com/tokbox/videos/1765944015736_v24044gl0000d4iqpjvog65macdejcu0.MP4',
    results: {
      grade: 'F',
      gradeColor: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
      viralPotential: 4.4,
      summary: 'This misses the relatable mark entirely - it\'s a flex disguised as inspiration that most viewers can\'t relate to at all.',
      existingTextOverlay: 'Emailed 200 brands today\n58 replied.\n46 said no.\nBut 4 said yes.\nThose 4 paid me $1000 each.\nThat\'s $4,000 in one day.',
      isTrendFormat: true,
      trendType: 'cooking while sharing success story',
      scores: {
        hook: {
          score: 4,
          label: 'Hook Power',
          feedback: 'The numbers grab attention but immediately alienate most viewers who don\'t have access to pitch 200 brands or earn $1000 per deal'
        },
        visual: {
          score: 6,
          label: 'Visual Quality',
          feedback: 'Clean kitchen lighting and steady hands create good visual quality, but the soup-stirring feels disconnected from the business story'
        },
        pacing: {
          score: 3,
          label: 'Execution',
          feedback: 'Completely misses relatable content - this is a success story/flex that makes viewers feel excluded rather than seen'
        }
      },
      contentDescription: 'Creator stirs soup while text overlay shares their day of pitching 200 brands and earning $4,000 from 4 acceptances, positioned as motivational content.',
      strengths: [
        'The specific numbers (200 emails, 58 replies) add credibility',
        'Kitchen setting creates casual, approachable vibe',
        'Text pacing matches stirring rhythm well'
      ],
      improvements: [
        'Focus on the relatable struggle BEFORE success - the anxiety of sending emails, fear of rejection',
        'Share the specific emotional moments everyone feels when pitching',
        'Make it about the process/feelings, not the impressive outcome'
      ],
      theOneThing: 'Flip this from outcome-focused to process-focused - show the relatable emotions of hitting send on scary emails, not the unrelatable $4k result.',
      advancedInsight: 'True relatable content about entrepreneurship focuses on the universal emotions (imposter syndrome, rejection fear) not impressive metrics that 99% of viewers can\'t achieve.',
      hooks: {
        curiosityGap: [
          { text: 'Making soup while my phone buzzes with $4k in notifications' },
          { text: 'When you\'re stirring dinner and accidentally make rent money' }
        ],
        patternInterrupt: [
          { text: 'This soup cost me $0.50 to make but earned me $4,000' },
          { text: 'POV: Your Tuesday soup break just paid your bills' }
        ],
        aspirational: [
          { text: 'The energy when your laptop pays for your groceries' },
          { text: 'Cooking dinner knowing I made $4k before lunch' }
        ]
      },
      recommendedHookType: 'curiosity_gap',
      existingTextAssessment: 'The existing text works well as a motivational success story with clear metrics, but it feels very \'hustle culture\' generic and doesn\'t match relatable content energy.',
      whyThisHookType: 'The contrast between casual soup-stirring and business success creates natural curiosity - viewers want to know how someone casually makes $4k while cooking',
      captions: [
        'No because why do I feel like I\'m constantly living in this \'send 200 emails and hope for 4 responses\' cycle?',
        'I thought I was the only one who had to cast a million lines just to reel in a few wins!',
        'I feel personally attacked by this grind; why does success feel like a full-time job of sending out hundreds of emails?'
      ],
      moodStrategy: {
        name: 'Relatable',
        whatMatters: [
          'Specificity - is this a SPECIFIC relatable moment or generic?',
          'The "I thought I was the only one" factor',
          'Authenticity - does it feel real or performed?'
        ],
        advancedTips: [
          'The best relatable content makes people tag friends - is this tag-worthy?',
          'Comments should be "literally me" not "lol" - that\'s the metric'
        ]
      }
    }
  }
];

// Helper to get example by ID
export function getExampleById(id: string): ShowcaseExample | undefined {
  return SHOWCASE_EXAMPLES.find(ex => ex.id === id);
}

// Marketing copy for each example
export const EXAMPLE_MARKETING: Record<string, { headline: string; cta: string }> = {
  'trend-engagement-bait': {
    headline: 'See why this trend-jacking video scored a C',
    cta: 'Learn what worked and what didn\'t →'
  },
  'tutorial-suspense': {
    headline: 'The tutorial hook that almost worked',
    cta: 'See the full breakdown →'
  },
  'comedy-timing': {
    headline: 'Why timing killed this comedy video',
    cta: 'Learn from our mistakes →'
  },
  'relatable-miss': {
    headline: 'When "relatable" content backfires',
    cta: 'See what went wrong →'
  }
};

