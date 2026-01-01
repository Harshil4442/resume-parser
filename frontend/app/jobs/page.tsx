"use client";

import { useMemo, useState } from "react";
import { apiPostJson } from "../../lib/api";

type MatchResponse = {
  match_id: number;
  match_score: number;
  required_skills: string[];
  missing_skills: string[];
};

export default function JobsPage() {
  const [resumeId, setResumeId] = useState("1");
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [company, setCompany] = useState("Company");
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return resumeId.trim() && jobTitle.trim() && jobDescription.trim();
  }, [resumeId, jobTitle, jobDescription]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const payload = {
        resume_id: Number(resumeId),
        job_title: jobTitle,
        company,
        job_description: jobDescription, // IMPORTANT: string
      };
      const res = await apiPostJson<MatchResponse>("/jobs/match", payload);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Match failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Job Match</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Resume ID"
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[180px]"
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <button
          disabled={!canSubmit || loading}
          className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Matching…" : "Match"}
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {data && (
        <div className="border rounded p-4 bg-white space-y-3">
          <div className="text-sm">
            <span className="font-semibold">Match score:</span>{" "}
            {Number.isFinite(data.match_score) ? `${data.match_score.toFixed(1)} / 100` : "—"}
          </div>

          <div className="text-sm font-semibold">Required skills</div>
          <div className="flex flex-wrap gap-2">
            {data.required_skills.map((s) => (
              <span key={s} className="px-2 py-1 rounded bg-gray-100 text-xs">
                {s}
              </span>
            ))}
          </div>

          <div className="text-sm font-semibold">Missing skills</div>
          <div className="flex flex-wrap gap-2">
            {data.missing_skills.map((s) => (
              <span key={s} className="px-2 py-1 rounded bg-red-50 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}