'use client'

import { useState, useEffect } from 'react'
import { assignPlayers } from './actions'

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  match_number: number
  home_player1_id: string | null
  home_player2_id: string | null
  away_player1_id: string | null
  away_player2_id: string | null
}

interface Fixture {
  id: string
  home_club_name: string
  away_club_name: string
}

interface PlayerAssignmentProps {
  fixture: Fixture
  matches: Match[]
  homeMembers: Player[]
  awayMembers: Player[]
}

export function PlayerAssignment({
  fixture,
  matches,
  homeMembers,
  awayMembers,
}: PlayerAssignmentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<number, {
    homePlayer1Id: string
    homePlayer2Id: string
    awayPlayer1Id: string
    awayPlayer2Id: string
  }>>({})
  const [warnings, setWarnings] = useState<string[]>([])

  useEffect(() => {
    // Initialize assignments from existing data
    const init: Record<number, any> = {}
    matches.forEach((match) => {
      init[match.match_number] = {
        homePlayer1Id: match.home_player1_id || '',
        homePlayer2Id: match.home_player2_id || '',
        awayPlayer1Id: match.away_player1_id || '',
        awayPlayer2Id: match.away_player2_id || '',
      }
    })
    setAssignments(init)
  }, [matches])

  const handlePlayerChange = (matchNumber: number, field: string, value: string) => {
    setAssignments((prev) => ({
      ...prev,
      [matchNumber]: {
        ...prev[matchNumber],
        [field]: value,
      },
    }))
  }

  const validateAssignments = () => {
    const newWarnings: string[] = []
    const allPlayers: Record<string, number> = {}

    Object.entries(assignments).forEach(([matchNum, assignment]) => {
      // Check if all players are assigned
      if (!assignment.homePlayer1Id || !assignment.homePlayer2Id || !assignment.awayPlayer1Id || !assignment.awayPlayer2Id) {
        newWarnings.push(`Match ${matchNum}: Not all players assigned`)
        return
      }

      // Track players for duplicate warnings
      ;[assignment.homePlayer1Id, assignment.homePlayer2Id, assignment.awayPlayer1Id, assignment.awayPlayer2Id].forEach(
        (playerId) => {
          allPlayers[playerId] = (allPlayers[playerId] || 0) + 1
        }
      )
    })

    // Warn about players in multiple matches
    Object.entries(allPlayers).forEach(([playerId, count]) => {
      if (count > 1) {
        const player = [...homeMembers, ...awayMembers].find((p) => p.id === playerId)
        if (player) {
          newWarnings.push(`${player.name} appears in ${count} matches (limited squad?)`)
        }
      }
    })

    setWarnings(newWarnings)
    return newWarnings.filter((w) => w.includes('Not all players')).length === 0
  }

  const handleSubmit = async () => {
    setError(null)

    if (!validateAssignments()) {
      return
    }

    try {
      setLoading(true)

      const assignmentsList = matches.map((match) => ({
        matchNumber: match.match_number,
        homePlayer1Id: assignments[match.match_number]?.homePlayer1Id || '',
        homePlayer2Id: assignments[match.match_number]?.homePlayer2Id || '',
        awayPlayer1Id: assignments[match.match_number]?.awayPlayer1Id || '',
        awayPlayer2Id: assignments[match.match_number]?.awayPlayer2Id || '',
      }))

      const result = await assignPlayers(fixture.id, assignmentsList)

      if (!result.success) {
        setError(result.error || 'Failed to assign players')
        return
      }

      // Trigger page refresh
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            {fixture.home_club_name} vs {fixture.away_club_name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Assign Players to Matches</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          <p className="font-medium mb-1">Warnings:</p>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {matches.map((match) => {
          const assignment = assignments[match.match_number]
          if (!assignment) return null

          const homePlayer1 = homeMembers.find((p) => p.id === assignment.homePlayer1Id)
          const homePlayer2 = homeMembers.find((p) => p.id === assignment.homePlayer2Id)
          const awayPlayer1 = awayMembers.find((p) => p.id === assignment.awayPlayer1Id)
          const awayPlayer2 = awayMembers.find((p) => p.id === assignment.awayPlayer2Id)

          return (
            <div key={match.id} className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Match {match.match_number}
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* Home Team */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {fixture.home_club_name}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`h1-m${match.match_number}`} className="form-label text-xs">
                          Player 1
                        </label>
                        <select
                          id={`h1-m${match.match_number}`}
                          className="form-select text-sm"
                          value={assignment.homePlayer1Id}
                          onChange={(e) =>
                            handlePlayerChange(match.match_number, 'homePlayer1Id', e.target.value)
                          }
                        >
                          <option value="">Select player...</option>
                          {homeMembers.map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        {homePlayer1 && (
                          <p className="text-xs text-green-600 mt-1">✓ {homePlayer1.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`h2-m${match.match_number}`} className="form-label text-xs">
                          Player 2
                        </label>
                        <select
                          id={`h2-m${match.match_number}`}
                          className="form-select text-sm"
                          value={assignment.homePlayer2Id}
                          onChange={(e) =>
                            handlePlayerChange(match.match_number, 'homePlayer2Id', e.target.value)
                          }
                        >
                          <option value="">Select player...</option>
                          {homeMembers.map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        {homePlayer2 && (
                          <p className="text-xs text-green-600 mt-1">✓ {homePlayer2.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {fixture.away_club_name}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`a1-m${match.match_number}`} className="form-label text-xs">
                          Player 1
                        </label>
                        <select
                          id={`a1-m${match.match_number}`}
                          className="form-select text-sm"
                          value={assignment.awayPlayer1Id}
                          onChange={(e) =>
                            handlePlayerChange(match.match_number, 'awayPlayer1Id', e.target.value)
                          }
                        >
                          <option value="">Select player...</option>
                          {awayMembers.map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        {awayPlayer1 && (
                          <p className="text-xs text-green-600 mt-1">✓ {awayPlayer1.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`a2-m${match.match_number}`} className="form-label text-xs">
                          Player 2
                        </label>
                        <select
                          id={`a2-m${match.match_number}`}
                          className="form-select text-sm"
                          value={assignment.awayPlayer2Id}
                          onChange={(e) =>
                            handlePlayerChange(match.match_number, 'awayPlayer2Id', e.target.value)
                          }
                        >
                          <option value="">Select player...</option>
                          {awayMembers.map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        {awayPlayer2 && (
                          <p className="text-xs text-green-600 mt-1">✓ {awayPlayer2.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 btn btn-primary"
        >
          {loading ? 'Saving...' : 'Save Assignments'}
        </button>
      </div>
    </div>
  )
}
