"use client";

import { useRouter } from "next/navigation";
import SessionHistory from "@/components/sessions/SessionHistory";
import Navigation from "@/components/ui/Navigation";
import { Session } from "@/types/session";

/**
 * Sessions page - Displays session history and allows resuming sessions
 */
export default function SessionsPage() {
  const router = useRouter();

  const handleResumeSession = (session: Session) => {
    // Navigate to home page with resume query parameter
    router.push(`/?resume=${session.sessionId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] font-sans dark:bg-[var(--background)] overflow-x-hidden">
      <div className="flex flex-col w-full min-h-screen">
        <Navigation />
        <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col py-8 px-4 bg-[var(--surface-elevated)] dark:bg-[var(--background)] sm:px-8 sm:py-16 overflow-x-hidden">
          <div className="w-full space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                Session History
              </h1>
              <p className="text-lg leading-8 text-[var(--neutral-600)]">
                View and resume your previous problem-solving sessions.
              </p>
            </div>
            <div className="w-full">
              <SessionHistory onResumeSession={handleResumeSession} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

