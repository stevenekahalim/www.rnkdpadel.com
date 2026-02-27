'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/status-badge'

interface Tournament {
  id: string
  name: string
  slug: string
  venue_name: string | null
  start_date: string | null
  end_date: string | null
  format: string
  team_size: number
  max_teams: number
  status: string
  is_ranked: boolean
  created_at: string
}

export function TournamentsClient({ tournaments }: { tournaments: Tournament[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = tournaments.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.venue_name && t.venue_name.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or venue..."
          className="form-input w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="registration">Registration</option>
          <option value="group_stage">Group Stage</option>
          <option value="knockout">Knockout</option>
          <option value="completed">Completed</option>
        </select>
        <span className="text-sm text-gray-500">
          {filtered.length} tournament{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-500 font-medium">No tournaments found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No tournaments registered yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Venue</th>
                <th>Dates</th>
                <th>Format</th>
                <th>Teams</th>
                <th>Status</th>
                <th>Ranked</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-gray-500">
                    {t.venue_name || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-gray-500 text-xs">
                    {t.start_date && t.end_date ? (
                      <>
                        {new Date(t.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' → '}
                        {new Date(t.end_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </>
                    ) : t.start_date ? (
                      new Date(t.start_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={t.format} />
                  </td>
                  <td className="text-sm">
                    {t.team_size === 2 ? 'Doubles' : 'Singles'} · {t.max_teams}
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    {t.is_ranked ? (
                      <StatusBadge status="yes" label="Ranked" />
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
