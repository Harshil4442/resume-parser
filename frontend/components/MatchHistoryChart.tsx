import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


export default function MatchHistoryChart({
  data,
}: { data: { timestamp: string; match_score: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    day: new Date(d.timestamp).toLocaleDateString(),
  }));

  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="text-sm font-semibold mb-3">Match Score Trend</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="match_score" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
