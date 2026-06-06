'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Heart, Plus } from 'lucide-react'
import posthog from 'posthog-js'
import EventCard from '@/components/EventCard'
import { IEvent } from '@/database/event.model'

const ProfilePage = () => {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [events, setEvents] = useState<IEvent[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'created'>('profile')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Get favorites
    const favoriteData = localStorage.getItem('favorites')
    if (favoriteData) {
      setFavorites(JSON.parse(favoriteData))
    }

    // Fetch favorite events
    const fetchFavoriteEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        const favoriteEvents = data.events.filter((e: IEvent) =>
          favorites.includes(e.slug)
        )
        setEvents(favoriteEvents)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
      }
    }

    if (favorites.length > 0) {
      fetchFavoriteEvents()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    posthog.capture('user_logged_out')
    window.location.href = '/'
  }

  if (!user) {
    return (
      <section className="min-h-screen pt-20 pb-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/70">Please log in to view your profile</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Sign In
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <User size={32} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name || 'User'}</h1>
                  <p className="text-white/70">{user.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10">
            {(['profile', 'favorites', 'created'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-2">
                  <p className="text-white/50 text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-2">
                  <p className="text-white/50 text-sm">Member Since</p>
                  <p className="text-white font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-4">
                {loading ? (
                  <p className="text-white/50">Loading...</p>
                ) : events.length === 0 ? (
                  <p className="text-white/50">No favorite events yet</p>
                ) : (
                  <ul className="events">
                    {events.map((event) => (
                      <li key={event.slug} className="list-none">
                        <EventCard {...event} time={event.time ?? ''} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'created' && (
              <div className="space-y-4">
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <Plus size={20} />
                  Create New Event
                </Link>
                <p className="text-white/50">
                  Events you've created will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
