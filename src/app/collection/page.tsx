"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BADGES, getRewards } from "@/shared/lib/rewards";

export default function CollectionPage() {
  const [rewards] = useState(() => getRewards());
  const [selected, setSelected] = useState<{ id: string; title: string; desc: string; emoji: string; unlockedAt: string | null } | null>(null);

  const list = useMemo(() => {
    return BADGES.map((b) => ({
      ...b,
      unlockedAt: rewards.unlocked[b.id] ?? null,
    }));
  }, [rewards]);

  const unlockedCount = list.filter((b) => b.unlockedAt).length;

  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">
          ← 홈
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold">스티커</h1>
        <p className="mt-2 text-slate-700">
          모은 스티커: <span className="font-extrabold">{unlockedCount}</span> / {list.length}
        </p>

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-extrabold">스티커북</div>
          <div className="mt-1 text-xs text-slate-600">빈칸을 채워보자!</div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {list.map((b) => {
              const unlocked = Boolean(b.unlockedAt);
              return (
                <button
                  type="button"
                  onClick={() => setSelected(b)}
                  key={b.id}
                  className={
                    "relative aspect-square rounded-3xl p-3 text-center ring-1 " +
                    (unlocked
                      ? "bg-amber-50 ring-amber-200"
                      : "bg-slate-100 text-slate-500 ring-slate-200 border border-dashed border-slate-300")
                  }
                >
                  {!unlocked && (
                    <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[10px] font-extrabold ring-1 ring-slate-200">
                      🔒
                    </div>
                  )}
                  <div className={"mt-3 text-3xl " + (unlocked ? "" : "opacity-30")}>{b.emoji}</div>
                  <div className="mt-2 text-xs font-extrabold leading-tight">{b.title}</div>
                </button>
              );
            })}
          </div>
        </div>



        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl">{selected.emoji}</div>
                  <div className="mt-2 text-xl font-extrabold">{selected.title}</div>
                  <div className="mt-1 text-sm text-slate-700">{selected.desc}</div>
                  <div className="mt-3 text-sm font-extrabold">
                    {selected.unlockedAt ? "✨ 받았어!" : "🔒 아직 못 받았어"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200"
                >
                  닫기
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mt-6 h-14 w-full rounded-2xl bg-amber-400 text-lg font-extrabold text-slate-900 ring-1 ring-amber-300 active:scale-[0.99]"
              >
                확인
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          모은 스티커: <span className="font-extrabold">{unlockedCount}</span> / {list.length}
        </div>
      </div>
    </main>
  );
}
