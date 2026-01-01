"use client";

import { useState } from "react";
import type { ResumeParseResponse } from "../../lib/types";
import { apiPostForm } from "../../lib/api";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ResumeParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);
    if (!file) return;
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const json = await apiPostForm<ResumeParseResponse>("/resume/parse", form);
      setData(json);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Resume Parsing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Parsing…" : "Upload & Parse"}
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {data && (
        <div className="border rounded p-4 bg-white space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Resume ID:</span> {data.resume_id}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Experience (estimated):</span> {data.experience_years} years
          </div>
          <div className="text-sm font-semibold">Extracted Skills</div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span key={s} className="px-2 py-1 rounded bg-gray-100 text-xs">{s}</span>
            ))}
          </div>
          <div className="text-xs text-gray-500">Use this Resume ID on the Match page.</div>
        </div>
      )}
    </main>
  );
}
