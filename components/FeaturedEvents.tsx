// components/FeaturedEvents.tsx
import EventCard from "@/components/EventCard";
import { getFeaturedEvents } from "@/lib/events";

export default async function FeaturedEvents() {
  const events = await getFeaturedEvents();
  if (events.length === 0) {
    return <p className="text-center text-white/70 py-12">No events are available right now.</p>;
  }
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Featured Events</h3>
      <ul className="events grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((e) => (
          <li key={e.slug} className="list-none">
            <EventCard title={e.title} image={e.image} slug={e.slug} location={e.location} date={e.date} time={e.time ?? ""} />
          </li>
        ))}
      </ul>
    </div>
  );
}