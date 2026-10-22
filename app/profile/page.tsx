import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/database";
import { Event } from "@/database/event.model";
import { getMyBookings } from "@/lib/actions/booking.actions";
import LogoutButton from "@/components/LogoutButton";
import CancelBookingButton from "@/components/CancelBookingButton";

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/login");

  await connectToDatabase();
  const [account, bookings, myEvents] = await Promise.all([
    User.findById(session.userId).select("createdAt").lean(),
    getMyBookings(),
    Event.find({ createdBy: session.userId }).sort({ date: 1 }).select("title slug date").lean(),
  ]);

  return (
    <section className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{session.name}</h1>
            <p className="text-white/70">{session.email}</p>
            {account?.createdAt && (
              <p className="text-white/50 text-sm">
                Member since {new Date(account.createdAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
          <LogoutButton />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">My bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-white/50">You have not booked any events yet.</p>
          ) : (
            <ul className="space-y-3 list-none">
              {bookings.map((b) => (
                <li key={b.bookingId} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
                  <Link href={`/events/${b.slug}`} className="hover:text-blue-400">
                    {b.title} · {b.date} · {b.location}
                  </Link>
                  <CancelBookingButton bookingId={b.bookingId} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My events</h2>
            <Link href="/create-event" className="text-blue-400 hover:text-blue-300">+ Create event</Link>
          </div>
          {myEvents.length === 0 ? (
            <p className="text-white/50">You have not created any events yet.</p>
          ) : (
            <ul className="space-y-3 list-none">
              {myEvents.map((e) => (
                <li key={e.slug} className="flex items-center justify-between rounded-lg border border-white/10 p-4">
                  <Link href={`/events/${e.slug}`} className="hover:text-blue-400">{e.title} · {e.date}</Link>
                  <Link href={`/events/${e.slug}/edit`} className="text-sm text-white/70 hover:text-white">Edit</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}