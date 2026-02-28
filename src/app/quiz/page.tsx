import Link from "next/link";

export default function QuizPage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">← 홈</Link>
        <h1 className="mt-4 text-2xl font-extrabold">퀴즈풀기</h1>
        <p className="mt-2 text-slate-700">10문제로 가볍게 연습해요.</p>

        <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">문제</div>
          <div className="mt-2 text-4xl font-extrabold">3 × 4 = ?</div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[10, 11, 12, 13].map((v) => (
              <button
                key={v}
                className="h-16 rounded-2xl bg-emerald-50 text-2xl font-extrabold ring-1 ring-emerald-200 active:scale-[0.99]"
              >
                {v}
              </button>
            ))}
          </div>

          <div className="mt-6 text-sm text-slate-600">(다음 단계에서 실제 출제/채점/피드백)</div>
        </div>
      </div>
    </main>
  );
}
