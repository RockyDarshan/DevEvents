import ExploreBtn from '@/components/ExploreBtn'
import FeaturedEvents from '@/components/FeaturedEvents'
import { Suspense } from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <>
      <section className="pt-0">
        <h1 className="text-center">
          The Hub For Every Dev
          <br />
          Event you can&apos;t miss!
        </h1>
        <p className="text-center mt-5 text-white/70">
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
        <div className="mt-20">
          <Suspense fallback={<p className="text-center text-white/70 py-12">Loading events...</p>}>
            <FeaturedEvents />
          </Suspense>
        </div>
      </section>
    </>
  );
};

export default Home;