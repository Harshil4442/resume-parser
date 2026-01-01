"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Login</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60 w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="text-sm">
        New here? <a className="underline" href="/register">Create an account</a>
      </div>
    </main>
  );
}
