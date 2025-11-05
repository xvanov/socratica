"use client";

/**
 * Help Page
 * Provides user guidance, FAQs, and troubleshooting information
 */

export default function Help() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Help & Support
          </h1>
          <p className="text-lg text-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
            Get the most out of Socratica with these guides and tips
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Getting Started
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  Sign In
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)] mb-2">
                  To save your sessions and access your history across devices:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)] ml-2">
                  <li>Click "Sign In" in the navigation bar</li>
                  <li>Choose to sign in with Google</li>
                  <li>Grant permissions when prompted</li>
                </ol>
              </div>

              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  Submitting a Problem
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)] mb-2">
                  You can submit problems in two ways:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)] ml-2">
                  <li><strong className="text-black dark:text-white">Type directly:</strong> Enter your math problem in the chat input field</li>
                  <li><strong className="text-black dark:text-white">Upload an image:</strong> Click "Upload Image" or drag and drop a photo of your problem</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  How does the tutor work?
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  The tutor uses the Socratic method—it asks questions to guide your thinking rather than giving direct answers. 
                  It adapts to your responses, providing more hints when you're stuck and challenging you appropriately.
                </p>
              </div>

              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  Can I save my progress?
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  Yes! When signed in, your sessions are automatically saved. You can access them anytime from the 
                  "Session History" page and resume where you left off.
                </p>
              </div>

              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  What image formats are supported?
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  We support JPG, PNG, and WebP formats. Images should be under 10MB and clearly show your math problem.
                </p>
              </div>

              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  What if I get an error message?
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  Most errors are temporary. Try refreshing the page or waiting a moment and retrying. If you see a 
                  "rate limit" error, wait a few minutes before trying again. If problems persist, check your internet 
                  connection.
                </p>
              </div>

              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  Can I use Socratica without signing in?
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  You can use the chat interface without signing in, but your sessions won't be saved. To save your 
                  progress and access it later, please sign in with Google.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Troubleshooting
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--accent-feedback-50)] dark:bg-[var(--accent-feedback-900)]/20 p-4 rounded-lg border border-[var(--accent-feedback-300)] dark:border-[var(--accent-feedback-700)]">
                <h3 className="font-semibold mb-2 text-[var(--accent-feedback-800)] dark:text-[var(--accent-feedback-200)]">
                  Image upload fails
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--accent-feedback-700)] dark:text-[var(--accent-feedback-300)] ml-2">
                  <li>Check that your image is under 10MB</li>
                  <li>Ensure the image format is JPG, PNG, or WebP</li>
                  <li>Make sure the math problem is clearly visible</li>
                  <li>Try typing the problem directly if OCR fails</li>
                </ul>
              </div>

              <div className="bg-[var(--accent-feedback-50)] dark:bg-[var(--accent-feedback-900)]/20 p-4 rounded-lg border border-[var(--accent-feedback-300)] dark:border-[var(--accent-feedback-700)]">
                <h3 className="font-semibold mb-2 text-[var(--accent-feedback-800)] dark:text-[var(--accent-feedback-200)]">
                  Session history not loading
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--accent-feedback-700)] dark:text-[var(--accent-feedback-300)] ml-2">
                  <li>Make sure you're signed in</li>
                  <li>Wait a few minutes if you see "index building" - this is normal on first use</li>
                  <li>Refresh the page and try again</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>

              <div className="bg-[var(--accent-feedback-50)] dark:bg-[var(--accent-feedback-900)]/20 p-4 rounded-lg border border-[var(--accent-feedback-300)] dark:border-[var(--accent-feedback-700)]">
                <h3 className="font-semibold mb-2 text-[var(--accent-feedback-800)] dark:text-[var(--accent-feedback-200)]">
                  Tutor not responding
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--accent-feedback-700)] dark:text-[var(--accent-feedback-300)] ml-2">
                  <li>Check for error messages in the chat</li>
                  <li>If you see "rate limit" error, wait a few minutes</li>
                  <li>Try refreshing the page</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--border)] pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Tips for Best Results
            </h2>
            <ul className="space-y-3 list-disc list-inside text-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
              <li>
                <strong className="text-black dark:text-white">Be specific:</strong>{" "}
                Clearly state what you're trying to solve or where you're stuck
              </li>
              <li>
                <strong className="text-black dark:text-white">Show your work:</strong>{" "}
                Share what you've tried so far—the tutor can build on your efforts
              </li>
              <li>
                <strong className="text-black dark:text-white">Take your time:</strong>{" "}
                Think through the tutor's questions before responding—learning takes time
              </li>
              <li>
                <strong className="text-black dark:text-white">Use clear images:</strong>{" "}
                If uploading a photo, ensure good lighting and focus so the text is readable
              </li>
              <li>
                <strong className="text-black dark:text-white">Save your sessions:</strong>{" "}
                Sign in to save your progress and return to problems later
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
