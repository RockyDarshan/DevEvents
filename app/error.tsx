"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="pt-20 text-center space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <button onClick={reset} className="px-6 py-3 bg-blue-500 rounded-lg">Try again</button>
    </div>
  );
}