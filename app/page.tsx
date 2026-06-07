import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { IEvent } from '@/database';
import { cacheLife } from 'next/cache';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const Home = async () => {
  'use cache';
  cacheLife('hours');
  const apiUrl = new URL('/api/events', baseUrl).toString();
  const response = await fetch(apiUrl);
  const { events } = await response.json();

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
  {events && events.length > 0 && events.map((event:IEvent) => (
    <li key={event.title} className='list-none'> 
     <EventCard {...event} time={event.time ?? ''} />
    </li>
  ))}
 </ul>
      </div>
    </section>
  )
}

export default Home