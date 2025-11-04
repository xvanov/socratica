import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";
import { SOCRATIC_MATH_TUTOR_PROMPT } from "@/lib/openai/prompts";
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
 * Convert Message[] from chat format to OpenAI API format
 * student -> user, tutor -> assistant
 */
function convertMessagesToOpenAIFormat(
  messages: Message[],
  currentMessage: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SOCRATIC_MATH_TUTOR_PROMPT,
    },
  ];

  // Convert conversation history
  for (const message of messages) {
    openAIMessages.push({
      role: message.role === "student" ? "user" : "assistant",
      content: message.content,
    });
  }

  // Add current message
  openAIMessages.push({
    role: "user",
    content: currentMessage,
  });

  return openAIMessages;
}

/**
 * POST /api/chat
 * Send message to OpenAI GPT-4 Turbo and get AI tutor response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [], userId } = body;

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

    // Convert messages to OpenAI format
    const openAIMessages = convertMessagesToOpenAIFormat(
      conversationHistory,
      message
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
        if (error.status === 400 && error.message?.includes("context")) {
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

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        message: aiMessage,
        messageId,
        timestamp,
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

