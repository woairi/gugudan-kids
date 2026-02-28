"use client";

import Link from "next/link";

const KEYS = [
  "gugudan.lastResult.v1",
  "gugudan.recentResults.v1",
  "gugudan.itemStats.v1",
  "gugudan.rewards.v1",
];

export default function ParentsPage() {
  function resetAll() {
    const ok = window.confirm("기록을 모두 지울까? (되돌릴 수 없어요)");
    if (!ok) return;
    try {
      for (const k of KEYS) window.localStorage.removeItem(k);
      window.alert("지웠어! 다시 처음부터 시작할 수 있어.");
    } catch {
      window.alert("지우는 중 문제가 생겼어. 다시 한 번 해볼까?");
    }
  }

  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">
          ← 홈
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold">보호자 설정</h1>
        <p className="mt-2 text-slate-700">소리, 초기화 같은 설정을 할 수 있어요.</p>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">데이터 초기화</div>
          <p className="mt-2 text-sm text-slate-600">
            퀴즈 기록, 약한문제 통계, 스티커를 모두 지워요.
          </p>
          <button
            onClick={resetAll}
            className="mt-4 h-14 w-full rounded-2xl bg-rose-500 text-lg font-extrabold text-white shadow-sm active:scale-[0.99]"
          >
            모두 지우기
          </button>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">안내</div>
          <p className="mt-2 text-sm text-slate-600">
            이 페이지는 엄마/아빠가 쓰는 곳이에요.
          </p>
        </section>
      </div>
    </main>
  );
}
