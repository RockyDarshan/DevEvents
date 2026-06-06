'use client'
import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import posthog from 'posthog-js'

interface EventSearchProps {
  onSearch: (query: string, filters: { category?: string; location?: string; sortBy?: string }) => void
}

export const CATEGORIES = [
  'All',
  'Hackathon',
  'Meetup',
  'Conference',
  'Workshop',
  'Webinar',
  'Summit'
]

const EventSearch = ({ onSearch }: EventSearchProps) => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const handleSearch = useCallback(() => {
    posthog.capture('event_search_performed', {
      query,
      category: category !== 'All' ? category : undefined,
      location,
      sortBy
    })

    onSearch(query, {
      category: category !== 'All' ? category : undefined,
      location,
      sortBy
    })
  }, [query, category, location, sortBy, onSearch])

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
            onKeyPress={handleKeyPress}
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="recent" className="bg-gray-900">Newest First</option>
            <option value="oldest" className="bg-gray-900">Oldest First</option>
            <option value="alphabetical" className="bg-gray-900">A - Z</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default EventSearch
