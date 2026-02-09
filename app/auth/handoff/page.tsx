"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleAuthHandoff } from "@/app/actions/auth/handoff";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthHandoffPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        // Extract tokens from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Call server action to set session
          const result = await handleAuthHandoff(accessToken, refreshToken);

          if (result?.error) {
            setError(result.error);
            setIsLoading(false);
          }
          // Success case: handleAuthHandoff redirects automatically
        } else {
          // No tokens in hash, check if user already has a session
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
          );
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            router.push("/dashboard");
          } else {
            setError("No authentication tokens found");
            setIsLoading(false);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
        setIsLoading(false);
      }
    };

    handleAuthentication();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="text-gray-600">
          {isLoading ? "Authenticating..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
