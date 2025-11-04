import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { prepareConversationContext } from "@/lib/openai/context";
import { validateMathematicalExpression, evaluateResponseCorrectness } from "@/lib/openai/response-validation";
import {
  trackStuckState,
  analyzeConversationForStuckState,
  resetStuckState,
  calculateHintLevel,
  type StuckState,
} from "@/lib/openai/stuck-detection";
import {
  determineUnderstandingLevel,
  resetUnderstandingState,
  type UnderstandingState,
} from "@/lib/openai/adaptive-questioning";
import { Message } from "@/types/chat";
import OpenAI from "openai";

// Maximum retry attempts
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt - 1);

      // Log retry attempt (dev only)
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Chat API retry attempt ${attempt}/${maxAttempts} after ${delay}ms`
        );
      }

      await sleep(delay);
    }
  }

  throw lastError;
}


/**
 * POST /api/chat
 * Send message to OpenAI GPT-4 Turbo and get AI tutor response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [], userId, stuckState, understandingState } = body;

    // Validate request
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Message is required and must be a string.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Conversation history must be an array.",
        },
        { status: 400 }
      );
    }

    // Validate message is not empty after trimming
    if (!message.trim()) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    // Initialize or validate stuck state
    let currentStuckState: StuckState;
    if (stuckState && typeof stuckState === "object") {
      // Use provided stuck state if valid
      currentStuckState = {
        consecutiveConfused: stuckState.consecutiveConfused || 0,
        isStuck: stuckState.isStuck || false,
        lastConfusedIndex: stuckState.lastConfusedIndex || null,
      };
    } else if (conversationHistory.length > 0) {
      // Analyze existing conversation to determine stuck state
      currentStuckState = analyzeConversationForStuckState(conversationHistory);
    } else {
      // No conversation history, start fresh
      currentStuckState = resetStuckState();
    }

    // Analyze current message for confusion and update stuck state
    const updatedStuckState = trackStuckState(
      message,
      conversationHistory,
      currentStuckState
    );

    // Calculate hint level based on consecutive confused responses
    const hintLevel = calculateHintLevel(updatedStuckState.consecutiveConfused);

    // Validate mathematical expressions and evaluate correctness if message contains math content
    const mathExpressionPattern = /[a-zA-Z0-9+\-*/^=()]/;
    const hasMathContent = mathExpressionPattern.test(message);
    
    let correctnessLevel: "correct" | "incorrect" | "partial" = "partial"; // Default
    
    if (hasMathContent) {
      const expressionValidation = validateMathematicalExpression(message);
      
      // If expression is invalid, still send to OpenAI but let it handle the response
      // The enhanced prompt will guide the student to correct format using Socratic questions
      if (!expressionValidation.isValid && process.env.NODE_ENV === "development") {
        console.log(`Expression validation warning: ${expressionValidation.error}`);
        correctnessLevel = "incorrect";
      } else {
        // Evaluate response correctness (semantic evaluation done by LLM via prompt)
        // For now, we use a simple heuristic - actual correctness determined by LLM
        const validationResult = evaluateResponseCorrectness(message);
        correctnessLevel = validationResult.correctnessLevel;
      }
    }

    // Initialize or validate understanding state
    let currentUnderstandingState: UnderstandingState;
    if (understandingState && typeof understandingState === "object") {
      // Use provided understanding state if valid
      currentUnderstandingState = {
        level: understandingState.level || "progressing",
        consecutiveCorrect: understandingState.consecutiveCorrect || 0,
        consecutiveIncorrect: understandingState.consecutiveIncorrect || 0,
        consecutivePartial: understandingState.consecutivePartial || 0,
        totalResponses: understandingState.totalResponses || 0,
        lastUpdated: understandingState.lastUpdated || Date.now(),
      };
    } else {
      // Start fresh understanding state
      currentUnderstandingState = resetUnderstandingState();
    }

    // Determine understanding level from validation results and stuck state
    const updatedUnderstandingState = determineUnderstandingLevel(
      correctnessLevel,
      updatedStuckState,
      currentUnderstandingState
    );

    // Convert messages to OpenAI format and manage context window
    // Pass stuck state, hint level, and understanding level to context preparation
    const openAIMessages = prepareConversationContext(
      conversationHistory,
      message,
      undefined, // Use default maxTokens
      updatedStuckState.isStuck,
      updatedStuckState.consecutiveConfused,
      hintLevel,
      updatedUnderstandingState.level
    );

    // Call OpenAI API with retry logic
    let aiResponse: OpenAI.Chat.Completions.ChatCompletion;
    try {
      aiResponse = await retryWithBackoff(async () => {
        return await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: openAIMessages,
          max_tokens: 1000,
          temperature: 0.7,
        });
      });
    } catch (error) {
      // Log error (dev only, or Firebase Analytics in prod)
      if (process.env.NODE_ENV === "development") {
        console.error("Chat API error after retries:", error);
      }
      // TODO: Log to Firebase Analytics in production

      // Handle specific OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        // Rate limit error (429)
        if (error.status === 429) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: "Too many requests. Please wait a moment and try again.",
            },
            { status: 429 }
          );
        }

        // Authentication error (401)
        if (error.status === 401) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: "Authentication error. Please check your API key.",
            },
            { status: 401 }
          );
        }

        // Context window overflow (400)
        if (error.status === 400 && error.message?.toLowerCase().includes("context")) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error:
                "Conversation is too long. Please start a new conversation.",
            },
            { status: 400 }
          );
        }

        // Other API errors
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: "Unable to get tutor response. Please try again.",
          },
          { status: 500 }
        );
      }

      // Network timeout errors
      if (error instanceof Error && error.message.includes("timeout")) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error:
              "Request timed out. Please try again or check your connection.",
          },
          { status: 504 }
        );
      }

      // Unknown errors
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unable to get tutor response. Please try again.",
        },
        { status: 500 }
      );
    }

    // Extract AI response
    const aiMessage =
      aiResponse.choices[0]?.message?.content?.trim() || "";

    if (!aiMessage) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Invalid response format from AI. Please try again.",
        },
        { status: 500 }
      );
    }

    // Generate message ID and timestamp
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Return success response with updated stuck state and understanding state
    return NextResponse.json({
      success: true,
      data: {
        message: aiMessage,
        messageId,
        timestamp,
        stuckState: updatedStuckState, // Include updated stuck state in response
        understandingState: updatedUnderstandingState, // Include updated understanding state in response
      },
      error: null,
    });
  } catch (error: unknown) {
    // Log error (dev only, or Firebase Analytics in prod)
    if (process.env.NODE_ENV === "development") {
      console.error("Chat API route error:", error);
    }
    // TODO: Log to Firebase Analytics in production

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Invalid request format.",
        },
        { status: 400 }
      );
    }

    // Handle network timeout errors
    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Request timed out. Please try again.",
        },
        { status: 504 }
      );
    }

    // Unknown errors
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}


