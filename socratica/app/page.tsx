"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ImageUpload from "@/components/problem-input/ImageUpload";
import ChatInterface from "@/components/chat/ChatInterface";
import Navigation from "@/components/ui/Navigation";
import { NetworkStatusIndicator } from "@/components/ui/NetworkStatusIndicator";
import FeatureInstructions from "@/components/ui/FeatureInstructions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  
  // Get session to resume from URL query params
  const sessionToResume = searchParams?.get("resume") || null;

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    // OCR will be triggered automatically by ImageUpload component
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setExtractedText("");
    setOcrError(null);
  };

  const handleOCRComplete = (text: string) => {
    setExtractedText(text);
    setOcrError(null);
  };

  const handleOCRError = (error: string) => {
    setOcrError(error);
    // Extracted text is cleared on error
    setExtractedText("");
  };

  const handleOcrTextChange = (text: string) => {
    setExtractedText(text);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] font-sans dark:bg-[var(--background)] overflow-x-hidden">
      <NetworkStatusIndicator />
      <div className="flex flex-col w-full min-h-screen">
        <Navigation />
        <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col py-8 px-4 bg-[var(--surface-elevated)] dark:bg-[var(--background)] sm:px-8 sm:py-16 overflow-x-hidden">
          <div className="w-full space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                Socratica
              </h1>
              <p className="text-lg leading-8 text-[var(--neutral-600)]">
                Your AI math tutor. Share your problem and get step-by-step guidance.
              </p>
            </div>
            <div className="w-full space-y-6">
              <div className="w-full">
                <ChatInterface
                  ocrText={extractedText}
                  onOcrTextChange={handleOcrTextChange}
                  problemText={extractedText}
                  sessionToResume={sessionToResume || undefined}
                />
                <FeatureInstructions
                  title="How to use the chat interface"
                  instructions={[
                    "Type your math problem or question in the text field",
                    "Press Enter to send your message (Shift+Enter for a new line)",
                    "The AI tutor will respond with step-by-step guidance",
                    "Use the 'New Problem' button to start a fresh conversation",
                  ]}
                  className="mt-4"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[var(--surface-elevated)] px-2 text-[var(--neutral-500)] dark:bg-[var(--background)]">
                    or upload an image
                  </span>
                </div>
              </div>
              <div className="w-full">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  onOCRComplete={handleOCRComplete}
                  onOCRError={handleOCRError}
                  maxSizeMB={10}
                />
                <FeatureInstructions
                  title="How to upload an image"
                  instructions={[
                    "Click the 'Upload Image' button or drag and drop an image",
                    "Supported formats: JPG, PNG, WebP (max 10MB)",
                    "Make sure your math problem is clearly visible in the photo",
                    "The app will automatically extract text from your image",
                  ]}
                  className="mt-4"
                />
                {/* Fallback option to switch to text input if OCR fails */}
                {ocrError && (
                  <div className="mt-3 rounded-lg border border-[var(--accent-feedback-400)] bg-[var(--accent-feedback-50)] p-3 dark:bg-[var(--accent-feedback-900)]/20">
                    <p className="text-sm text-[var(--accent-feedback-800)] dark:text-[var(--accent-feedback-200)]">
                      OCR failed. You can type your problem directly in the chat interface above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
