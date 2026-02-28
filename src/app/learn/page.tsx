import Link from "next/link";

export default function LearnPage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">← 홈</Link>
        <h1 className="mt-4 text-2xl font-extrabold">학습하기</h1>
        <p className="mt-2 text-slate-700">단을 골라서 표를 보여줄게요.</p>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i).map((dan) => (
            <button
              key={dan}
              className="h-12 rounded-2xl bg-white font-bold shadow-sm ring-1 ring-slate-200"
              aria-label={`${dan}단`}
            >
              {dan}단
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">선택한 단</div>
          <div className="mt-1 text-lg font-bold">(아직 선택 전)</div>
          <div className="mt-3 text-sm text-slate-600">다음 단계에서 표/카드를 여기에 표시</div>
        </div>
      </div>
    </main>
  );
}
