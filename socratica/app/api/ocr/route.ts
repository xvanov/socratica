import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/openai/client";
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
 * For rate limit errors (429), uses longer delays to respect API limits
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
      
      // For rate limit errors, use longer delays (5s, 10s, 20s)
      // For other errors, use exponential backoff (1s, 2s, 4s)
      let delay: number;
      if (error instanceof OpenAI.APIError && error.status === 429) {
        // Rate limit errors need longer delays
        delay = 5000 * Math.pow(2, attempt - 1); // 5s, 10s, 20s
      } else {
        // Standard exponential backoff for other errors
        delay = initialDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      }
      
      // Log retry attempt (dev only)
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Retry attempt ${attempt}/${maxAttempts} after ${delay}ms (${error instanceof OpenAI.APIError && error.status === 429 ? 'rate limit' : 'other error'})`
        );
      }
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * POST /api/ocr
 * Extract text from uploaded image using OpenAI Vision API
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File size exceeds the maximum limit of 10MB." },
        { status: 400 }
      );
    }

    // Extract text with retry logic
    let ocrResult;
    try {
      ocrResult = await retryWithBackoff(() => extractTextFromImage(imageFile));
    } catch (error) {
      // Log error (dev only, or Firebase Analytics in prod)
      if (process.env.NODE_ENV === "development") {
        console.error("OCR API error after retries:", error);
        if (error instanceof OpenAI.APIError) {
          console.error("OpenAI API Error details:", {
            status: error.status,
            message: error.message,
            code: error.code,
            type: error.type,
          });
        }
      }
      // TODO: Log to Firebase Analytics in production
      
      // Handle OpenAI API errors after retries exhausted
      if (error instanceof OpenAI.APIError) {
        // Rate limit error (429) - retries exhausted
        if (error.status === 429) {
          return NextResponse.json(
            {
              error:
                "Rate limit exceeded. Please wait a moment and try again. If this persists, check your OpenAI API key rate limits.",
              retry: true,
            },
            { status: 429 }
          );
        }

        // Other API errors
        return NextResponse.json(
          {
            error:
              "Unable to read image. Please try a clearer photo or use text input.",
          },
          { status: 400 }
        );
      }

      // Network or other errors
      return NextResponse.json(
        {
          error:
            "Unable to read image. Please try a clearer photo or use text input.",
        },
        { status: 500 }
      );
    }

    // Check if OCR failed (non-thrown errors)
    if (ocrResult.error) {
      // Handle specific error cases
      if (ocrResult.error.includes("quota exceeded")) {
        return NextResponse.json(
          {
            error:
              "OpenAI API quota exceeded. Please check your OpenAI account billing and add credits. If you're using a different API key locally, make sure it has available credits.",
            retry: false, // Don't retry quota errors
          },
          { status: 402 } // 402 Payment Required is more appropriate
        );
      }
      
      if (ocrResult.error.includes("No text could be extracted")) {
        return NextResponse.json(
          {
            error:
              "Unable to read image. Please try a clearer photo or use text input.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to read image. Please try a clearer photo or use text input.",
        },
        { status: 400 }
      );
    }

    // Return extracted text
    return NextResponse.json({
      text: ocrResult.text,
    });
  } catch (error: unknown) {
    // Log error (dev only, or Firebase Analytics in prod)
    if (process.env.NODE_ENV === "development") {
      console.error("OCR API route error:", error);
    }
    // TODO: Log to Firebase Analytics in production

    // Handle network timeout errors
    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        {
          error: "Request timed out. Please try again.",
          retry: true,
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred. Please try again or use text input.",
      },
      { status: 500 }
    );
  }
}




