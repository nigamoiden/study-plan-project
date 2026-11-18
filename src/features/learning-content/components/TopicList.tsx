export default function TopicList({ topics }: { topics: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <span key={topic} className="rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700">{topic}</span>
      ))}
    </div>
  );
}