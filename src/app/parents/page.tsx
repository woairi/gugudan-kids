"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSettings, setSettings, type Settings } from "@/shared/lib/settings";
import { KEYS } from "@/shared/lib/keys";

const RESET_KEYS = [
  KEYS.LAST_RESULT,
  KEYS.RECENT_RESULTS,
  KEYS.ITEM_STATS,
  KEYS.REWARDS,
  KEYS.SETTINGS,
  KEYS.ACTIVE_SESSION,
];

export default function ParentsPage() {
  function showToast() {
    setToast("저장됐어!");
    window.setTimeout(() => setToast(null), 1200);
  }
  const [settings, setLocalSettings] = useState<Settings>(() => getSettings());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSettings(settings);
  }, [settings]);

  function resetAll() {
    const ok = window.confirm("기록을 모두 지울까? (되돌릴 수 없어요)");
    if (!ok) return;
    try {
      for (const k of RESET_KEYS) window.localStorage.removeItem(k);
      window.alert("지웠어! 다시 처음부터 시작할 수 있어.");
      setLocalSettings({ soundOn: false, quizCount: 10, maxRight: 9 });
      window.location.href = "/";
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
        <p className="mt-2 text-slate-700">설정과 초기화를 할 수 있어요.</p>

        {toast && (
          <div className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-800 ring-1 ring-emerald-200">
            {toast}
          </div>
        )}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">사운드</div>
          <p className="mt-2 text-sm text-slate-600">정답/오답 때 짧게 소리가 나요.</p>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
            <div className="text-sm font-bold">사운드 켜기</div>
            <button
              onClick={() => { setLocalSettings((s) => ({ ...s, soundOn: !s.soundOn })); showToast(); }}
              className={
                "h-12 w-24 rounded-full text-sm font-extrabold ring-1 active:scale-[0.99] " +
                (settings.soundOn
                  ? "bg-emerald-500 text-white ring-emerald-600"
                  : "bg-white text-slate-700 ring-slate-200")
              }
            >
              {settings.soundOn ? "ON" : "OFF"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">문제 수</div>
          <p className="mt-2 text-sm text-slate-600">퀴즈를 몇 문제 풀지 정해요.</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[10, 20].map((n) => {
              const active = settings.quizCount === n;
              return (
                <button
                  key={n}
                  onClick={() => { setLocalSettings((s) => ({ ...s, quizCount: n as 10 | 20 })); showToast(); }}
                  className={
                    "h-14 rounded-2xl text-lg font-extrabold ring-1 active:scale-[0.99] " +
                    (active
                      ? "bg-amber-200 ring-amber-300"
                      : "bg-white ring-slate-200")
                  }
                >
                  {n}문제
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">난이도</div>
          <p className="mt-2 text-sm text-slate-600">곱하는 수를 어디까지 할지 정해요.</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[9, 12].map((n) => {
              const active = settings.maxRight === n;
              return (
                <button
                  key={n}
                  onClick={() => {
                    setLocalSettings((s) => ({ ...s, maxRight: n as 9 | 12 }));
                    showToast();
                  }}
                  className={
                    "h-14 rounded-2xl text-lg font-extrabold ring-1 active:scale-[0.99] " +
                    (active ? "bg-amber-200 ring-amber-300" : "bg-white ring-slate-200")
                  }
                >
                  0~{n}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">데이터 초기화</div>
          <p className="mt-2 text-sm text-slate-600">
            퀴즈 기록, 약한문제 통계, 스티커, 설정을 모두 지워요.
          </p>
          <ResetHoldButton onConfirm={resetAll} />
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">안내</div>
          <p className="mt-2 text-sm text-slate-600">이 페이지는 엄마/아빠가 쓰는 곳이에요.</p>
        </section>
      </div>
    </main>
  );
}


function ResetHoldButton({ onConfirm }: { onConfirm: () => void }) {
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
        setHolding(false);
        setProgress(0);
        onConfirm();
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
      className="relative mt-4 h-14 w-full rounded-2xl bg-rose-500 text-lg font-extrabold text-white shadow-sm active:scale-[0.99]"
      aria-label="모두 지우기(2초간 길게 누르기)"
    >
      모두 지우기 (2초 꾹)
      {holding && (
        <div className="absolute inset-x-4 bottom-2 h-2 overflow-hidden rounded-full bg-rose-200">
          <div className="h-2 bg-white/80" style={{ width: `${progress}%` }} />
        </div>
      )}
    </button>
  );
}
