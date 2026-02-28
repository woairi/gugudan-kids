import Link from "next/link";

export default function CollectionPage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">← 홈</Link>
        <h1 className="mt-4 text-2xl font-extrabold">스티커</h1>
        <p className="mt-2 text-slate-700">퀴즈를 끝내면 스티커가 하나씩 생겨요.</p>
      </div>
    </main>
  );
}
