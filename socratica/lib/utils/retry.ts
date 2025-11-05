/**
 * Retry utilities for handling retry logic with exponential backoff
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 8000, // 8 seconds
  backoffMultiplier: 2,
};

/**
 * Calculates delay for retry attempt using exponential backoff
 * @param attemptNumber - Current attempt number (1-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber - 1),
    config.maxDelayMs
  );
  return delay;
}

/**
 * Waits for the specified delay
 * @param delayMs - Delay in milliseconds
 */
export function waitForRetry(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Formats retry attempt message for display
 * @param attemptNumber - Current attempt number (1-indexed)
 * @param maxAttempts - Maximum number of attempts
 * @returns Formatted retry message
 */
export function formatRetryMessage(
  attemptNumber: number,
  maxAttempts: number
): string {
  if (attemptNumber >= maxAttempts) {
    return `Final attempt (${maxAttempts} of ${maxAttempts})`;
  }
  return `Retrying... (attempt ${attemptNumber} of ${maxAttempts})`;
}

/**
 * Checks if an error is retryable
 * @param error - The error to check
 * @returns True if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Network errors are generally retryable
    if (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("fetch")
    ) {
      return true;
    }
    // 5xx server errors are retryable
    if (
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504")
    ) {
      return true;
    }
    // Rate limit errors are retryable
    if (message.includes("429") || message.includes("rate limit")) {
      return true;
    }
  }
  return false;
}

/**
 * Executes a function with retry logic
 * @param fn - Function to execute
 * @param config - Retry configuration
 * @param onRetryAttempt - Optional callback for retry attempts
 * @returns Result of function execution
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetryAttempt?: (attempt: number, maxAttempts: number) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If this is the last attempt, throw the error
      if (attempt >= config.maxAttempts) {
        throw error;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Notify about retry attempt
      if (onRetryAttempt) {
        onRetryAttempt(attempt + 1, config.maxAttempts);
      }

      // Calculate delay and wait
      const delay = calculateRetryDelay(attempt, config);
      await waitForRetry(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}


