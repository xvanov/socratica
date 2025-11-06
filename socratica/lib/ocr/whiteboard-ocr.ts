/**
 * OCR utilities for whiteboard images
 * Uses OpenAI Vision API to extract text from whiteboard captures
 */

export interface OCRResult {
  text: string;
  error?: string;
}

/**
 * Extract text from whiteboard image using OCR API
 * @param imageDataURL - Base64 data URL of the whiteboard image (format: data:image/png;base64,...)
 * @returns OCR result with extracted text
 */
export async function extractTextFromWhiteboard(
  imageDataURL: string
): Promise<OCRResult> {
  try {
    // Convert data URL to blob
    // Data URL format: data:image/png;base64,<base64-data>
    const response = await fetch(imageDataURL);
    const blob = await response.blob();
    
    // Create FormData for OCR API
    const formData = new FormData();
    formData.append("image", blob, "whiteboard.png");
    
    // Call OCR API
    const ocrResponse = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });
    
    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json().catch(() => ({ error: "Unknown error" }));
      return {
        text: "",
        error: errorData.error || `OCR API error: ${ocrResponse.status}`,
      };
    }
    
    const ocrData = await ocrResponse.json();
    
    return {
      text: ocrData.text || "",
      error: ocrData.error,
    };
  } catch (error) {
    console.error("Failed to extract text from whiteboard:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

