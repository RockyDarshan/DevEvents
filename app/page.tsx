import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent, Event } from '@/database/event.model';
import { connectToDatabase } from '@/lib/mongodb';
import { Suspense } from 'react';

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
    <section className="pt-0">
      <h1 className="text-center">
        The Hub For Every Dev
        <br />
        Event you can&apos;t miss!
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups and Conferences, All in One Place
      </p>
      <div className="flex justify-center mt-8">
        <ExploreBtn />
      </div>
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <Suspense fallback={<p>Loading events...</p>}>
          <EventList />
        </Suspense>
      </div>
    </section>
  );
};

export default Home;