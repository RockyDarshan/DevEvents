import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent, Event } from '@/database/event.model';
import { connectToDatabase } from '@/lib/mongodb';
import { cacheLife } from 'next/cache';

const Home = async () => {
  'use cache';
  cacheLife('hours');

  await connectToDatabase();
  const rawEvents = await Event.find({}).lean();

  const events: IEvent[] = rawEvents.map((e) => ({
    ...(e as unknown as IEvent),
    _id: String(e._id),
    createdAt: e.createdAt ? String(e.createdAt) : "",
    updatedAt: e.updatedAt ? String(e.updatedAt) : "",
  }));

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
        <ul className="events">
          {events && events.length > 0 && events.map((event: IEvent) => (
            <li key={event.slug} className="list-none">
              <EventCard {...event} time={event.time ?? ''} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Home;