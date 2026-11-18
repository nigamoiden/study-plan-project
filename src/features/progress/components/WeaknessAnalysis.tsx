export default function WeaknessAnalysis({ weakSubjects }: { weakSubjects: string[] }) {
  return (
    <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-bold text-amber-900">Kỹ năng cần cải thiện</h2>
      {weakSubjects.length === 0 ? (
        <p className="mt-2 text-sm text-amber-800">Chưa phát hiện môn học yếu nổi bật.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {weakSubjects.map((subject) => (
            <span key={subject} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-amber-800">{subject}</span>
          ))}
        </div>
      )}
    </article>
  );
}