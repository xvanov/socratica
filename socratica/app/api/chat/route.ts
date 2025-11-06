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
import { WhiteboardState } from "@/types/whiteboard";
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
    const { message, conversationHistory = [], userId, stuckState, understandingState, whiteboardState, whiteboardImage, whiteboardOCRText } = body;

    // Debug logging for whiteboard content detection
    if (process.env.NODE_ENV === "development") {
      console.log("Chat API: Received request:", {
        messageLength: message?.length || 0,
        messageTrimmed: message?.trim() || "",
        hasWhiteboardImage: !!whiteboardImage,
        whiteboardImageLength: whiteboardImage?.length || 0,
        hasWhiteboardOCRText: !!whiteboardOCRText,
        whiteboardOCRTextLength: whiteboardOCRText?.length || 0,
        hasWhiteboardState: !!whiteboardState,
        whiteboardStateType: typeof whiteboardState,
        whiteboardStateElements: whiteboardState?.elements,
        whiteboardStateElementsLength: whiteboardState?.elements?.length || 0,
        whiteboardStateIsArray: Array.isArray(whiteboardState?.elements),
      });
    }

    // Validate request
    // Allow empty message only if whiteboard content is provided
    const hasWhiteboardContent = !!(whiteboardImage || whiteboardOCRText || (whiteboardState && whiteboardState.elements && Array.isArray(whiteboardState.elements) && whiteboardState.elements.length > 0));
    
    // Normalize message - treat undefined/null as empty string
    const normalizedMessage = message || "";
    
    if (typeof normalizedMessage !== "string") {
      if (process.env.NODE_ENV === "development") {
        console.error("Chat API: Message validation failed - not a string:", {
          messageType: typeof message,
          messageValue: message,
          hasWhiteboardContent,
        });
      }
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Message must be a string.",
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
    // Exception: allow empty message if whiteboard content is provided
    if (!normalizedMessage.trim() && !hasWhiteboardContent) {
      if (process.env.NODE_ENV === "development") {
        console.error("Chat API: Validation failed - empty message without whiteboard content:", {
          message: normalizedMessage,
          messageTrimmed: normalizedMessage.trim(),
          hasWhiteboardContent,
          whiteboardImage: !!whiteboardImage,
          whiteboardImageLength: whiteboardImage?.length || 0,
          whiteboardOCRText: !!whiteboardOCRText,
          whiteboardOCRTextLength: whiteboardOCRText?.length || 0,
          whiteboardState: !!whiteboardState,
          whiteboardStateElements: whiteboardState?.elements?.length || 0,
          whiteboardStateIsArray: Array.isArray(whiteboardState?.elements),
        });
      }
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Message cannot be empty unless whiteboard content is provided.",
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
    // Use OCR text or a default message if message is empty but whiteboard content exists
    const messageForAnalysis = normalizedMessage.trim() || whiteboardOCRText || "Student shared whiteboard content";
    const updatedStuckState = trackStuckState(
      messageForAnalysis,
      conversationHistory,
      currentStuckState
    );

    // Calculate hint level based on consecutive confused responses
    const hintLevel = calculateHintLevel(updatedStuckState.consecutiveConfused);

    // Validate mathematical expressions and evaluate correctness if message contains math content
    // Use OCR text if message is empty but whiteboard content exists
    const messageForValidation = normalizedMessage.trim() || whiteboardOCRText || "";
    const mathExpressionPattern = /[a-zA-Z0-9+\-*/^=()]/;
    const hasMathContent = mathExpressionPattern.test(messageForValidation);
    
    let correctnessLevel: "correct" | "incorrect" | "partial" = "partial"; // Default
    
    if (hasMathContent) {
      const expressionValidation = validateMathematicalExpression(messageForValidation);
      
      // If expression is invalid, still send to OpenAI but let it handle the response
      // The enhanced prompt will guide the student to correct format using Socratic questions
      if (!expressionValidation.isValid && process.env.NODE_ENV === "development") {
        console.log(`Expression validation warning: ${expressionValidation.error}`);
        correctnessLevel = "incorrect";
      } else {
        // Evaluate response correctness (semantic evaluation done by LLM via prompt)
        // For now, we use a simple heuristic - actual correctness determined by LLM
        const validationResult = evaluateResponseCorrectness(messageForValidation);
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
    // Pass stuck state, hint level, understanding level, whiteboard state, and whiteboard image to context preparation
    // Use a default message if message is empty but whiteboard content exists
    const messageForContext = normalizedMessage.trim() || (hasWhiteboardContent ? "Please help me with this problem." : "");
    
    let openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    try {
      openAIMessages = prepareConversationContext(
        conversationHistory,
        messageForContext,
        undefined, // Use default maxTokens
        updatedStuckState.isStuck,
        updatedStuckState.consecutiveConfused,
        hintLevel,
        updatedUnderstandingState.level,
        whiteboardState as WhiteboardState | null | undefined,
        whiteboardImage as string | null | undefined,
        whiteboardOCRText as string | null | undefined
      );
    } catch (contextError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Chat API: Error preparing conversation context:", contextError);
      }
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `Failed to prepare conversation context: ${contextError instanceof Error ? contextError.message : "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    // Determine model - use vision model if whiteboard image is provided
    const model = whiteboardImage ? "gpt-4-turbo" : "gpt-4-turbo"; // GPT-4 Turbo supports vision

    // Call OpenAI API with retry logic
    let aiResponse: OpenAI.Chat.Completions.ChatCompletion;
    try {
      aiResponse = await retryWithBackoff(async () => {
        return await openai.chat.completions.create({
          model: model,
          messages: openAIMessages,
          max_tokens: 1000,
          temperature: 0.7,
        });
      });
    } catch (error) {
      // Log error (dev only, or Firebase Analytics in prod)
      if (process.env.NODE_ENV === "development") {
        console.error("Chat API error after retries:", error);
        if (error instanceof OpenAI.APIError) {
          console.error("Chat API: OpenAI API Error details:", {
            status: error.status,
            message: error.message,
            code: error.code,
            type: error.type,
            param: error.param,
          });
        }
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

        // Other 400 errors from OpenAI (e.g., invalid image format, content array issues)
        if (error.status === 400) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: `OpenAI API error: ${error.message || "Invalid request format. Please check your whiteboard content."}`,
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
      if (process.env.NODE_ENV === "development") {
        console.error("Chat API: Empty AI response:", {
          choices: aiResponse.choices,
          finishReason: aiResponse.choices[0]?.finish_reason,
          message: aiResponse.choices[0]?.message,
        });
      }
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


