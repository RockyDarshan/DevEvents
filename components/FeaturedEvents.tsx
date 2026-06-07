'use client'
import { useEffect, useState } from 'react'
import EventCard from '@/components/EventCard'

interface FeaturedEvent {
  slug: string
  title: string
  image: string
  location: string
  date: string
  time: string
  description: string
  overview: string
  venue: string
  mode: string
  audience: string
  organizer: string
  tags: string[]
}

const FeaturedEvents = () => {
  const [events, setEvents] = useState<FeaturedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to load events')
        }
        const data = await response.json()
        setEvents((data.events ?? []).slice(0, 6))
      } catch {
        setError('Unable to load events at the moment.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return <p className="text-center text-white/70 py-12">Loading featured events...</p>
  }

  if (error) {
    return <p className="text-center text-red-400 py-12">{error}</p>
  }

  if (events.length === 0) {
    return <p className="text-center text-white/70 py-12">No events are available right now.</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold">Featured Events</h3>
      </div>
      <ul className="events grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <li key={event.slug} className="list-none">
            <EventCard {...event} time={event.time ?? ''} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FeaturedEvents
