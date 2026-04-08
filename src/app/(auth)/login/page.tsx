"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, TextInput, Button, Title, Text, Divider } from "@tremor/react";
import { RiGoogleFill } from "@remixicon/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-tremor-background-muted">
      <div className="mx-4 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <Title>CoBuilders</Title>
          <Text className="mt-1">Validate your startup idea with AI</Text>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Text className="mb-1">Email</Text>
              <TextInput
                type="email"
                value={email}
                onValueChange={setEmail}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Text className="mb-1">Password</Text>
              <TextInput
                type="password"
                value={password}
                onValueChange={setPassword}
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <Divider>or</Divider>

          <Button
            variant="secondary"
            className="w-full"
            icon={RiGoogleFill}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>

          <Text className="mt-4 text-center">
            No account?{" "}
            <Link href="/signup" className="text-tremor-brand hover:underline">
              Sign up
            </Link>
          </Text>
        </Card>
      </div>
    </div>
  );
}
