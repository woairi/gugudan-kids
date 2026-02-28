"use client";

import Link from "next/link";
import { useState } from "react";
import { lsGet } from "@/shared/lib/storage";
import { isLastResult, isLastResultArray } from "@/shared/lib/validators";

type WrongItem = { dan: number; right: number; answer: number; picked: number };

type LastResult = {
  id: string;
  at: string;
  dan: number;
  total: number;
  correct: number;
  msTotal: number;
  perQuestionMsAvg: number;
  wrongItems: WrongItem[];
};

const LAST_RESULT_KEY = "gugudan.lastResult.v1";
const RECENT_RESULTS_KEY = "gugudan.recentResults.v1";

export default function ResultPage() {
  const [result] = useState<LastResult | null>(() => lsGet<LastResult>(LAST_RESULT_KEY, isLastResult));
  const [recent] = useState<LastResult[]>(() => lsGet<LastResult[]>(RECENT_RESULTS_KEY, isLastResultArray) ?? []);

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
          <div className="mt-1 text-slate-700">맞춘 비율 {rate >= 90 ? "🌟🌟🌟" : rate >= 70 ? "🌟🌟" : rate >= 50 ? "🌟" : "🙂"}  ( {rate}% )</div>

          <div className="mt-4 text-sm text-slate-600">
            평균 속도: {result ? `${Math.round(result.perQuestionMsAvg / 100) / 10}s/문제` : "-"}
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <div className="text-sm font-extrabold">다시 풀어볼 문제</div>
            <div className="mt-2 grid gap-2">
              {(result?.wrongItems ?? []).slice(0, 5).map((w, i) => (
                <div
                  key={`${w.dan}x${w.right}-${i}`}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-amber-200"
                >
                  <div className="text-sm font-bold">
                    {w.dan} × {w.right}
                  </div>
                  <div className="text-sm text-slate-700">
                    정답 {w.answer} / 내가 {w.picked}
                  </div>
                </div>
              ))}
              {(result?.wrongItems?.length ?? 0) === 0 && (
                <div className="text-sm text-slate-600">다시 풀어볼 문제가 없어요! 최고!</div>
              )}
            </div>
            {result && (result.wrongItems?.length ?? 0) > 0 && (
              <Link
                href={`/quiz?dan=${result.dan}`}
                className="mt-3 block h-12 rounded-2xl bg-amber-200 text-center text-base font-extrabold leading-[3rem] text-slate-900 ring-1 ring-amber-300 active:scale-[0.99]"
              >
                이 단 다시 연습하기
              </Link>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-sm font-extrabold">최근 기록</div>
            <div className="mt-2 grid gap-2">
              {recent.slice(0, 5).map((r, i) => {
                const rate = r.total ? Math.round((r.correct / r.total) * 100) : 0;
                return (
                  <div key={r.at + i} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <div className="text-sm font-bold">{r.dan}단</div>
                    <div className="text-sm text-slate-700">{rate >= 90 ? "😄😄😄" : rate >= 70 ? "😄😄" : rate >= 50 ? "😄" : "🙂"}</div>
                  </div>
                );
              })}
              {recent.length === 0 && (
                <div className="text-sm text-slate-600">아직 기록이 없어요.</div>
              )}
            </div>
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
