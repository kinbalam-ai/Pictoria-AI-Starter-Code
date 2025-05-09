// app/page.tsx
import Link from "next/link";
import HanziEntry from "./_components/HanziEntry";
import ComponentB from "./_components/ComponentB";
// import ComponentA from "./_components/ComponentA";
import BasicHanziInfo from "./_components/BasicHanziInfo";

export default async function Home({
  searchParams,
}: {
  searchParams: { character?: string };
}) {
  const { character: hanzi } = await searchParams;

  if (!hanzi) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
        <h1 className="text-4xl font-bold">Hanzi Display</h1>
        <p className="text-lg">Enter a Chinese character to display</p>

        <div className="flex gap-4">
          {/* Form to submit a character */}
          <form action="/hanzi" method="GET" className="flex gap-2">
            <input
              type="text"
              name="hanzi"
              maxLength={1}
              placeholder="Enter a character"
              className="px-4 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Display
            </button>
          </form>

          {/* Or try these examples */}
          <div className="flex gap-2 items-center">
            <span>or try:</span>
            <Link
              href="/hanzi?character=爱"
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              爱
            </Link>
            <Link
              href="/hanzi?character=好"
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              好
            </Link>
            <Link
              href="/hanzi?character=中"
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              中
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      {/* Left column (ComponentA + HanziEntry) */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ComponentA - appears above on mobile, side-by-side on desktop */}
        <div className="lg:w-64 lg:sticky lg:top-0 lg:h-screen overflow-y-auto p-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
          <BasicHanziInfo />
        </div>

        {/* HanziEntry - main scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50">
          <HanziEntry />
        </div>
      </div>

      {/* Right fixed sidebar - ComponentB */}
      <div className="hidden lg:block w-64 sticky top-0 h-screen overflow-y-auto p-4 border-l border-gray-200 bg-white">
        <ComponentB />
      </div>
    </main>
  );
}
