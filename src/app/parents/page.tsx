"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSettings, setSettings, type Settings } from "@/shared/lib/settings";

const RESET_KEYS = [
  "gugudan.lastResult.v1",
  "gugudan.recentResults.v1",
  "gugudan.itemStats.v1",
  "gugudan.rewards.v1",
  "gugudan.settings.v1",
];

export default function ParentsPage() {
  const [settings, setLocalSettings] = useState<Settings>(() => getSettings());

  useEffect(() => {
    setSettings(settings);
  }, [settings]);

  function resetAll() {
    const ok = window.confirm("기록을 모두 지울까? (되돌릴 수 없어요)");
    if (!ok) return;
    try {
      for (const k of RESET_KEYS) window.localStorage.removeItem(k);
      window.alert("지웠어! 다시 처음부터 시작할 수 있어.");
      setLocalSettings({ soundOn: false, quizCount: 10 });
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

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">사운드</div>
          <p className="mt-2 text-sm text-slate-600">정답/오답 때 짧게 소리가 나요.</p>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
            <div className="text-sm font-bold">사운드 켜기</div>
            <button
              onClick={() => setLocalSettings((s) => ({ ...s, soundOn: !s.soundOn }))}
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
                  onClick={() => setLocalSettings((s) => ({ ...s, quizCount: n as 10 | 20 }))}
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
          <div className="text-sm font-extrabold">데이터 초기화</div>
          <p className="mt-2 text-sm text-slate-600">
            퀴즈 기록, 약한문제 통계, 스티커, 설정을 모두 지워요.
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
          <p className="mt-2 text-sm text-slate-600">이 페이지는 엄마/아빠가 쓰는 곳이에요.</p>
        </section>
      </div>
    </main>
  );
}
