"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerActions({ slug }: { slug: string }) {
  const router = useRouter();
  const remove = async () => {
    if (!confirm("Delete this event and all its bookings?")) return;
    const res = await fetch(`/api/events/${slug}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/events");
      router.refresh();
    } else {
      alert("Could not delete the event.");
    }
  };
  return (
    <div className="flex gap-3">
      <Link href={`/events/${slug}/edit`} className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5">Edit</Link>
      <button onClick={remove} className="px-4 py-2 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10">Delete</button>
    </div>
  );
}