'use client'

import { useState } from 'react'
import { createFixture } from './actions'

interface Club {
  id: string
  name: string
}

interface FixtureFormProps {
  seasonId: string
  gameweek: number
  clubs: Club[]
  onClose: () => void
  onSuccess: () => void
}

export function FixtureForm({ seasonId, gameweek, clubs, onClose, onSuccess }: FixtureFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [homeClubId, setHomeClubId] = useState('')
  const [awayClubId, setAwayClubId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [venueName, setVenueName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!homeClubId || !awayClubId) {
      setError('Please select both home and away clubs')
      return
    }

    if (homeClubId === awayClubId) {
      setError('Home and away clubs must be different')
      return
    }

    if (!scheduledDate || !scheduledTime || !venueName) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('seasonId', seasonId)
      formData.append('homeClubId', homeClubId)
      formData.append('awayClubId', awayClubId)
      formData.append('gameweek', gameweek.toString())
      formData.append('scheduledDate', scheduledDate)
      formData.append('scheduledTime', scheduledTime)
      formData.append('venueName', venueName)

      const result = await createFixture(formData)

      if (!result.success) {
        setError(result.error || 'Failed to create fixture')
        return
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const availableAwayClubs = clubs.filter((c) => c.id !== homeClubId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add Fixture - Gameweek {gameweek}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="home-club" className="form-label">
              Home Club
            </label>
            <select
              id="home-club"
              className="form-select"
              value={homeClubId}
              onChange={(e) => setHomeClubId(e.target.value)}
            >
              <option value="">Select home club...</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="away-club" className="form-label">
              Away Club
            </label>
            <select
              id="away-club"
              className="form-select"
              value={awayClubId}
              onChange={(e) => setAwayClubId(e.target.value)}
            >
              <option value="">Select away club...</option>
              {availableAwayClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="form-label">
              Scheduled Date
            </label>
            <input
              id="date"
              type="date"
              className="form-input"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="time" className="form-label">
              Scheduled Time
            </label>
            <input
              id="time"
              type="time"
              className="form-input"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="venue" className="form-label">
              Venue Name
            </label>
            <input
              id="venue"
              type="text"
              className="form-input"
              placeholder="e.g., Central Court"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Fixture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
