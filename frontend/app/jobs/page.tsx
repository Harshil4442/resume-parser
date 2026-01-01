"use client";

import { useState } from "react";
import { apiPostJson } from "../../lib/api";

type MatchResult = {
  match_id: number;
  match_score: number;
  required_skills: string[];
  missing_skills: string[];
};

export default function JobsPage() {
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        resume_id: Number(resumeId),
        job_title: jobTitle,
        company,
        job_description: jd,
      };
      const data = await apiPostJson<MatchResult>("/jobs/match", payload);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Job Match</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Resume ID"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <textarea
          className="border rounded px-3 py-2 text-sm w-full min-h-[180px]"
          placeholder="Paste job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Matching…" : "Compute Match"}
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {result && (
        <div className="border rounded p-4 bg-white space-y-3">
          <div className="text-sm">
            <span className="font-semibold">Match Score:</span> {(result.match_score * 100).toFixed(0)}%
          </div>

          <div className="text-sm font-semibold">Required skills detected</div>
          <div className="flex flex-wrap gap-2">
            {result.required_skills.map((s) => (
              <span key={s} className="px-2 py-1 rounded bg-gray-100 text-xs">{s}</span>
            ))}
          </div>

          <div className="text-sm font-semibold">Missing skills</div>
          <div className="flex flex-wrap gap-2">
            {result.missing_skills.map((s) => (
              <span key={s} className="px-2 py-1 rounded bg-yellow-50 text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
