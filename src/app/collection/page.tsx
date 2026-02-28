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

        <div className="mt-6 grid gap-3">
          {list.map((b) => {
            const unlocked = Boolean(b.unlockedAt);
            return (
              <div
                key={b.id}
                className={
                  "rounded-2xl p-5 shadow-sm ring-1 " +
                  (unlocked
                    ? "bg-white ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200")
                }
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{b.emoji}</div>
                  <div className="text-xs">
                    {unlocked ? "획득!" : "잠김"}
                  </div>
                </div>
                <div className="mt-2 text-lg font-extrabold">{b.title}</div>
                <div className="mt-1 text-sm">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
