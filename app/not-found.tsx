import Link from "next/link";
export default function NotFound() {
  return (
    <div className="pt-20 text-center space-y-4">
      <h2 className="text-2xl font-bold">Page not found</h2>
      <Link href="/events" className="text-blue-400">Browse events</Link>
    </div>
  );
}