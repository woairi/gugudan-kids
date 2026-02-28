"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Row = { right: number; answer: number };

function makeTable(dan: number): Row[] {
  return Array.from({ length: 10 }, (_, right) => ({ right, answer: dan * right }));
}

export default function LearnPage() {
  const [dan, setDan] = useState<number>(2);

  const rows = useMemo(() => makeTable(dan), [dan]);

  const tip = useMemo(() => {
    if (dan === 0) return "0단은 언제나 0이에요!";
    if (dan === 1) return "1단은 그대로예요!";
    if (dan === 2) return "2단은 짝수만 나와요.";
    if (dan === 5) return "5단은 0이나 5로 끝나요.";
    if (dan === 9) return "9단은 앞자리는 커지고, 뒷자리는 작아져요.";
    return "천천히 읽어보고 따라 말해봐요.";
  }, [dan]);

  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">
          ← 홈
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold">학습하기</h1>
        <p className="mt-2 text-slate-700">단을 고르면 표를 보여줄게요.</p>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-bold">단 선택</div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i).map((d) => {
              const active = d === dan;
              return (
                <button
                  key={d}
                  onClick={() => setDan(d)}
                  className={
                    "h-12 rounded-2xl font-extrabold ring-1 active:scale-[0.99] " +
                    (active
                      ? "bg-amber-200 ring-amber-300"
                      : "bg-white ring-slate-200")
                  }
                >
                  {d}단
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl bg-amber-100 p-4 ring-1 ring-amber-200">
            <div className="text-sm font-extrabold">오늘의 팁</div>
            <div className="mt-1 text-sm text-slate-800">{tip}</div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">{dan}단 표</div>
          <div className="mt-3 grid gap-2">
            {rows.map((r) => (
              <div
                key={r.right}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"
              >
                <div className="text-xl font-extrabold">
                  {dan} × {r.right}
                </div>
                <div className="text-2xl font-extrabold">{r.answer}</div>
              </div>
            ))}
          </div>

          <Link
            href={`/quiz?dan=`}
            className="mt-5 block h-14 rounded-2xl bg-emerald-500 text-center text-lg font-extrabold leading-[3.5rem] text-white shadow-sm active:scale-[0.99]"
          >
            이 단으로 퀴즈풀기
          </Link>
        </section>
      </div>
    </main>
  );
}
