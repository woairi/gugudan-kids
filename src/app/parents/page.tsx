import Link from "next/link";

export default function ParentsPage() {
  return (
    <main className="min-h-dvh bg-amber-50 text-slate-900">
      <div className="mx-auto max-w-md px-5 py-8">
        <Link href="/" className="text-sm text-slate-600">← 홈</Link>
        <h1 className="mt-4 text-2xl font-extrabold">보호자 설정</h1>
        <p className="mt-2 text-slate-700">소리, 초기화 같은 설정을 여기에 둘게요.</p>
      </div>
    </main>
  );
}
