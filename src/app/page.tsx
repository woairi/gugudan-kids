"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getActiveSession } from "@/shared/lib/session";
import { getToday } from "@/shared/lib/daily";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-6">
        <header className="mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight">구구단 놀이터</h1>
          <p className="mt-2 text-base text-slate-700">
            0단부터 9단까지, 귀엽게 배우고 퀴즈로 연습해요.
          </p>
        </header>
        <div className="mb-4 flex items-start gap-3">
          <div className="text-3xl">🐥</div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200">
            오늘은 10문제 미션! 같이 해보자.
          </div>
        </div>

        <div className="mt-4 mb-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">오늘 미션</div>
          <div className="mt-2 text-lg font-extrabold">
            {(() => {
              const t = getToday();
              const rate = t.solved ? Math.round((t.correct / t.solved) * 100) : 0;
              const face = rate >= 90 ? "😄😄😄" : rate >= 70 ? "😄😄" : rate >= 50 ? "😄" : "🙂";
              const stars = rate >= 90 ? "🌟🌟🌟" : rate >= 70 ? "🌟🌟" : rate >= 50 ? "🌟" : "";
              const goalDone = t.solved >= 10;
              return (
                <>
                  <div>
                    {goalDone ? "미션 성공!" : "미션 도전!"} {face} {stars}
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-700">
                    {goalDone ? "10문제 넘게 풀었어!" : "목표: 10문제 풀기"}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    (오늘 {t.solved}문제 / {t.correct}개 정답)
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {getActiveSession() && (
          <a
            href="/quiz"
            className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-200 px-4 py-2 text-sm font-extrabold text-slate-900 ring-1 ring-amber-300 active:scale-[0.99]"
          >
            ▶︎ 이어서 하기
          </a>
        )}

        <div className="grid gap-4">
          <div className="grid gap-3">
            <Link
              href="/quiz"
              className="h-16 rounded-3xl bg-emerald-500 text-center text-xl font-extrabold leading-[4rem] text-white shadow-sm active:scale-[0.99]"
            >
              바로 퀴즈
            </Link>
            <Link
              href="/learn"
              className="h-16 rounded-3xl bg-white text-center text-xl font-extrabold leading-[4rem] text-slate-900 shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              학습 먼저
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/collection"
              className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              <div className="text-2xl">⭐</div>
              <div className="mt-1 font-bold">스티커</div>
            </Link>
            <ParentsGateButton />
          </div>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-500">
          만든이: Bori · 배포: Vercel
        </footer>
      </div>
    </main>
  );
}


function ParentsGateButton() {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startAtRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function startHold() {
    if (holding) return;
    setHolding(true);
    setProgress(0);
    startAtRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const startAt = startAtRef.current ?? Date.now();
      const elapsed = Date.now() - startAt;
      const p = Math.min(100, Math.round((elapsed / 2000) * 100));
      setProgress(p);
      if (elapsed >= 2000) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
        window.location.href = "/parents";
      }
    }, 50);
  }

  function stopHold() {
    setHolding(false);
    setProgress(0);
    startAtRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <button
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerCancel={stopHold}
      onPointerLeave={stopHold}
      className="relative rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
      aria-label="보호자 설정(2초간 길게 누르기)"
    >
      <div className="font-bold">보호자</div>
      <div className="text-xs text-slate-600">2초 꾹 누르기</div>
      {holding && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 bg-amber-400" style={{ width: `${progress}%` }} />
        </div>
      )}
    </button>
  );
}
