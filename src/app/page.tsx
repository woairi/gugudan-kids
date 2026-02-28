import Link from "next/link";

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
            <Link
              href="/parents"
              className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
            >
              <div className="font-bold">보호자</div>
              <div className="text-xs text-slate-600">설정</div>
            </Link>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">
          만든이: Bori · 배포: Vercel
        </footer>
      </div>
    </main>
  );
}
