"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lsGet, lsSet } from "@/shared/lib/storage";
import { isLastResultArray } from "@/shared/lib/validators";
import { ENCOURAGES, PRAISES, pickRandom } from "@/shared/lib/phrases";
import { bumpItemStat, getItemStats, type ItemKey } from "@/shared/lib/stats";
import { unlockBadge, type BadgeId } from "@/shared/lib/rewards";

type Question = {
  dan: number;
  right: number;
  answer: number;
  choices: number[];
};

type Mode = "dan" | "weak";

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
const RECENT_LIMIT = 10;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChoices(correct: number): number[] {
  const set = new Set<number>([correct]);
  while (set.size < 4) {
    // +/- 1~9 범위로 흔들거나 랜덤
    const delta = randInt(-9, 9);
    const candidate = Math.max(0, correct + delta);
    set.add(candidate);
  }
  return shuffle(Array.from(set));
}


function makeWeakSession(dan: number, total = 10): Question[] {
  const stats = getItemStats();
  // build candidates for this dan (0~9)
  const candidates = Array.from({ length: 10 }, (_, right) => {
    const key = `${dan}x${right}` as ItemKey;
    const s = stats[key];
    const wrong = s?.wrong ?? 0;
    const attempts = s?.attempts ?? 0;
    const score = attempts == 0 ? -1 : wrong / attempts; // -1 means unknown
    return { right, score, wrong, attempts };
  });

  // sort: known weakness first (higher wrong-rate), then more wrong count
  candidates.sort((a, b) => {
    if (a.score === -1 && b.score !== -1) return 1;
    if (b.score === -1 && a.score !== -1) return -1;
    if (b.score !== a.score) return b.score - a.score;
    return b.wrong - a.wrong;
  });

  const pickedRights: number[] = [];
  for (const c of candidates) {
    if (pickedRights.length >= total) break;
    if (c.score === -1) break; // stop when unknowns start
    pickedRights.push(c.right);
  }

  // if not enough known-weak items, fill with random unique rights
  const pool = shuffle(Array.from({ length: 10 }, (_, i) => i));
  for (const r of pool) {
    if (pickedRights.length >= total) break;
    if (!pickedRights.includes(r)) pickedRights.push(r);
  }

  return pickedRights.map((right) => {
    const answer = dan * right;
    return { dan, right, answer, choices: makeChoices(answer) };
  });
}

function makeSession(dan: number, total = 10): Question[] {
  // right 0~9를 섞어서 앞에서 total개 사용 (중복 없음)
  const rights = shuffle(Array.from({ length: 10 }, (_, i) => i)).slice(0, total);
  return rights.map((right) => {
    const answer = dan * right;
    return { dan, right, answer, choices: makeChoices(answer) };
  });
}

export default function QuizPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("dan");
  const [selectedDan, setSelectedDan] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("dan");
      const n = q != null ? Number(q) : NaN;
      return Number.isFinite(n) && n >= 0 && n <= 9 ? n : null;
    } catch {
      return null;
    }
  });

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const finalizedRef = useRef(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [isRight, setIsRight] = useState<boolean | null>(null);

  const current = questions?.[index] ?? null;

  const inProgress = questions != null;

  useEffect(() => {
    if (!inProgress) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [inProgress]);
  const total = questions?.length ?? 10;

  const statusText = useMemo(() => {
    if (picked == null) return "콕 누르면 바로 알려줄게!";
    return isRight ? pickRandom(PRAISES) : pickRandom(ENCOURAGES);
  }, [picked, isRight]);

  function start() {
    if (selectedDan == null) return;
    setQuestions(mode === "weak" ? makeWeakSession(selectedDan, 10) : makeSession(selectedDan, 10));
    setIndex(0);
    setCorrect(0);
    setWrongItems([]);
    setPicked(null);
    setIsRight(null);
    setStartedAt(Date.now());
    setIsFinalizing(false);
    finalizedRef.current = false;
  }

  function pickChoice(value: number) {
    if (!current) return;
    if (picked != null) return; // 중복 채점 방지
    const ok = value === current.answer;
    setPicked(value);
    setIsRight(ok);
    if (ok) setCorrect((c) => c + 1);
    bumpItemStat(`${current.dan}x${current.right}` as ItemKey, ok);
    if (!ok) {
      setWrongItems((w) => [
        ...w,
        { dan: current.dan, right: current.right, answer: current.answer, picked: value },
      ]);
    }
  }

  function next() {
    if (!questions) return;
    const last = index >= questions.length - 1;
    if (last) {
      if (finalizedRef.current || isFinalizing) return;
      finalizedRef.current = true;
      setIsFinalizing(true);
      const now = Date.now();
      const sessionId = `${now}-${Math.random().toString(16).slice(2)}`;
      const msTotal = startedAt ? now - startedAt : 0;
      const result: LastResult = {
        id: sessionId,
        at: new Date(now).toISOString(),
        dan: selectedDan ?? 0,
        total: questions.length,
        correct,
        msTotal,
        perQuestionMsAvg: questions.length ? Math.round(msTotal / questions.length) : 0,
        wrongItems,
      };
      lsSet(LAST_RESULT_KEY, result);
      // rewards
      const atIso = result.at;
      unlockBadge("first-quiz", atIso);
      const danBadge = (`dan-${result.dan}`) as BadgeId;
      unlockBadge(danBadge, atIso);
      if (result.correct === result.total) unlockBadge("perfect-10", atIso);

      const prev = lsGet<LastResult[]>(RECENT_RESULTS_KEY, isLastResultArray) ?? [];
      const deduped = prev.filter((r) => r.id !== result.id);
      const next = [result, ...deduped].slice(0, RECENT_LIMIT);
      lsSet(RECENT_RESULTS_KEY, next);
      router.push("/result");
      return;
    }

    setIndex((i) => i + 1);
    setPicked(null);
    setIsRight(null);
  }

  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <button
          type="button"
          onClick={() => {
            if (questions) {
              const ok = window.confirm("지금 나가면 퀴즈가 처음부터 시작돼! 나갈까?");
              if (!ok) return;
            }
            window.location.href = "/";
          }}
          className="text-sm text-slate-600"
        >
          ← 홈
        </button>

        <h1 className="mt-4 text-2xl font-extrabold">퀴즈풀기</h1>
        <p className="mt-2 text-slate-700">단을 고르고, 준비되면 시작 버튼을 눌러줘!</p>

        {/* 단 선택 */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-bold">어떤 단을 할까?</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("dan")}
              className={
                "h-12 rounded-2xl font-extrabold ring-1 active:scale-[0.99] " +
                (mode === "dan" ? "bg-emerald-100 ring-emerald-200" : "bg-white ring-slate-200")
              }
            >
              단 퀴즈
            </button>
            <button
              onClick={() => setMode("weak")}
              className={
                "h-12 rounded-2xl font-extrabold ring-1 active:scale-[0.99] " +
                (mode === "weak" ? "bg-amber-200 ring-amber-300" : "bg-white ring-slate-200")
              }
            >
              약한 문제
            </button>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {mode === "weak" ? "틀린 적이 많은 문제부터 나와요." : "준비되면 시작! (처음엔 천천히 해도 돼)"}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i).map((dan) => {
              const active = selectedDan === dan;
              return (
                <button
                  key={dan}
                  onClick={() => setSelectedDan(dan)}
                  className={
                    "h-12 rounded-2xl font-extrabold ring-1 active:scale-[0.99] " +
                    (active
                      ? "bg-amber-200 ring-amber-300"
                      : "bg-white ring-slate-200")
                  }
                >
                  {dan}단
                </button>
              );
            })}
          </div>

          <button
            onClick={start}
            disabled={selectedDan == null}
            className={
              "mt-4 h-14 w-full rounded-2xl text-lg font-extrabold shadow-sm active:scale-[0.99] " +
              (selectedDan == null
                ? "bg-slate-200 text-slate-500"
                : "bg-emerald-500 text-white")
            }
          >
            시작!
          </button>
        </section>

        {/* 문제 */}
        {current && (
          <section className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-sm text-slate-600">
              {index + 1} / {total}
            </div>
            <div className="mt-2 text-4xl font-extrabold">
              {current.dan} × {current.right} = ?
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {current.choices.map((v) => {
                const disabled = picked != null;
                const chosen = picked === v;
                const correctChoice = v === current.answer;

                let cls =
                  "h-16 rounded-2xl text-2xl font-extrabold ring-1 active:scale-[0.99] ";
                if (!disabled) {
                  cls += "bg-emerald-50 ring-emerald-200";
                } else if (chosen && isRight) {
                  cls += "bg-emerald-500 text-white ring-emerald-600";
                } else if (chosen && !isRight) {
                  cls += "bg-amber-400 text-slate-900 ring-amber-500";
                } else if (correctChoice) {
                  cls += "bg-emerald-200 ring-emerald-300";
                } else {
                  cls += "bg-slate-100 text-slate-500 ring-slate-200";
                }

                return (
                  <button
                    key={v}
                    onClick={() => pickChoice(v)}
                    disabled={disabled}
                    className={cls}
                  >
                    {v}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 text-base font-bold">{statusText}</div>

            <button
              onClick={next}
              disabled={picked == null || isFinalizing}
              className={
                "mt-4 h-14 w-full rounded-2xl text-lg font-extrabold shadow-sm active:scale-[0.99] " +
                (picked == null
                  ? "bg-slate-200 text-slate-500"
                  : "bg-amber-400 text-slate-900")
              }
            >
              {index + 1 >= total ? "결과 보기" : "다음 문제"}
            </button>

            <div className="mt-3 text-sm text-slate-600">
              맞은 개수: <span className="font-extrabold">{correct}</span>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}