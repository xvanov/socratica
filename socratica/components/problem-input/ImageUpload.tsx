"use client";

import { useState, useRef, useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SuccessMessage from "@/components/ui/SuccessMessage";

interface ImageUploadProps {
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  onOCRComplete?: (extractedText: string) => void; // Callback when OCR completes
  onOCRError?: (error: string) => void; // Callback when OCR fails
  maxSizeMB?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  onOCRComplete,
  onOCRError,
  maxSizeMB = 10,
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL on unmount or when image is removed
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload a JPG, PNG, or WebP image.`;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds the maximum limit of ${maxSizeMB}MB. Please choose a smaller image.`;
    }

    // Check file extension as additional validation
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_FILE_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return `Invalid file type. Please upload a JPG, PNG, or WebP image.`;
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Clear previous error
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Check if image is corrupted by trying to load it
    try {
      setIsUploading(true);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      
      // Verify image can be loaded (check for corruption)
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image file appears to be corrupted or invalid."));
        };
        img.src = objectUrl;
      });

      // Create new preview URL after validation
      const preview = URL.createObjectURL(file);
      
      setSelectedFile(file);
      setPreviewUrl(preview);
      setIsUploading(false);

      // Call onImageSelect callback if provided
      if (onImageSelect) {
        onImageSelect(file);
      }

      // Start OCR processing
      await performOCR(file);
    } catch (err) {
      setIsUploading(false);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load image. The file may be corrupted.";
      setError(errorMessage);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const performOCR = async (file: File) => {
    try {
      setIsOCRLoading(true);
      setOcrError(null);

      // Create FormData for image upload
      const formData = new FormData();
      formData.append("image", file);

      // Call OCR API
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Failed to extract text from image.",
        }));

        // Handle rate limit errors
        if (response.status === 429) {
          const errorMessage =
            errorData.error ||
            "Rate limit exceeded. Please try again in a moment.";
          setOcrError(errorMessage);
          if (onOCRError) {
            onOCRError(errorMessage);
          }
          return;
        }

        // Handle other errors
        const errorMessage =
          errorData.error ||
          "Unable to read image. Please try a clearer photo or use text input.";
        setOcrError(errorMessage);
        if (onOCRError) {
          onOCRError(errorMessage);
        }
        return;
      }

      const data = await response.json();

      if (data.error) {
        const errorMessage =
          data.error ||
          "Unable to read image. Please try a clearer photo or use text input.";
        setOcrError(errorMessage);
        if (onOCRError) {
          onOCRError(errorMessage);
        }
        return;
      }

      // Success - extracted text received
      if (data.text) {
        // Validate extracted text (handle empty/whitespace-only text)
        const trimmedText = data.text.trim();
        if (trimmedText.length === 0) {
          const errorMessage =
            "Unable to read image. No text was found in the image. Please try a clearer photo or use text input.";
          setOcrError(errorMessage);
          if (onOCRError) {
            onOCRError(errorMessage);
          }
          return;
        }
        // Text is valid, call onOCRComplete
        if (onOCRComplete) {
          onOCRComplete(data.text);
        }
      } else {
        // No text in response
        const errorMessage =
          "Unable to read image. No text was found in the image. Please try a clearer photo or use text input.";
        setOcrError(errorMessage);
        if (onOCRError) {
          onOCRError(errorMessage);
        }
      }
    } catch (err) {
      // Handle network errors
      const errorMessage =
        err instanceof Error
          ? err.message.includes("timeout") || err.message.includes("network")
            ? "Network error. Please check your connection and try again."
            : "Unable to read image. Please try a clearer photo or use text input."
          : "Unable to read image. Please try a clearer photo or use text input.";
      setOcrError(errorMessage);
      if (onOCRError) {
        onOCRError(errorMessage);
      }
    } finally {
      setIsOCRLoading(false);
    }
  };

  const handleRetryOCR = async () => {
    if (selectedFile) {
      setOcrError(null);
      await performOCR(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    // Revoke preview URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset state
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setOcrError(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Call onImageRemove callback if provided
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-3">
      <label htmlFor="image-upload" className="sr-only">
        Upload image of math problem
      </label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="image-upload"
        name="image-upload"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        aria-label="Upload image of math problem"
        aria-describedby="image-upload-description"
      />
      
      <p id="image-upload-description" className="sr-only">
        Upload a screenshot or photo of your math problem. Supported formats: JPG, PNG, WebP. Maximum file size: {maxSizeMB}MB.
      </p>

      {/* Upload button or preview */}
      {!previewUrl && !isUploading && !isOCRLoading && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading || isOCRLoading}
          className="flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-medium text-[var(--neutral-700)] transition-all duration-200 hover:border-[var(--neutral-400)] hover:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--surface)] dark:text-[var(--neutral-300)] dark:hover:border-[var(--neutral-600)] dark:hover:bg-[var(--neutral-800)] dark:focus:ring-[var(--neutral-100)] shadow-sm"
          aria-label="Upload image"
          aria-disabled={isUploading || isOCRLoading}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Upload Image
        </button>
      )}

      {/* Loading state */}
      {(isUploading || isOCRLoading) && (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-opacity duration-200">
          <LoadingSpinner
            size="md"
            label={isOCRLoading ? "Extracting text from image..." : "Processing image..."}
          />
        </div>
      )}

      {/* Image preview */}
      {previewUrl && !isUploading && !isOCRLoading && (
        <div className="relative w-full transition-opacity duration-200">
          <div className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] dark:bg-[var(--surface)] shadow-sm">
            <img
              src={previewUrl}
              alt="Preview of uploaded math problem"
              className="h-auto w-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[var(--neutral-900)]/80 text-white transition-all duration-200 hover:bg-[var(--neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 dark:bg-[var(--neutral-100)]/80 dark:text-[var(--neutral-900)] dark:hover:bg-[var(--neutral-100)] dark:focus:ring-[var(--neutral-100)]"
              aria-label="Remove image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {selectedFile && (
            <p className="mt-2 text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      {/* Success message for successful OCR */}
      {previewUrl && !isUploading && !isOCRLoading && !ocrError && selectedFile && (
        <SuccessMessage
          message="Image uploaded successfully. Text extracted from image."
          duration={3000}
        />
      )}

      {/* Error display */}
      {(error || ocrError) && (
        <div className="transition-opacity duration-200">
          {error && (
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
              retryLabel="Try again"
            />
          )}
          {ocrError && (
            <ErrorMessage
              message={ocrError}
              onRetry={handleRetryOCR}
              retryLabel="Retry OCR"
            />
          )}
        </div>
      )}
    </div>
  );
}

