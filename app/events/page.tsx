import { Suspense } from 'react';
import EventSearch from '@/components/EventSearch';
import EventCard from '@/components/EventCard';
import { Event } from '@/database/event.model';
import { connectToDatabase } from '@/lib/mongodb';
import { escapeRegex } from "@/lib/event-utils";
import { serializeEvent } from "@/lib/serialize";
import Pagination from '@/components/Pagination';
const PAGE_SIZE = 9;

interface SearchParams {
  [key: string]: string | undefined;
  q?: string;
  category?: string;
  location?: string;
  sortBy?: string;
  when?: string;
  page?: string;
}

interface EventsListProps {
  searchParams: SearchParams;
}

interface EventsPageProps {
  searchParams: Promise<SearchParams>;
}

const EventsList = async ({ searchParams }: EventsListProps) => {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  
  // 1. Build Title / Description / Tags full text filter
  const q = searchParams.q?.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    query.$or = [{ title: rx }, { description: rx }, { tags: rx }];
  }

  // 2. Build Category Filter
  if (searchParams.category && searchParams.category !== "All") {
    query.tags = { $regex: `^${escapeRegex(searchParams.category)}$`, $options: "i" };
  }

  // 3. Build Location Filter
  if (searchParams.location?.trim()) {
    query.location = { $regex: escapeRegex(searchParams.location.trim()), $options: "i" };
  }

  // 4. Build Date Filter
  const today = new Date().toISOString().slice(0, 10);
  const when = searchParams.when ?? "upcoming";
  if (when === "upcoming") query.date = { $gte: today };
  if (when === "past") query.date = { $lt: today };

  // 5. Build Sort Options
  const sort: Record<string, 1 | -1> =
    searchParams.sortBy === "newest" ? { createdAt: -1 }
    : searchParams.sortBy === "alphabetical" ? { title: 1 }
    : when === "past" ? { date: -1, time: -1 }
    : { date: 1, time: 1 };

  // 6. Calculate Pagination Bounds
  const page = Math.max(1, Number(searchParams.page) || 1);

  // 7. Parallelized Database Operations
  const [rawEvents, total] = await Promise.all([
    Event.find(query)
      .collation({ locale: "en", strength: 2 }) // Case-insensitive sorting
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Event.countDocuments(query),
  ]);

  const events = rawEvents.map(serializeEvent);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">All Events</h2>
        <p className="text-white/70">Discover and join amazing dev events</p>
      </div>

      <EventSearch />

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/50 text-lg">No events found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-white/70 mb-4">{total} events found</p>
          <ul className="events grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <li key={event.slug} className="list-none">
                <EventCard
                  title={event.title}
                  image={event.image}
                  slug={event.slug}
                  location={event.location}
                  date={event.date}
                  time={event.time ?? ""}
                />
              </li>
            ))}
          </ul>
          
          <Pagination page={page} pages={pages} params={searchParams} />
        </div>
      )}
    </div>
  );
};

const EventsContent = async ({ searchParams }: EventsPageProps) => {
  const resolvedSearchParams = await searchParams;
  return <EventsList searchParams={resolvedSearchParams} />;
};

const EventsPage = ({ searchParams }: EventsPageProps) => {
  return (
    <section className="pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <Suspense fallback={<div className="text-center py-12"><p className="text-white/50">Loading events...</p></div>}>
          <EventsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
};

export default EventsPage;
