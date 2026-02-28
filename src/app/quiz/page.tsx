"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { lsGet, lsSet } from "@/shared/lib/storage";
import { getQueryInt } from "@/shared/lib/query";
import { ENCOURAGES, PRAISES, pickRandom } from "@/shared/lib/phrases";

type Question = {
  dan: number;
  right: number;
  answer: number;
  choices: number[];
};

type LastResult = {
  at: string;
  dan: number;
  total: number;
  correct: number;
  msTotal: number;
  perQuestionMsAvg: number;
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

  const [selectedDan, setSelectedDan] = useState<number | null>(() => {
    const q = getQueryInt("dan");
    return q != null && q >= 0 && q <= 9 ? q : null;
  });
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [isRight, setIsRight] = useState<boolean | null>(null);

  const current = questions?.[index] ?? null;
  const total = questions?.length ?? 10;

  const statusText = useMemo(() => {
    if (picked == null) return "선택하면 바로 채점해줄게!";
    return isRight ? pickRandom(PRAISES) : pickRandom(ENCOURAGES);
  }, [picked, isRight]);

  function start() {
    if (selectedDan == null) return;
    setQuestions(makeSession(selectedDan, 10));
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setIsRight(null);
    setStartedAt(Date.now());
  }

  function pickChoice(value: number) {
    if (!current) return;
    if (picked != null) return; // 중복 채점 방지
    const ok = value === current.answer;
    setPicked(value);
    setIsRight(ok);
    if (ok) setCorrect((c) => c + 1);
  }

  function next() {
    if (!questions) return;
    const last = index >= questions.length - 1;
    if (last) {
      const now = Date.now();
      const msTotal = startedAt ? now - startedAt : 0;
      const result: LastResult = {
        at: new Date(now).toISOString(),
        dan: selectedDan ?? 0,
        total: questions.length,
        correct,
        msTotal,
        perQuestionMsAvg: questions.length ? Math.round(msTotal / questions.length) : 0,
      };
      lsSet(LAST_RESULT_KEY, result);
      const prev = lsGet<LastResult[]>(RECENT_RESULTS_KEY) ?? [];
      const next = [result, ...prev].slice(0, RECENT_LIMIT);
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
        <Link href="/" className="text-sm text-slate-600">
          ← 홈
        </Link>

        <h1 className="mt-4 text-2xl font-extrabold">퀴즈풀기</h1>
        <p className="mt-2 text-slate-700">단을 고르고 10문제로 가볍게 연습해요.</p>

        {/* 단 선택 */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-bold">어떤 단을 할까?</div>
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
                  cls += "bg-rose-500 text-white ring-rose-600";
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
              disabled={picked == null}
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
