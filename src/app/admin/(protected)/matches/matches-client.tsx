'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VoidModal } from './void-modal'

interface Match {
  id: string
  type: string
  status: 'PENDING' | 'VERIFIED' | 'DISPUTED' | 'VOIDED'
  context_type: string
  context_id: string
  winner_side: number | null
  logged_by_user_id: string
  created_at: string
  voided_at: string | null
  voided_by: string | null
  voided_reason: string | null
  score_set_1_team_1: number | null
  score_set_1_team_2: number | null
  score_set_2_team_1: number | null
  score_set_2_team_2: number | null
  score_set_3_team_1: number | null
  score_set_3_team_2: number | null
}

interface PlayerTeams {
  team1: { id: string; name: string }[]
  team2: { id: string; name: string }[]
}

interface MatchesClientProps {
  matches: Match[]
  playerMap: Record<string, PlayerTeams>
  adminId: string
  filters: {
    status: string
    type: string
    fromDate: string | null
    toDate: string | null
    search: string | null
  }
  fetchError: string | null
}

const statusOptions = ['all', 'PENDING', 'VERIFIED', 'DISPUTED', 'VOIDED']
const typeOptions = ['all', 'ranked', 'liga_fixture']

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'VERIFIED': return 'badge-green'
    case 'PENDING': return 'badge-yellow'
    case 'DISPUTED': return 'badge-red'
    case 'VOIDED': return 'badge-gray'
    default: return 'badge-gray'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatScore = (match: Match) => {
  const s1 = `${match.score_set_1_team_1 ?? '-'}-${match.score_set_1_team_2 ?? '-'}`
  const s2 = match.score_set_2_team_1 != null
    ? `${match.score_set_2_team_1}-${match.score_set_2_team_2}`
    : null
  const s3 = match.score_set_3_team_1 != null
    ? `${match.score_set_3_team_1}-${match.score_set_3_team_2}`
    : null
  return [s1, s2, s3].filter(Boolean).join(' | ')
}

function buildSearchParams(overrides: Record<string, string | null>, current: MatchesClientProps['filters']) {
  const params = new URLSearchParams()
  const merged = {
    status: current.status,
    type: current.type,
    from: current.fromDate,
    to: current.toDate,
    search: current.search,
    ...overrides,
  }
  Object.entries(merged).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value)
  })
  return params.toString()
}

export function MatchesClient({ matches, playerMap, adminId, filters, fetchError }: MatchesClientProps) {
  const [voidingMatchId, setVoidingMatchId] = useState<string | null>(null)
  const { status, type, fromDate, toDate, search } = filters

  return (
    <>
      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body space-y-4">
          {/* Status Tabs */}
          <div>
            <label className="form-label">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <Link
                  key={opt}
                  href={`/admin/matches?${buildSearchParams({ status: opt }, filters)}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    status === opt
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt === 'all' ? 'All Statuses' : opt}
                </Link>
              ))}
            </div>
          </div>

          {/* Type and Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type-filter" className="form-label">Match Type</label>
              <select
                id="type-filter"
                className="form-select"
                value={type}
                onChange={(e) => {
                  window.location.href = `/admin/matches?${buildSearchParams({ type: e.target.value }, filters)}`
                }}
              >
                {typeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'all' ? 'All Types' : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="from-date" className="form-label">From Date</label>
              <input
                id="from-date"
                type="date"
                className="form-input"
                defaultValue={fromDate || ''}
                onChange={(e) => {
                  window.location.href = `/admin/matches?${buildSearchParams({ from: e.target.value || null }, filters)}`
                }}
              />
            </div>

            <div>
              <label htmlFor="to-date" className="form-label">To Date</label>
              <input
                id="to-date"
                type="date"
                className="form-input"
                defaultValue={toDate || ''}
                onChange={(e) => {
                  window.location.href = `/admin/matches?${buildSearchParams({ to: e.target.value || null }, filters)}`
                }}
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="search" className="form-label">Search by Player Name</label>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const input = form.querySelector('input') as HTMLInputElement
                window.location.href = `/admin/matches?${buildSearchParams({ search: input.value || null }, filters)}`
              }}
            >
              <input
                id="search"
                type="text"
                className="form-input"
                placeholder="Enter player name and press Enter..."
                defaultValue={search || ''}
              />
            </form>
          </div>
        </div>
      </div>

      {/* Matches Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Matches ({matches.length})
          </h2>
        </div>

        {fetchError && (
          <div className="card-body">
            <div className="text-red-600 text-sm">Error: {fetchError}</div>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="card-body text-center py-8">
            <div className="text-gray-400">No matches found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Players</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matches.map((match) => {
                  const teams = playerMap[match.id]
                  const team1Names = teams?.team1.map((u) => u.name).join(' + ') || '—'
                  const team2Names = teams?.team2.map((u) => u.name).join(' + ') || '—'

                  return (
                    <tr key={match.id}>
                      <td className="font-mono text-xs text-gray-500">
                        {match.id.slice(0, 8)}
                      </td>
                      <td className="text-sm">
                        <div className="font-medium text-gray-900">{team1Names}</div>
                        <div className="text-gray-500">vs</div>
                        <div className="font-medium text-gray-900">{team2Names}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue capitalize">
                          {match.context_type || 'ranked'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(match.status)}`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-gray-600">
                        {formatScore(match) || '—'}
                      </td>
                      <td className="text-xs text-gray-500">
                        {formatDate(match.created_at)}
                      </td>
                      <td className="space-x-2">
                        {match.status !== 'VOIDED' && (
                          <button
                            onClick={() => setVoidingMatchId(match.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Void
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Void Modal */}
      {voidingMatchId && (
        <VoidModal
          matchId={voidingMatchId}
          adminId={adminId}
          onClose={() => {
            setVoidingMatchId(null)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
