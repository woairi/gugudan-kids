import Link from "next/link";

export default function ResultPage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">← 홈</Link>
        <h1 className="mt-4 text-2xl font-extrabold">결과</h1>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl font-extrabold">8/10</div>
          <div className="mt-1 text-slate-700">정답률 80%</div>
          <div className="mt-4 text-sm text-slate-600">(다음 단계에서 기록 저장/오답 복습)</div>
        </div>
      </div>
    </main>
  );
}
