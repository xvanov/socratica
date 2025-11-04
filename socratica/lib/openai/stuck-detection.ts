/**
 * Stuck detection utilities
 * Detects when students are stuck or confused based on response patterns
 * Tracks consecutive confused responses and flags students as stuck after 2+ consecutive confused responses
 */

import { Message } from "@/types/chat";

/**
 * Confusion indicators - patterns that suggest student confusion
 */
const CONFUSION_PATTERNS = [
  /\b(i don't know|i dont know|idk)\b/i,
  /\b(i'm stuck|im stuck|stuck)\b/i,
  /\b(i'm confused|im confused|confused)\b/i,
  /\b(i don't understand|i dont understand)\b/i,
  /\b(i don't get it|i dont get it)\b/i,
  /\b(what\?|huh\?|i don't see|i dont see)\b/i,
  /\b(i have no idea|no idea|no clue)\b/i,
  /\b(can't figure|cannot figure|can't solve|cannot solve)\b/i,
  /\b(help me|i need help|don't know how|dont know how)\b/i,
  /\b(not sure|unsure|struggling|having trouble)\b/i,
] as const;

/**
 * Minimum length for a meaningful response (very short responses may indicate confusion)
 */
const MIN_MEANINGFUL_LENGTH = 10;

/**
 * Maximum length for a potentially confused response (very long vague responses)
 */
const MAX_VAGUE_LENGTH = 200;

/**
 * Threshold for consecutive confused responses to be considered "stuck"
 */
export const STUCK_THRESHOLD = 2;

/**
 * Maximum hint level (progressive escalation)
 */
export const MAX_HINT_LEVEL = 3;

/**
 * Calculate hint level based on consecutive confused responses
 * Level 1: 2-3 stuck turns (subtle hint)
 * Level 2: 4-5 stuck turns (more specific hint)
 * Level 3: 6+ stuck turns (most specific hint, but still not direct answer)
 * 
 * @param consecutiveConfused - Number of consecutive confused responses
 * @returns Hint level (1-3)
 */
export function calculateHintLevel(consecutiveConfused: number): number {
  if (consecutiveConfused < 2) {
    return 0; // No hint needed
  } else if (consecutiveConfused <= 3) {
    return 1; // Level 1: Subtle hint
  } else if (consecutiveConfused <= 5) {
    return 2; // Level 2: More specific hint
  } else {
    return MAX_HINT_LEVEL; // Level 3: Most specific hint
  }
}

/**
 * Stuck state tracking interface
 */
export interface StuckState {
  consecutiveConfused: number;
  isStuck: boolean;
  lastConfusedIndex: number | null; // Index of last confused message in conversation
}

/**
 * Analyze student response for confusion indicators
 * Considers response content semantically, not just length
 * 
 * @param response - Student response text to analyze
 * @param conversationHistory - Previous messages in conversation (for detecting repeated questions)
 * @returns true if response indicates confusion, false otherwise
 */
export function detectConfusion(
  response: string,
  conversationHistory: Message[] = []
): boolean {
  // Normalize response for analysis
  const normalizedResponse = response.trim().toLowerCase();

  // Empty responses indicate confusion
  if (normalizedResponse.length === 0) {
    return true;
  }

  // Check for explicit confusion patterns first (takes precedence)
  for (const pattern of CONFUSION_PATTERNS) {
    if (pattern.test(normalizedResponse)) {
      return true;
    }
  }

  // Very short responses may indicate confusion, but check for math content first
  // Short responses with math content (numbers, equations) are likely clear
  if (normalizedResponse.length < MIN_MEANINGFUL_LENGTH) {
    // If it contains math content, it's likely clear (e.g., "x = 4")
    if (containsMathContent(normalizedResponse)) {
      return false;
    }
    // Otherwise, very short responses without math are likely confused
    return true;
  }

  // Check for repeated questions (same question asked multiple times)
  const recentStudentMessages = conversationHistory
    .filter((msg) => msg.role === "student")
    .slice(-3) // Check last 3 student messages
    .map((msg) => msg.content.trim().toLowerCase());

  // If current response is very similar to recent student messages, may indicate confusion
  const currentNormalized = normalizedResponse;
  const isRepeated = recentStudentMessages.some((prevMsg) => {
    // Simple similarity check - if messages are very similar, likely repeated question
    const similarity = calculateSimilarity(currentNormalized, prevMsg);
    return similarity > 0.8 && prevMsg.length > MIN_MEANINGFUL_LENGTH;
  });

  if (isRepeated) {
    return true;
  }

  // Check for very vague responses that don't address questions
  // Very long responses without clear structure may indicate confusion
  // Check for vague confusion indicators first (even if contains question words)
  if (normalizedResponse.length > MAX_VAGUE_LENGTH && containsVagueConfusion(normalizedResponse)) {
    // If it contains vague confusion AND no math content, it's likely confused
    if (!containsMathContent(normalizedResponse)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate simple similarity between two strings (0-1)
 * Uses Jaccard similarity based on word sets
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter((w) => w.length > 2));

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Check if response contains mathematical content
 */
function containsMathContent(response: string): boolean {
  // Check for numbers, equations, math operators
  return /[\d+\-*/(=)]/.test(response);
}

/**
 * Check if response contains very vague confusion indicators
 * Checks for patterns like "not sure", "confusing", "frustrated" without engagement
 */
function containsVagueConfusion(response: string): boolean {
  const vaguePatterns = [
    /\b(not sure|unsure|confusing|frustrated|struggling|having trouble)\b/i,
  ];
  return vaguePatterns.some((pattern) => pattern.test(response));
}

/**
 * Track consecutive confused responses
 * Updates stuck state based on current response analysis
 * 
 * @param currentResponse - Current student response
 * @param conversationHistory - Previous messages in conversation
 * @param currentStuckState - Current stuck state (from previous analysis)
 * @returns Updated stuck state
 */
export function trackStuckState(
  currentResponse: string,
  conversationHistory: Message[] = [],
  currentStuckState: StuckState = { consecutiveConfused: 0, isStuck: false, lastConfusedIndex: null }
): StuckState {
  const isConfused = detectConfusion(currentResponse, conversationHistory);

  if (isConfused) {
    const newConsecutiveConfused = currentStuckState.consecutiveConfused + 1;
    const isStuck = newConsecutiveConfused >= STUCK_THRESHOLD;
    const lastConfusedIndex = conversationHistory.length; // Current message index

    return {
      consecutiveConfused: newConsecutiveConfused,
      isStuck,
      lastConfusedIndex,
    };
  } else {
    // Reset consecutive count if student shows progress
    return {
      consecutiveConfused: 0,
      isStuck: false,
      lastConfusedIndex: currentStuckState.lastConfusedIndex,
    };
  }
}

/**
 * Check if student is currently stuck
 * Convenience function that wraps trackStuckState
 * 
 * @param currentResponse - Current student response
 * @param conversationHistory - Previous messages in conversation
 * @param currentStuckState - Current stuck state
 * @returns true if student is stuck (2+ consecutive confused responses)
 */
export function isStudentStuck(
  currentResponse: string,
  conversationHistory: Message[] = [],
  currentStuckState: StuckState = { consecutiveConfused: 0, isStuck: false, lastConfusedIndex: null }
): boolean {
  const updatedState = trackStuckState(
    currentResponse,
    conversationHistory,
    currentStuckState
  );
  return updatedState.isStuck;
}

/**
 * Reset stuck state (e.g., when starting new problem or student makes progress)
 * 
 * @returns Reset stuck state
 */
export function resetStuckState(): StuckState {
  return {
    consecutiveConfused: 0,
    isStuck: false,
    lastConfusedIndex: null,
  };
}

/**
 * Analyze conversation history to determine current stuck state
 * Useful for initializing stuck state from existing conversation
 * 
 * @param conversationHistory - Full conversation history
 * @returns Current stuck state based on conversation analysis
 */
export function analyzeConversationForStuckState(
  conversationHistory: Message[]
): StuckState {
  let consecutiveConfused = 0;
  let lastConfusedIndex: number | null = null;

  // Analyze student messages in reverse order to find consecutive confused responses
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const message = conversationHistory[i];
    if (message.role === "student") {
      const previousMessages = conversationHistory.slice(0, i);
      const isConfused = detectConfusion(message.content, previousMessages);

      if (isConfused) {
        consecutiveConfused++;
        if (lastConfusedIndex === null) {
          lastConfusedIndex = i;
        }
      } else {
        // Break on first non-confused response
        break;
      }
    }
  }

  return {
    consecutiveConfused,
    isStuck: consecutiveConfused >= STUCK_THRESHOLD,
    lastConfusedIndex,
  };
}

