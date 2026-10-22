'use client'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import posthog from 'posthog-js'

export const CATEGORIES = [
  'All',
  'Hackathon',
  'Meetup',
  'Conference',
  'Workshop',
  'Webinar',
  'Summit'
]

const EventSearch = () => {
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "All");
  const [location, setLocation] = useState(sp.get("location") ?? "");
  const [sortBy, setSortBy] = useState(sp.get("sortBy") ?? "soonest");
  const [when, setWhen] = useState(sp.get("when") ?? "upcoming");
  const router = useRouter()

  const handleSearch = useCallback(() => {
    posthog.capture('event_search_performed', {
      query,
      category: category !== 'All' ? category : undefined,
      location,
      sortBy,
      when // Added tracking element
    })

    const params = new URLSearchParams()
    if (when) params.set('when', when)
    if (query) params.set('q', query)
    if (category && category !== 'All') params.set('category', category)
    if (location) params.set('location', location)
    if (sortBy) params.set('sortBy', sortBy)

    router.push(`/events?\${params.toString()}`)
  }, [query, category, location, sortBy, when, router]) // Added "when" dependency

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-white/50" size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          Search
        </button>
      </div>

      {/* Filters (Changed grid layout to support 4 columns cleanly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* When Filter */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Timeframe</label>
          <select
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
          >
            <option value="upcoming" className="bg-gray-900">Upcoming</option>
            <option value="past" className="bg-gray-900">Past</option>
            <option value="all" className="bg-gray-900">All</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Location</label>
          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
          >
            <option value="soonest" className="bg-gray-900">Soonest first</option>
            <option value="newest" className="bg-gray-900">Recently added</option>
            <option value="alphabetical" className="bg-gray-900">A - Z</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default EventSearch
