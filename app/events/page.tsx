import { Suspense } from 'react'
import EventSearch from '@/components/EventSearch'
import EventCard from '@/components/EventCard'
import { IEvent, Event } from '@/database/event.model'
import { connectToDatabase } from '@/lib/mongodb'

interface SearchParams {
  q?: string
  category?: string
  location?: string
  sortBy?: string
}

interface EventsListProps {
  searchParams: SearchParams
}

interface EventsPageProps {
  searchParams: Promise<SearchParams>
}

const EventsList = async ({ searchParams }: EventsListProps) => {
  await connectToDatabase()

  const query: Record<string, unknown> = {}

  // Search by title or description
  if (searchParams.q) {
    query.$or = [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } },
      { tags: { $in: [new RegExp(searchParams.q, 'i')] } }
    ]
  }

  // Filter by category (tags)
  if (searchParams.category && searchParams.category !== 'All') {
    query.tags = searchParams.category
  }

  // Filter by location
  if (searchParams.location) {
    query.location = { $regex: searchParams.location, $options: 'i' }
  }

  // Build sort query
  const sortQuery: Record<string, 1 | -1> = { date: -1, time: -1 }
  if (searchParams.sortBy === 'oldest') {
    sortQuery.date = 1
    sortQuery.time = 1
  } else if (searchParams.sortBy === 'alphabetical') {
    sortQuery.date = 1
    sortQuery.time = 1
    sortQuery.title = 1
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawEvents = await Event.find(query).sort(sortQuery as any).lean()

  const events: IEvent[] = rawEvents.map((e) => ({
    ...(e as unknown as IEvent),
    _id: String(e._id),
    createdAt: e.createdAt ? String(e.createdAt) : '',
    updatedAt: e.updatedAt ? String(e.updatedAt) : '',
  }))

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
        <div>
          <p className="text-white/70 mb-4">{events.length} events found</p>
          <ul className="events">
            {events.map((event: IEvent) => (
              <li key={event.slug} className="list-none">
                <EventCard {...event} time={event.time ?? ''} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const EventsContent = async ({ searchParams }: EventsPageProps) => {
  const resolvedSearchParams = await searchParams
  return <EventsList searchParams={resolvedSearchParams} />
}

const EventsPage = ({ searchParams }: EventsPageProps) => {
  return (
    <section className="pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <Suspense fallback={<div className="text-center py-12"><p>Loading events...</p></div>}>
          <EventsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}

export default EventsPage

