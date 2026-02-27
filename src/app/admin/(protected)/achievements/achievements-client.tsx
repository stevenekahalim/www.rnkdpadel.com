'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/status-badge'

interface Achievement {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  tournament_name: string
  finish_position: string
  finish_rank: number | null
  achievement_date: string
  display_text: string | null
  is_featured: boolean
  is_hidden: boolean
  notes: string | null
  created_at: string
}

export function AchievementsClient({
  achievements,
  tournamentNames,
}: {
  achievements: Achievement[]
  tournamentNames: string[]
}) {
  const [tournamentFilter, setTournamentFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = achievements.filter((a) => {
    const matchesTournament = !tournamentFilter || a.tournament_name === tournamentFilter
    const matchesSearch =
      !search ||
      a.user_name.toLowerCase().includes(search.toLowerCase()) ||
      a.tournament_name.toLowerCase().includes(search.toLowerCase())
    return matchesTournament && matchesSearch
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search player or tournament..."
          className="form-input w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
        >
          <option value="">All Tournaments</option>
          {tournamentNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filtered.length} achievement{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-4xl mb-3">🏅</p>
            <p className="text-gray-500 font-medium">No achievements found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || tournamentFilter
                ? 'Try adjusting your filters'
                : 'No player achievements recorded yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Tournament</th>
                <th>Result</th>
                <th>Date</th>
                <th>Featured</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {a.user_avatar ? (
                        <img
                          src={a.user_avatar}
                          className="w-7 h-7 rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                          {a.user_name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{a.user_name}</span>
                    </div>
                  </td>
                  <td className="text-gray-700">{a.tournament_name}</td>
                  <td>
                    <StatusBadge status={a.finish_position} />
                    {a.finish_rank && (
                      <span className="text-xs text-gray-400 ml-1.5">#{a.finish_rank}</span>
                    )}
                  </td>
                  <td className="text-gray-500 text-sm">
                    {new Date(a.achievement_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    {a.is_featured ? (
                      <StatusBadge status="yes" label="Featured" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
