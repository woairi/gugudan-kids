"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getActiveSession } from "@/shared/lib/session";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">구구단 놀이터</h1>
          <p className="mt-2 text-base text-slate-700">
            0단부터 9단까지, 귀엽게 배우고 퀴즈로 연습해요.
          </p>
        </header>

        {getActiveSession() && (
          <a
            href="/quiz"
            className="mb-3 block rounded-2xl bg-amber-200 p-5 shadow-sm ring-1 ring-amber-300 active:scale-[0.99]"
          >
            <div className="text-lg font-extrabold">이어서 하기</div>
            <div className="mt-1 text-sm text-slate-700">하던 퀴즈를 이어서 할 수 있어!</div>
          </a>
        )}

        <div className="grid gap-3">
          <Link
            href="/learn"
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
          >
            <div className="text-lg font-bold">학습하기</div>
            <div className="mt-1 text-sm text-slate-600">단별 표를 보고 외워요</div>
          </Link>

          <Link
            href="/quiz"
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
          >
            <div className="text-lg font-bold">퀴즈풀기</div>
            <div className="mt-1 text-sm text-slate-600">10문제로 가볍게 연습!</div>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/collection"
              className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              <div className="font-bold">스티커</div>
              <div className="text-xs text-slate-600">모아보기</div>
            </Link>
            <ParentsGateButton />
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">
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
