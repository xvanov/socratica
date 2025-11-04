/**
 * Adaptive questioning utilities
 * Determines student understanding level and adjusts question complexity accordingly
 * Integrates with response validation and stuck detection to provide personalized guidance
 */

import { CorrectnessLevel } from "./response-validation";
import type { StuckState } from "@/types/chat";

/**
 * Understanding level indicating student's current comprehension state
 */
export type UnderstandingLevel = "confused" | "struggling" | "progressing" | "strong";

/**
 * Question complexity level matching understanding level
 */
export type QuestionComplexity = "simplified" | "scaffolded" | "standard" | "advanced";

/**
 * Mapping from understanding level to question complexity
 */
export const UNDERSTANDING_TO_COMPLEXITY: Record<UnderstandingLevel, QuestionComplexity> = {
  confused: "simplified",
  struggling: "scaffolded",
  progressing: "standard",
  strong: "advanced",
};

/**
 * Understanding level tracking state
 */
export interface UnderstandingState {
  level: UnderstandingLevel;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  consecutivePartial: number;
  totalResponses: number;
  lastUpdated: number; // Timestamp of last update
}

/**
 * Determine understanding level from response validation results and stuck state
 * Maps validation results and stuck state to understanding levels:
 * - Confused: Stuck detected OR multiple consecutive incorrect responses
 * - Struggling: Some incorrect responses, partial progress, occasional confusion
 * - Progressing: Mix of correct and incorrect, making progress
 * - Strong: Mostly correct responses, few errors, clear understanding
 * 
 * @param correctnessLevel - Correctness level from response validation
 * @param stuckState - Stuck state from stuck detection
 * @param previousState - Previous understanding state (for tracking consecutive responses)
 * @returns Updated understanding state
 */
export function determineUnderstandingLevel(
  correctnessLevel: CorrectnessLevel,
  stuckState: StuckState | null,
  previousState: UnderstandingState | null
): UnderstandingState {
  // Initialize state if not provided
  const state: UnderstandingState = previousState || {
    level: "progressing",
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    consecutivePartial: 0,
    totalResponses: 0,
    lastUpdated: Date.now(),
  };

  // Update consecutive counters
  let consecutiveCorrect = state.consecutiveCorrect;
  let consecutiveIncorrect = state.consecutiveIncorrect;
  let consecutivePartial = state.consecutivePartial;

  if (correctnessLevel === "correct") {
    consecutiveCorrect++;
    consecutiveIncorrect = 0;
    consecutivePartial = 0;
  } else if (correctnessLevel === "incorrect") {
    consecutiveCorrect = 0;
    consecutiveIncorrect++;
    consecutivePartial = 0;
  } else if (correctnessLevel === "partial") {
    consecutiveCorrect = 0;
    consecutiveIncorrect = 0;
    consecutivePartial++;
  }

  // Determine new understanding level
  let newLevel: UnderstandingLevel;

  // Confused: Stuck detected OR 3+ consecutive incorrect OR 2+ consecutive incorrect with stuck state
  if (
    (stuckState?.isStuck && stuckState.consecutiveConfused >= 2) ||
    consecutiveIncorrect >= 3 ||
    (consecutiveIncorrect >= 2 && stuckState?.isStuck)
  ) {
    newLevel = "confused";
  }
  // Struggling: 2 consecutive incorrect OR stuck state with 1 confused response OR multiple partial with occasional incorrect
  else if (
    consecutiveIncorrect >= 2 ||
    (stuckState?.isStuck && stuckState.consecutiveConfused === 1) ||
    (consecutivePartial >= 2 && state.consecutiveIncorrect > 0)
  ) {
    newLevel = "struggling";
  }
  // Strong: 2+ consecutive correct OR mostly correct responses (80%+)
  else if (
    consecutiveCorrect >= 2 ||
    (state.totalResponses > 3 && consecutiveCorrect / state.totalResponses >= 0.8)
  ) {
    newLevel = "strong";
  }
  // Progressing: Default state (mix of responses, making progress)
  else {
    newLevel = "progressing";
  }

  return {
    level: newLevel,
    consecutiveCorrect,
    consecutiveIncorrect,
    consecutivePartial,
    totalResponses: state.totalResponses + 1,
    lastUpdated: Date.now(),
  };
}

/**
 * Adjust question complexity based on understanding level
 * Returns complexity level and instructions for AI to adjust questions accordingly
 * 
 * @param understandingLevel - Current understanding level
 * @returns Question complexity level matching understanding level
 */
export function adjustQuestionComplexity(
  understandingLevel: UnderstandingLevel
): QuestionComplexity {
  return UNDERSTANDING_TO_COMPLEXITY[understandingLevel];
}

/**
 * Get adaptive questioning instructions for system prompt
 * Provides instructions for AI to adjust question complexity based on understanding level
 * 
 * @param understandingLevel - Current understanding level
 * @param questionComplexity - Question complexity level
 * @returns Instructions string for system prompt
 */
export function getAdaptiveQuestioningInstructions(
  understandingLevel: UnderstandingLevel,
  questionComplexity: QuestionComplexity
): string {
  const baseInstructions = `
**ADAPTIVE QUESTIONING INSTRUCTIONS (Student Understanding Level: ${understandingLevel}):**

CRITICAL: Adjust question complexity based on student's understanding level. Maintain Socratic approach at all complexity levels.
- Questions must be QUESTIONS, not direct answers
- Questions guide student toward solution through discovery
- Complexity adjustments maintain logical sequence in problem-solving approach
`;

  switch (questionComplexity) {
    case "simplified":
      return `${baseInstructions}

**Simplified Complexity (Student is Confused):**
- Break questions into smaller, simpler steps
- Use more guidance and scaffolding
- Use simpler language and familiar examples
- Check understanding frequently with yes/no or simple choice questions
- Provide more encouragement and reassurance
- Example: "Let's start with something simpler. What do you see in this equation? Is there a number being added to x?"
- Build confidence before progressing to harder questions
- NEVER give direct answers - still use questions, just simpler ones
`;

    case "scaffolded":
      return `${baseInstructions}

**Scaffolded Complexity (Student is Struggling):**
- Provide scaffolding questions that guide through steps
- Break problems into manageable chunks
- Use guiding questions that check understanding at each step
- Provide hints within questions (e.g., "What operation would help you isolate x? Think about what's happening to the x.")
- Example: "Let's work through this step by step. First, what number is being added to 2x? What operation would undo that addition?"
- Offer more examples and analogies
- Maintain encouraging tone
- NEVER give direct answers - scaffold through questions
`;

    case "standard":
      return `${baseInstructions}

**Standard Complexity (Student is Progressing):**
- Use normal progression with standard complexity
- Ask questions that guide toward solution
- Balance guidance with student independence
- Build questions progressively toward solution
- Maintain logical sequence (understand problem → isolate variable → solve)
- Example: "What operation would you use to get x by itself? What's happening to the x in this equation?"
- Standard Socratic questioning approach
- NEVER give direct answers - still use questions, just standard complexity
`;

    case "advanced":
      return `${baseInstructions}

**Advanced Complexity (Student Shows Strong Understanding):**
- Increase question difficulty and depth
- Ask more challenging questions that require deeper thinking
- Reduce scaffolding - let student think more independently
- Ask questions that explore concepts more deeply
- Faster progression toward solution
- Example: "How would you approach solving this equation? What properties of equality apply here?"
- Challenge student to explain reasoning
- Skip simpler steps if student demonstrates understanding
- NEVER give direct answers - still use questions, just more challenging ones
`;

    default:
      return baseInstructions;
  }
}

/**
 * Build progressive questions that maintain logical sequence
 * Ensures questions build toward solution in logical order:
 * 1. Understand problem
 * 2. Identify what needs to be solved
 * 3. Isolate variable
 * 4. Solve
 * 5. Verify solution
 * 
 * @param currentStep - Current step in problem-solving process (0-4)
 * @param understandingLevel - Current understanding level
 * @returns Question guidance for next step
 */
export function buildProgressiveQuestion(
  currentStep: number,
  understandingLevel: UnderstandingLevel
): string {
  const complexity = adjustQuestionComplexity(understandingLevel);
  
  const stepGuides = [
    {
      step: 0,
      name: "Understand Problem",
      simplified: "What do you see in this equation? Can you identify what the problem is asking you to find?",
      scaffolded: "Let's start by understanding the problem. What are we trying to solve for? What does the equation tell us?",
      standard: "What is this problem asking you to find? What do you notice about the equation?",
      advanced: "Analyze this equation. What are the key components and what are we solving for?",
    },
    {
      step: 1,
      name: "Identify Approach",
      simplified: "What do you need to do to solve this? What operation might help?",
      scaffolded: "Think about what you need to do to solve for x. What operation would help you isolate x?",
      standard: "What approach would you take to solve this equation? What's the first step?",
      advanced: "What strategy would you use to solve this equation? Explain your reasoning.",
    },
    {
      step: 2,
      name: "Isolate Variable",
      simplified: "How can you get x by itself? What number is being added to x?",
      scaffolded: "Let's work on isolating x. What number is being added to 2x? What operation would undo that addition?",
      standard: "What operation would you use to isolate x? What happens to both sides of the equation?",
      advanced: "How would you isolate the variable? What properties of equality apply here?",
    },
    {
      step: 3,
      name: "Solve",
      simplified: "What is x equal to now? Can you solve for x?",
      scaffolded: "Now that you've isolated x, what is x equal to? Can you simplify the right side?",
      standard: "What is the value of x? How did you determine this?",
      advanced: "What is the solution? Verify your answer and explain your reasoning.",
    },
    {
      step: 4,
      name: "Verify Solution",
      simplified: "Does your answer make sense? Can you check it?",
      scaffolded: "Let's verify your answer. Can you substitute your value back into the original equation?",
      standard: "How would you verify this solution? What would you check?",
      advanced: "Verify your solution. What method would you use and why?",
    },
  ];

  const stepGuide = stepGuides[Math.min(currentStep, stepGuides.length - 1)];
  
  return stepGuide[complexity] || stepGuide.standard;
}

/**
 * Determine current problem-solving step from conversation history
 * Analyzes conversation to determine where student is in problem-solving process
 * 
 * @param conversationHistory - Previous messages in conversation
 * @returns Current step (0-4) or -1 if unable to determine
 */
export function determineCurrentStep(
  conversationHistory: Array<{ role: string; content: string }>
): number {
  // Simple heuristic: count steps based on conversation length and content
  // In a real implementation, this would use more sophisticated analysis
  
  const recentMessages = conversationHistory.slice(-5); // Look at last 5 messages
  
  // Check for solution verification mentions
  if (recentMessages.some(msg => /verify|check|substitute|plug/i.test(msg.content))) {
    return 4; // Verify solution
  }
  
  // Check for solving mentions
  if (recentMessages.some(msg => /solve|equal|value|x\s*=/i.test(msg.content))) {
    return 3; // Solve
  }
  
  // Check for isolating variable mentions
  if (recentMessages.some(msg => /isolate|by itself|alone|subtract|add|divide|multiply/i.test(msg.content))) {
    return 2; // Isolate variable
  }
  
  // Check for approach mentions
  if (recentMessages.some(msg => /approach|strategy|step|operation/i.test(msg.content))) {
    return 1; // Identify approach
  }
  
  // Default to understanding problem
  return 0;
}

/**
 * Reset understanding state when starting new problem
 * Creates a fresh understanding state for new problem session
 * 
 * @returns Reset understanding state
 */
export function resetUnderstandingState(): UnderstandingState {
  return {
    level: "progressing",
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    consecutivePartial: 0,
    totalResponses: 0,
    lastUpdated: Date.now(),
  };
}

