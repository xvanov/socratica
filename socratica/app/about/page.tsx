"use client";

/**
 * About Page
 * Provides information about Socratica, its mission, and features
 */

export default function About() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            About Socratica
          </h1>
          <p className="text-lg text-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
            Your AI-powered math tutor for personalized learning
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Our Mission
            </h2>
            <p className="text-[var(--neutral-800)] dark:text-[var(--neutral-200)] leading-relaxed">
              Socratica is designed to help students learn mathematics through the Socratic method—asking questions 
              that guide thinking rather than providing direct answers. Our AI tutor adapts to your learning pace, 
              identifies when you're stuck, and provides personalized guidance to help you understand concepts deeply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Key Features
            </h2>
            <ul className="space-y-3 list-disc list-inside text-[var(--neutral-800)] dark:text-[var(--neutral-200)]">
              <li>
                <strong className="text-black dark:text-white">Socratic Questioning:</strong>{" "}
                Learn through guided questions that build understanding step by step
              </li>
              <li>
                <strong className="text-black dark:text-white">Adaptive Learning:</strong>{" "}
                The tutor adjusts to your level and provides appropriate hints based on your progress
              </li>
              <li>
                <strong className="text-black dark:text-white">Problem Analysis:</strong>{" "}
                Upload images of math problems or type them directly—we support both
              </li>
              <li>
                <strong className="text-black dark:text-white">Session History:</strong>{" "}
                Save and resume your learning sessions anytime, across devices
              </li>
              <li>
                <strong className="text-black dark:text-white">Stuck Detection:</strong>{" "}
                Our system recognizes when you're struggling and provides targeted help
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  1. Share Your Problem
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  Type your math problem or upload an image. Our OCR technology extracts the text automatically.
                </p>
              </div>
              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  2. Get Guided Questions
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  The AI tutor asks questions to help you think through the problem, rather than giving you the answer.
                </p>
              </div>
              <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold mb-2 text-black dark:text-white">
                  3. Learn at Your Pace
                </h3>
                <p className="text-sm text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                  The tutor adapts to your responses, providing more hints when you're stuck and challenging you when you're ready.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Technology
            </h2>
            <p className="text-[var(--neutral-800)] dark:text-[var(--neutral-200)] leading-relaxed">
              Socratica is built with modern web technologies including Next.js, React, Firebase, and OpenAI's GPT-4. 
              We use advanced AI models to understand your questions, provide personalized guidance, and detect when you 
              need additional support.
            </p>
          </section>

          <section className="border-t border-[var(--border)] pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              Privacy & Security
            </h2>
            <p className="text-[var(--neutral-800)] dark:text-[var(--neutral-200)] leading-relaxed">
              Your data is securely stored and encrypted. We use Firebase Authentication for secure sign-in and 
              Firestore for data storage. Your sessions and profile information are private and only accessible to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
