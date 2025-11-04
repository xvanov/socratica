import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/openai/client";

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
          `Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`
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
      }
      // TODO: Log to Firebase Analytics in production
      
      return NextResponse.json(
        {
          error:
            "Unable to read image. Please try a clearer photo or use text input.",
        },
        { status: 500 }
      );
    }

    // Check if OCR failed
    if (ocrResult.error) {
      // Handle specific error cases
      if (ocrResult.error.includes("Rate limit")) {
        return NextResponse.json(
          {
            error:
              "Rate limit exceeded. Please try again in a moment.",
            retry: true,
          },
          { status: 429 }
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



