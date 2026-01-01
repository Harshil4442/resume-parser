export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">AI-Powered Career & Resume CoPilot</h1>
      <p className="text-sm text-gray-600">
        Upload a resume, paste a job description, see match score + skill gaps, get learning recommendations,
        and generate tailored resume rewrites and interview questions.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a className="border rounded p-4 bg-white hover:shadow" href="/resume">Resume Parsing</a>
        <a className="border rounded p-4 bg-white hover:shadow" href="/jobs">Job Matching</a>
        <a className="border rounded p-4 bg-white hover:shadow" href="/learning">Learning Path</a>
        <a className="border rounded p-4 bg-white hover:shadow" href="/dashboard">Analytics</a>
      </div>
    </main>
  );
}
