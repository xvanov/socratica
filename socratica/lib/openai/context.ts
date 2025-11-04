/**
 * Conversation context management utilities
 * Handles conversion of Message[] to OpenAI API format and context window management
 */

import { Message } from "@/types/chat";
import OpenAI from "openai";
import { SOCRATIC_MATH_TUTOR_PROMPT } from "./prompts";

/**
 * Maximum context window size in tokens for GPT-4 Turbo
 * GPT-4 Turbo supports up to 128K tokens, but we'll use a conservative limit
 * to leave room for system prompt and response generation
 */
export const MAX_CONTEXT_WINDOW_TOKENS = 4096;

/**
 * Approximate token count calculation
 * OpenAI uses ~4 characters per token as a rough estimate
 */
const CHARS_PER_TOKEN = 4;

/**
 * Calculate approximate token count for a message
 */
export function calculateMessageTokens(message: string): number {
  return Math.ceil(message.length / CHARS_PER_TOKEN);
}

/**
 * Calculate total token count for an array of OpenAI messages
 */
export function calculateTotalTokens(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): number {
  return messages.reduce((total, message) => {
    const content = typeof message.content === "string" ? message.content : "";
    return total + calculateMessageTokens(content);
  }, 0);
}

/**
 * Convert Message[] from chat format to OpenAI API format
 * Maps: student -> user, tutor -> assistant
 * Includes system prompt as first message
 */
export function convertMessagesToOpenAIFormat(
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
 * Truncate messages to fit within context window
 * Preserves system prompt (always first) and most recent messages
 * Removes oldest messages first if context window is exceeded
 */
export function truncateContextWindow(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  maxTokens: number = MAX_CONTEXT_WINDOW_TOKENS
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  // Always preserve system prompt (first message)
  if (messages.length === 0) {
    return messages;
  }

  const systemPrompt = messages[0];
  const conversationMessages = messages.slice(1);

  // Calculate system prompt tokens
  const systemPromptTokens = calculateMessageTokens(
    typeof systemPrompt.content === "string" ? systemPrompt.content : ""
  );

  // If system prompt alone exceeds limit, return only system prompt
  if (systemPromptTokens >= maxTokens) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Context window truncation: System prompt (${systemPromptTokens} tokens) exceeds limit (${maxTokens} tokens)`
      );
    }
    return [systemPrompt];
  }

  // Available tokens for conversation messages
  const availableTokens = maxTokens - systemPromptTokens;

  // Calculate tokens for each message and build from most recent
  let totalTokens = 0;
  const preservedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    [];

  // Start from most recent messages and work backwards
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const message = conversationMessages[i];
    const messageTokens = calculateMessageTokens(
      typeof message.content === "string" ? message.content : ""
    );

    // If adding this message would exceed limit, stop
    if (totalTokens + messageTokens > availableTokens) {
      break;
    }

    // Add message to preserved list (will reverse later)
    preservedMessages.unshift(message);
    totalTokens += messageTokens;
  }

  // Log truncation if messages were removed (dev only)
  if (
    process.env.NODE_ENV === "development" &&
    preservedMessages.length < conversationMessages.length
  ) {
    console.log(
      `Context window truncation: Removed ${
        conversationMessages.length - preservedMessages.length
      } oldest messages to fit within ${maxTokens} token limit`
    );
  }

  // Return system prompt + preserved conversation messages
  return [systemPrompt, ...preservedMessages];
}

/**
 * Prepare conversation context for OpenAI API
 * Combines conversion and truncation in one function
 */
export function prepareConversationContext(
  messages: Message[],
  currentMessage: string,
  maxTokens: number = MAX_CONTEXT_WINDOW_TOKENS
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  // Convert to OpenAI format
  const openAIMessages = convertMessagesToOpenAIFormat(messages, currentMessage);

  // Truncate if needed
  return truncateContextWindow(openAIMessages, maxTokens);
}

