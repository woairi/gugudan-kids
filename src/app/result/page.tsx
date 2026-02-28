"use client";

import Link from "next/link";
import { useState } from "react";
import { lsGet } from "@/shared/lib/storage";

type LastResult = {
  at: string;
  dan: number;
  total: number;
  correct: number;
  msTotal: number;
  perQuestionMsAvg: number;
};

const LAST_RESULT_KEY = "gugudan.lastResult.v1";

export default function ResultPage() {
  const [result] = useState<LastResult | null>(() => lsGet<LastResult>(LAST_RESULT_KEY));

  const total = result?.total ?? 10;
  const correct = result?.correct ?? 0;
  const rate = total ? Math.round((correct / total) * 100) : 0;

  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">
          ← 홈
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold">결과</h1>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">단</div>
          <div className="text-xl font-extrabold">{result ? `${result.dan}단` : "-"}</div>

          <div className="mt-5 text-5xl font-extrabold">
            {correct}/{total}
          </div>
          <div className="mt-1 text-slate-700">정답률 {rate}%</div>

          <div className="mt-4 text-sm text-slate-600">
            평균 시간: {result ? `${Math.round(result.perQuestionMsAvg / 100) / 10}s/문제` : "-"}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/quiz"
              className="h-14 rounded-2xl bg-emerald-500 text-center text-lg font-extrabold leading-[3.5rem] text-white shadow-sm active:scale-[0.99]"
            >
              다시하기
            </Link>
            <Link
              href="/learn"
              className="h-14 rounded-2xl bg-white text-center text-lg font-extrabold leading-[3.5rem] text-slate-900 shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              학습하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
