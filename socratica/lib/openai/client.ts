import OpenAI from "openai";

// Initialize OpenAI client with API key from environment variables
// Server-side only - API key should NOT have NEXT_PUBLIC_ prefix
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY is not set. Please add it to your .env.local file."
  );
}

// Debug logging (dev only) - remove after debugging
if (process.env.NODE_ENV === "development") {
  console.log("OpenAI API Key loaded:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4));
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

// OCR prompt for math problem extraction
const OCR_PROMPT = `Extract the text from this image. This is a math problem, so please:
1. Extract all text exactly as it appears
2. Preserve mathematical notation (operators, symbols, equations)
3. Maintain the structure and formatting
4. If the image contains only math equations, extract them as LaTeX where possible
5. Return only the extracted text, no additional commentary`;

export interface OCRResponse {
  text: string;
  error?: string;
}

/**
 * Extract text from an image using OpenAI Vision API
 * @param imageFile - The image file to extract text from
 * @returns Promise<OCRResponse> - The extracted text or error message
 */
export async function extractTextFromImage(
  imageFile: File | Buffer
): Promise<OCRResponse> {
  try {
    // Convert File to base64 if needed
    let imageBase64: string;
    if (imageFile instanceof File) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = buffer.toString("base64");
    } else {
      imageBase64 = imageFile.toString("base64");
    }

    // Determine MIME type
    let mimeType = "image/jpeg";
    if (imageFile instanceof File) {
      mimeType = imageFile.type;
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o (latest model with vision support)
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: OCR_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Extract text from response
    const extractedText =
      response.choices[0]?.message?.content?.trim() || "";

    if (!extractedText) {
      return {
        text: "",
        error: "No text could be extracted from the image.",
      };
    }

    return {
      text: extractedText,
    };
  } catch (error: unknown) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      // Quota exceeded errors - don't retry, return immediately
      // This is different from rate limits - quota means no credits/money left
      if (error.status === 429 && error.code === 'insufficient_quota') {
        return {
          text: "",
          error: "OpenAI API quota exceeded. Please check your OpenAI account billing and add credits.",
        };
      }
      
      // Rate limit errors should be thrown so retry logic can handle them
      if (error.status === 429) {
        // Log rate limit details for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("OpenAI rate limit error:", {
            status: error.status,
            message: error.message,
            code: error.code,
            type: error.type,
          });
        }
        throw error; // Let retry logic handle rate limit errors
      }

      // Invalid image or other API errors - return as error response
      return {
        text: "",
        error: error.message || "Failed to extract text from image.",
      };
    }

    // Network errors - throw so retry logic can handle them
    if (error instanceof Error) {
      // Re-throw network errors for retry logic
      throw error;
    }

    // Unknown errors - return as error response
    return {
      text: "",
      error: "An unexpected error occurred. Please try again.",
    };
  }
}




