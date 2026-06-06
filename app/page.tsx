import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent, Event } from '@/database/event.model';
import { connectToDatabase } from '@/lib/mongodb';
import { Suspense } from 'react';
import Link from 'next/link';

const EventList = async () => {
  await connectToDatabase();
  const rawEvents = await Event.find({}).lean();

  const events: IEvent[] = rawEvents.map((e) => ({
    ...(e as unknown as IEvent),
    _id: String(e._id),
    createdAt: e.createdAt ? String(e.createdAt) : "",
    updatedAt: e.updatedAt ? String(e.updatedAt) : "",
  }));

  if (!events || events.length === 0) return null;

  return (
    <ul className="events">
      {events.map((event: IEvent) => (
        <li key={event.slug} className="list-none">
          <EventCard {...event} time={event.time ?? ''} />
        </li>
      ))}
    </ul>
  );
};

const Home = () => {
  return (
    <>
      <section className="pt-0">
        <h1 className="text-center">
          The Hub For Every Dev
          <br />
          Event you can&apos;t miss!
        </h1>
        <p className="text-center mt-5">
          Hackathons, Meetups and Conferences, All in One Place
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <ExploreBtn />
          <Link
            href="/create-event"
            className="px-8 py-3 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400/10 transition font-medium"
          >
            Create Event
          </Link>
        </div>
        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <Suspense fallback={<p>Loading events...</p>}>
            <EventList />
          </Suspense>
        </div>
      </section>
      </>
  );
};

export default Home;