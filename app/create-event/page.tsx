'use client'
import { useState } from 'react'
import { AlertCircle, CheckCircle, Upload } from 'lucide-react'
import posthog from 'posthog-js'
import { CATEGORIES } from '@/components/EventSearch'

const CreateEventPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    location: '',
    venue: '',
    date: '',
    time: '',
    mode: 'In-person',
    audience: '',
    organizer: '',
    tags: '',
    image: '',
    agenda: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.date ||
      !formData.time
    ) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      posthog.capture('event_creation_attempted', {
        title: formData.title,
        location: formData.location,
        mode: formData.mode,
      })

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()),
          agenda: formData.agenda
            .split('\n')
            .map((a) => a.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      setSuccess('Event created successfully! Redirecting...')
      posthog.capture('event_created', {
        title: formData.title,
        location: formData.location,
      })

      setTimeout(() => {
        window.location.href = '/events'
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      posthog.capture('event_creation_failed', { error: err })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Event</h1>
            <p className="text-white/70">
              Share your event with the dev community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
                <CheckCircle
                  size={20}
                  className="text-green-500 shrink-0 mt-0.5"
                />
                <p className="text-green-500">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript Summit 2025"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of your event..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition resize-none"
                />
              </div>

              {/* Overview */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Overview
                </label>
                <input
                  type="text"
                  name="overview"
                  value={formData.overview}
                  onChange={handleChange}
                  placeholder="Brief overview (one line)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Convention Center"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Mode
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition"
                >
                  <option value="In-person" className="bg-gray-900">
                    In-person
                  </option>
                  <option value="Online" className="bg-gray-900">
                    Online
                  </option>
                  <option value="Hybrid" className="bg-gray-900">
                    Hybrid
                  </option>
                </select>
              </div>

              {/* Organizer */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Your organization"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  placeholder="e.g., Beginners, All Levels"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, React, Web Development"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
                <p className="text-xs text-white/50 mt-2">Available categories: {CATEGORIES.join(', ')}</p>
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Event Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              {/* Agenda */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Agenda (one item per line)
                </label>
                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleChange}
                  placeholder="9:00 AM - Opening Keynote&#10;10:00 AM - Talks&#10;12:00 PM - Lunch"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating event...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default CreateEventPage
