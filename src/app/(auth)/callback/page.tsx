"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Handle the OAuth code exchange on the client side (fallback)
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.push("/login?error=auth");
          return;
        }
      }

      // Also handle hash fragment (implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      if (accessToken) {
        // Supabase client auto-detects hash params, just wait a tick
        await new Promise((r) => setTimeout(r, 500));
      }

      router.push("/dashboard");
      router.refresh();
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
      <p className="ml-3 text-sm text-zinc-500">Signing you in...</p>
    </div>
  );
}
