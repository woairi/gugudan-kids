"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BADGES, getRewards } from "@/shared/lib/rewards";

export default function CollectionPage() {
  const [rewards] = useState(() => getRewards());

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
                <div
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
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          모은 스티커: <span className="font-extrabold">{unlockedCount}</span> / {list.length}
        </div>
      </div>
    </main>
  );
}
