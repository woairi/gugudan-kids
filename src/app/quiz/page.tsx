"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lsGet, lsSet } from "@/shared/lib/storage";
import { isLastResult, isLastResultArray } from "@/shared/lib/validators";
import type { LastResult, WrongItem } from "@/shared/lib/result-types";
import { KEYS } from "@/shared/lib/keys";
import { ENCOURAGES, PRAISES, pickRandom } from "@/shared/lib/phrases";
import { bumpItemStat, getItemStats, type ItemKey } from "@/shared/lib/stats";
import { pickWeakRights } from "@/shared/lib/weak";
import { getRewards, unlockBadge, type BadgeId } from "@/shared/lib/rewards";
import { getSettings } from "@/shared/lib/settings";
import { playCorrect, playWrong } from "@/shared/lib/sound";
import { clearActiveSession, getActiveSession, setActiveSession, type QuizSession } from "@/shared/lib/session";
import { bumpToday, getToday } from "@/shared/lib/daily";

type Question = {
  dan: number;
  right: number;
  answer: number;
  choices: number[];
};

type Mode = "dan" | "weak" | "mistakes";

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


function makeWeakSession(dan: number, maxRight: number, total = 10): Question[] {
  const stats = getItemStats();
  const pickedRights = pickWeakRights({ dan, maxRight, total, stats });

  return pickedRights.map((right) => {
    const answer = dan * right;
    return { dan, right, answer, choices: makeChoices(answer) };
  });
}


function makeSessionFromRights(dan: number, rights: number[]): Question[] {
  return rights.map((right) => {
    const answer = dan * right;
    return { dan, right, answer, choices: makeChoices(answer) };
  });
}

function makeSession(dan: number, maxRight: number, total = 10): Question[] {
  // right 0~9를 섞어서 앞에서 total개 사용 (중복 없음)
  const rights = shuffle(Array.from({ length: maxRight + 1 }, (_, i) => i)).slice(0, total);
  return rights.map((right) => {
    const answer = dan * right;
    return { dan, right, answer, choices: makeChoices(answer) };
  });
}

export default function QuizPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "dan";
    try {
      const url = new URL(window.location.href);
      const m = url.searchParams.get("mode");
      return m === "mistakes" ? "mistakes" : "dan";
    } catch {
      return "dan";
    }
  });
  const [selectedDan, setSelectedDan] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const url = new URL(window.location.href);
      const m = url.searchParams.get("mode");
      if (m === "mistakes") {
        const raw = window.localStorage.getItem(KEYS.LAST_RESULT);
        if (raw) {
          try {
            const obj = JSON.parse(raw) as { dan?: number };
            const d = Number(obj.dan);
            if (Number.isFinite(d) && d >= 0 && d <= 9) return d;
          } catch {
            // ignore
          }
        }
        return null;
      }
      const q = url.searchParams.get("dan");
      const n = q != null ? Number(q) : NaN;
      return Number.isFinite(n) && n >= 0 && n <= 9 ? n : null;
    } catch {
      return null;
    }
  });

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const finalizedRef = useRef(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [isRight, setIsRight] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("콕 누르면 바로 알려줄게!");
  const [charLine, setCharLine] = useState<string>("준비되면 시작! 🐥");

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

  const statusText = message;

  const activeSession = getActiveSession();


  function flashChar(line: string) {
    setCharLine(line);
    window.setTimeout(() => setCharLine("계속 가볼까? 🐥"), 600);
  }


  const weakHasData = (() => {
    if (mode !== "weak" || selectedDan == null) return true;
    const stats = getItemStats();
    for (let r = 0; r <= getSettings().maxRight; r++) {
      const key = `${selectedDan}x${r}` as ItemKey;
      const s = stats[key];
      if (s && (s.attempts ?? 0) > 0) return true;
    }
    return false;
  })();

  useEffect(() => {
    if (!questions || sessionId == null || selectedDan == null) return;
    const session: QuizSession = {
      id: sessionId,
      dan: selectedDan,
      mode,
      total: questions.length,
      index,
      correct,
      rights: questions.map((q) => q.right),
      wrongItems,
      startedAt: startedAt ?? Date.now(),
    };
    setActiveSession(session);
  }, [questions, sessionId, selectedDan, mode, index, correct, wrongItems, startedAt]);


  function start() {
    if (selectedDan == null) return;
    if (mode === "weak" && !weakHasData) {
      setMode("dan");
    }

    const { quizCount, maxRight } = getSettings();

    if (mode === "mistakes") {
      const last = lsGet<LastResult>(KEYS.LAST_RESULT, isLastResult) ;
      const rights = Array.from(new Set((last?.wrongItems ?? []).map((w) => w.right)));
      if (rights.length === 0) {
        setMode("dan");
      } else {
        const qs = makeSessionFromRights(last?.dan ?? selectedDan, rights);
        setQuestions(qs);
        const now = Date.now();
        const sid = `${now}-${Math.random().toString(16).slice(2)}`;
        setSessionId(sid);
        setIndex(0);
        setCorrect(0);
        setWrongItems([]);
        setPicked(null);
        setIsRight(null);
        setMessage("콕 누르면 바로 알려줄게!");
    setCharLine("다음 문제! 🐥");
        setStartedAt(now);
        const session: QuizSession = {
          id: sid,
          dan: (last?.dan ?? selectedDan) as number,
          mode,
          total: qs.length,
          index: 0,
          correct: 0,
          rights: qs.map((q) => q.right),
          wrongItems: [],
          startedAt: now,
        };
        setActiveSession(session);
        return;
      }
    }
    const qs = mode === "weak" ? makeWeakSession(selectedDan, maxRight, quizCount) : makeSession(selectedDan, maxRight, quizCount);
    setQuestions(qs);
    const now = Date.now();
    const sid = `${now}-${Math.random().toString(16).slice(2)}`;
    setSessionId(sid);
    const session: QuizSession = {
      id: sid,
      dan: selectedDan,
      mode,
      total: qs.length,
      index: 0,
      correct: 0,
      rights: qs.map((q) => q.right),
      wrongItems: [],
      startedAt: now,
    };
    setActiveSession(session);
    setIndex(0);
    setCorrect(0);
    setWrongItems([]);
    setPicked(null);
    setIsRight(null);
    setMessage("콕 누르면 바로 알려줄게!");
    setCharLine("다음 문제! 🐥");
    setMessage("콕 누르면 바로 알려줄게!");
    setCharLine("다음 문제! 🐥");
    setStartedAt(Date.now());
    setShowSettings(false);
    setCharLine("시작! 🐥");
    setIsFinalizing(false);
    finalizedRef.current = false;
  }

  function pickChoice(value: number) {
    if (!current) return;
    if (picked != null) return; // 중복 채점 방지
    const ok = value === current.answer;
    if (ok) playCorrect(); else playWrong();
    setPicked(value);
    setIsRight(ok);
    setMessage(ok ? pickRandom(PRAISES) : pickRandom(ENCOURAGES));
    flashChar(ok ? "좋아! 🐥✨" : "괜찮아! 🐥");
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
      lsSet(KEYS.LAST_RESULT, result);
      // rewards
      const atIso = result.at;
      unlockBadge("first-quiz", atIso);
      const danBadge = (`dan-${result.dan}`) as BadgeId;
      unlockBadge(danBadge, atIso);
      // all-clear: if all dan badges are unlocked
      const state = getRewards();
      const all = Array.from({ length: 10 }, (_, i) => `dan-${i}` as BadgeId).every((id) => Boolean(state.unlocked[id]));
      if (all) unlockBadge("all-clear", atIso);
      if (result.correct === result.total) unlockBadge("perfect-10", atIso);

      const prev = lsGet<LastResult[]>(KEYS.RECENT_RESULTS, isLastResultArray) ?? [];
      const deduped = prev.filter((r) => r.id !== result.id);
      const next = [result, ...deduped].slice(0, RECENT_LIMIT);
      lsSet(KEYS.RECENT_RESULTS, next);
      bumpToday(result.total, result.correct);
      // daily goal badge (one-time)
      const t = getToday();
      if (t.solved >= 10) unlockBadge("goal-10", atIso);
      clearActiveSession();
      setSessionId(null);
      router.push("/result");
      return;
    }

    setIndex((i) => i + 1);
    setPicked(null);
    setIsRight(null);
    setMessage("콕 누르면 바로 알려줄게!");
    setCharLine("다음 문제! 🐥");
  }

  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <div className="flex items-center justify-between">
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

        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="rounded-full bg-white px-3 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 active:scale-[0.99]"
          aria-label="설정 열기/닫기"
        >
          ⚙️
        </button>
      </div>

        <h1 className="mt-4 text-2xl font-extrabold">{mode === "mistakes" ? "틀린 문제 다시 풀기" : "퀴즈풀기"}</h1>
        <p className="mt-2 text-slate-700">{mode === "mistakes" ? "틀렸던 문제만 다시 풀어보자!" : "단을 고르고, 준비되면 시작 버튼을 눌러줘!"}</p>

        {activeSession && !questions && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-sm font-extrabold">이어서 하기</div>
            <div className="mt-2 text-sm text-slate-700">{activeSession.dan}단 퀴즈를 이어서 할 수 있어! ({activeSession.index + 1}/{activeSession.total})</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMode(activeSession.mode);
                  setSelectedDan(activeSession.dan);
                  const qs = makeSessionFromRights(activeSession.dan, activeSession.rights);
                  setQuestions(qs);
                  setIndex(activeSession.index);
                  setCorrect(activeSession.correct);
                  setWrongItems(activeSession.wrongItems);
                  setStartedAt(activeSession.startedAt);
                }}
                className="h-14 rounded-2xl bg-amber-200 text-lg font-extrabold ring-1 ring-amber-300 active:scale-[0.99]"
              >
                이어서 하기
              </button>
              <button
                onClick={() => {
                  clearActiveSession();
                  setSessionId(null);
                  setQuestions(null);
                  setIndex(0);
                  setCorrect(0);
                  setWrongItems([]);
                  setPicked(null);
                  setIsRight(null);
                  setStartedAt(null);
                  setShowSettings(true);
                }}
                className="h-14 rounded-2xl bg-white text-lg font-extrabold ring-1 ring-slate-200 active:scale-[0.99]"
              >
                새로 시작
              </button>
            </div>
          </section>
        )}

        {/* 단 선택 */}
        {showSettings && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm font-bold">어떤 단을 할까?</div>
          {mode !== "mistakes" && (
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
          )}
          {mode === "mistakes" && (
            <div className="mt-3 rounded-2xl bg-emerald-100 p-4 text-sm font-extrabold text-emerald-900 ring-1 ring-emerald-200">
              틀린 문제만 다시 풀기 모드야!
            </div>
          )}
          <div className="mt-2 text-sm text-slate-600">
            {mode === "weak" ? "틀렸던 문제가 더 자주 나와! 연습하기 딱 좋아." : "선택한 단에서 랜덤으로 나와."}
            {mode === "weak" && !weakHasData && (
              <div className="mt-2 text-xs text-slate-600">아직 기록이 없어서, 랜덤으로 연습해도 좋아!</div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i).map((dan) => {
              const active = selectedDan === dan;
              return (
                <button
                  key={dan}
                  onClick={() => { if (mode !== "mistakes") setSelectedDan(dan); }}
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

          {(() => {
            const s = getSettings();
            if (!s.soundOn) return null;
            return (
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-extrabold">🔊 소리 확인</div>
                <div className="mt-1 text-xs text-slate-600">
                  소리가 안 들리면 무음 모드(벨소리)나 브라우저 설정을 확인해줘.
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => playCorrect()}
                    className="h-12 rounded-2xl bg-emerald-100 text-sm font-extrabold ring-1 ring-emerald-200 active:scale-[0.99]"
                  >
                    정답 소리
                  </button>
                  <button
                    type="button"
                    onClick={() => playWrong()}
                    className="h-12 rounded-2xl bg-amber-100 text-sm font-extrabold ring-1 ring-amber-200 active:scale-[0.99]"
                  >
                    오답 소리
                  </button>
                </div>
              </div>
            );
          })()}

        </section>
        )}

        {/* 문제 */}
        {current && (
          <>
            <div className="mt-5 mb-3 flex items-start gap-3">
              <div className="text-3xl">🐥</div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200">
                {charLine}
              </div>
            </div>

            <section className="mt-0 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
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
          </>
        )}
      </div>
    </main>
  );
}
