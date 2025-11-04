"use client";

import { useState } from "react";
import ImageUpload from "@/components/problem-input/ImageUpload";
import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string | null>(null);

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col py-8 px-4 bg-white dark:bg-black sm:px-8 sm:py-16">
        <div className="w-full space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
              Socratica
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Your AI math tutor. Share your problem and get step-by-step guidance.
            </p>
          </div>
          <div className="w-full space-y-6">
            <div className="w-full">
              <ChatInterface
                ocrText={extractedText}
                onOcrTextChange={handleOcrTextChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-zinc-500 dark:bg-black dark:text-zinc-400">
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
              {/* Fallback option to switch to text input if OCR fails */}
              {ocrError && (
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    OCR failed. You can type your problem directly in the chat interface above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
