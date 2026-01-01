export default function ScoreCard({
  title,
  value,
  subtitle,
}: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
