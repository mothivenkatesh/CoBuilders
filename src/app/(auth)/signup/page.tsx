"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-4 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">AI Cofounder</h1>
          <p className="mt-2 text-zinc-500">Start validating your idea</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-100">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
