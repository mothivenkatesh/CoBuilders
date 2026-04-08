"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, TextInput, Button, Title, Text } from "@tremor/react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
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
          <Text className="mt-1">Start validating your idea</Text>
        </div>

        <Card>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Text className="mb-1">Full Name</Text>
              <TextInput
                value={fullName}
                onValueChange={setFullName}
                placeholder="Your name"
              />
            </div>
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
                placeholder="Min 6 characters"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <Text className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-tremor-brand hover:underline">
              Sign in
            </Link>
          </Text>
        </Card>
      </div>
    </div>
  );
}
