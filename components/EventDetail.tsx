'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, MapPin, Calendar, Clock, Users, ArrowLeft } from 'lucide-react'
import posthog from 'posthog-js'

interface EventDetailProps {
  slug: string
}

const EventDetail = ({ slug }: EventDetailProps) => {
  const [isFavorited, setIsFavorited] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      const fav = JSON.parse(saved)
      setFavorites(fav)
      setIsFavorited(fav.includes(slug))
    }
  }, [slug])

  const handleFavorite = () => {
    const newFavorites = isFavorited
      ? favorites.filter((f) => f !== slug)
      : [...favorites, slug]

    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setFavorites(newFavorites)
    setIsFavorited(!isFavorited)

    posthog.capture('event_favorited', {
      slug,
      favorited: !isFavorited,
    })
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Check out this event',
        text: 'Join me at this amazing dev event!',
        url: window.location.href,
      })
      posthog.capture('event_shared', { slug })
    } catch (err) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Event link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link href="/events" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="flex gap-4">
          <button
            onClick={handleFavorite}
            className={`p-3 rounded-lg transition ${
              isFavorited
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-white/70 border border-white/20 hover:text-white'
            }`}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-lg bg-white/5 text-white/70 border border-white/20 hover:text-white transition"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
