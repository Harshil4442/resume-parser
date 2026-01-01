"use client";

import Link from "next/link";
import { useState } from "react";
import { register } from "../../lib/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);

    try {
      await register(email, password);
      setOk(true);
    } catch (err: any) {
      setError(err?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Create account</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password (min 6 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          disabled={loading}
          className="w-full px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>

      {ok && (
        <div className="text-sm text-green-700">
          Account created. <Link className="underline" href="/login">Log in</Link>
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="text-sm">
        Already have an account? <Link className="underline" href="/login">Log in</Link>
      </div>
    </main>
  );
}
