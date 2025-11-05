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
3. Keep equations on single lines - do not break equations across multiple lines
4. If an equation appears on multiple lines visually, join it into a single line (e.g., "2x = 6" not "2\\nx\\n=\\n6")
5. If the image contains math equations, extract them as LaTeX where possible
6. Maintain structure between different problems/questions (use line breaks between problems, not within equations)
7. Return only the extracted text as plain text - do NOT use markdown formatting, code blocks, or triple backticks
8. Do not include any markdown code fences or formatting symbols`;

export interface OCRResponse {
  text: string;
  error?: string;
}

/**
 * Cleans OCR output by removing markdown code blocks and other formatting artifacts.
 * 
 * OCR models sometimes wrap output in markdown code blocks (triple backticks).
 * This function removes those artifacts.
 * 
 * @param text - Raw OCR text that may contain markdown formatting
 * @returns Cleaned text without markdown formatting
 */
function cleanOCRText(text: string): string {
  if (!text) return text;
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks (``` at start and end)
  // Matches: ```\n...\n``` or ```...``` on same line
  cleaned = cleaned.replace(/^```[\w]*\n?/gm, ''); // Opening ```
  cleaned = cleaned.replace(/\n?```$/gm, ''); // Closing ```
  cleaned = cleaned.replace(/```[\w]*$/gm, ''); // Closing ``` at end of line
  
  // Remove any remaining isolated triple backticks
  cleaned = cleaned.replace(/```/g, '');
  
  // Clean up excessive whitespace that might result
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  cleaned = cleaned.trim();
  
  return cleaned;
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
    const rawText =
      response.choices[0]?.message?.content?.trim() || "";

    if (!rawText) {
      return {
        text: "",
        error: "No text could be extracted from the image.",
      };
    }

    // Clean markdown formatting artifacts from OCR output
    const cleanedText = cleanOCRText(rawText);

    return {
      text: cleanedText,
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




