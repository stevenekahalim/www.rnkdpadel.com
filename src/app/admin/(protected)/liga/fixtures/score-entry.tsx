'use client'

import { useState, useEffect } from 'react'
import { enterScores } from './actions'

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  match_number: number
  home_player1_id: string
  home_player2_id: string
  away_player1_id: string
  away_player2_id: string
  home_sets_won: number | null
  away_sets_won: number | null
  set1_home_games: number | null
  set1_away_games: number | null
  set2_home_games: number | null
  set2_away_games: number | null
  set3_home_games: number | null
  set3_away_games: number | null
}

interface Fixture {
  id: string
  home_club_name: string
  away_club_name: string
}

interface PlayerMap {
  [playerId: string]: string
}

interface ScoreEntryProps {
  fixture: Fixture
  matches: Match[]
  playerMap: PlayerMap
}

export function ScoreEntry({ fixture, matches, playerMap }: ScoreEntryProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [scores, setScores] = useState<Record<number, {
    set1Home: number
    set1Away: number
    set2Home: number
    set2Away: number
    set3Home?: number
    set3Away?: number
    homeSetsWon: number
    awaySetsWon: number
  }>>({})

  useEffect(() => {
    // Initialize scores from existing data
    const init: Record<number, any> = {}
    matches.forEach((match) => {
      init[match.match_number] = {
        set1Home: match.set1_home_games ?? 0,
        set1Away: match.set1_away_games ?? 0,
        set2Home: match.set2_home_games ?? 0,
        set2Away: match.set2_away_games ?? 0,
        set3Home: match.set3_home_games ?? 0,
        set3Away: match.set3_away_games ?? 0,
        homeSetsWon: match.home_sets_won ?? 0,
        awaySetsWon: match.away_sets_won ?? 0,
      }
    })
    setScores(init)
  }, [matches])

  const handleScoreChange = (matchNumber: number, field: string, value: string) => {
    const numValue = parseInt(value) || 0
    const currentScore = scores[matchNumber] || {}

    let newScore = {
      ...currentScore,
      [field]: numValue,
    }

    // Auto-calculate sets won
    const set1Home = newScore.set1Home
    const set1Away = newScore.set1Away
    const set2Home = newScore.set2Home
    const set2Away = newScore.set2Away

    let homeSetsWon = 0
    let awaySetsWon = 0

    // Count set 1
    if (set1Home > set1Away) homeSetsWon++
    else if (set1Away > set1Home) awaySetsWon++

    // Count set 2
    if (set2Home > set2Away) homeSetsWon++
    else if (set2Away > set2Home) awaySetsWon++

    newScore.homeSetsWon = homeSetsWon
    newScore.awaySetsWon = awaySetsWon

    setScores((prev) => ({
      ...prev,
      [matchNumber]: newScore,
    }))
  }

  const matchesCompleted = matches.filter((m) => {
    const score = scores[m.match_number]
    if (!score) return false
    const hasSets12 = score.set1Home > 0 && score.set1Away > 0 && score.set2Home > 0 && score.set2Away > 0
    if (!hasSets12) return false
    // If sets are tied 1-1, Set 3 must also be filled
    const needsSet3 = score.homeSetsWon === 1 && score.awaySetsWon === 1
    if (needsSet3) {
      return (score.set3Home ?? 0) > 0 && (score.set3Away ?? 0) > 0
    }
    return true
  }).length

  const allMatches = matches.length
  const isFullyComplete = matchesCompleted === allMatches

  const calculateFixtureScore = () => {
    let homeMatches = 0
    let awayMatches = 0

    Object.entries(scores).forEach(([, score]) => {
      if ((score.homeSetsWon ?? 0) > (score.awaySetsWon ?? 0)) {
        homeMatches++
      } else if ((score.awaySetsWon ?? 0) > (score.homeSetsWon ?? 0)) {
        awayMatches++
      }
    })

    return { homeMatches, awayMatches }
  }

  const getPlayerName = (playerId: string): string => {
    return playerMap[playerId] || 'Unknown'
  }

  const needsSet3 = (matchNumber: number) => {
    const score = scores[matchNumber]
    if (!score) return false
    return score.homeSetsWon === 1 && score.awaySetsWon === 1
  }

  const shouldDisableSet3 = (matchNumber: number) => {
    const score = scores[matchNumber]
    if (!score) return true
    return !(score.homeSetsWon === 1 && score.awaySetsWon === 1)
  }

  const handleSubmit = async () => {
    if (!isFullyComplete) {
      setError('All sets for all matches must be completed')
      return
    }

    setShowPreview(true)
  }

  const handleConfirmAndSave = async () => {
    setError(null)

    try {
      setLoading(true)

      const scoresList = matches.map((match) => {
        const score = scores[match.match_number]
        return {
          matchNumber: match.match_number,
          set1Home: score?.set1Home || 0,
          set1Away: score?.set1Away || 0,
          set2Home: score?.set2Home || 0,
          set2Away: score?.set2Away || 0,
          set3Home: needsSet3(match.match_number) ? (score?.set3Home || 0) : undefined,
          set3Away: needsSet3(match.match_number) ? (score?.set3Away || 0) : undefined,
          homeSetsWon: score?.homeSetsWon || 0,
          awaySetsWon: score?.awaySetsWon || 0,
        }
      })

      const result = await enterScores(fixture.id, scoresList)

      if (!result.success) {
        setError(result.error || 'Failed to save scores')
        return
      }

      // Show success message
      alert('Scores saved successfully! The fixture has been updated.')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showPreview) {
    const { homeMatches, awayMatches } = calculateFixtureScore()

    return (
      <div>
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Fixture Summary</h2>
          </div>
          <div className="card-body space-y-4">
            {matches.map((match) => {
              const score = scores[match.match_number]
              if (!score) return null

              const homeWins = score.homeSetsWon > score.awaySetsWon
              const awayWins = score.awaySetsWon > score.homeSetsWon

              return (
                <div key={match.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Match {match.match_number}: {getPlayerName(match.home_player1_id)} + {getPlayerName(match.home_player2_id)} vs{' '}
                    {getPlayerName(match.away_player1_id)} + {getPlayerName(match.away_player2_id)}
                  </p>
                  <div className="text-sm text-gray-700">
                    <span className={homeWins ? 'font-semibold text-green-600' : 'text-gray-600'}>
                      Home wins {score.homeSetsWon}-{score.awaySetsWon}
                    </span>
                    {' - '}
                    <span className="text-gray-500 font-mono">
                      Sets: {score.set1Home}-{score.set1Away}, {score.set2Home}-{score.set2Away}
                      {needsSet3(match.match_number) ? `, ${score.set3Home}-${score.set3Away}` : ''}
                    </span>
                  </div>
                </div>
              )
            })}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-lg font-semibold text-blue-900">
                Fixture Result: {fixture.home_club_name} {homeMatches} - {awayMatches} {fixture.away_club_name}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 btn btn-secondary"
                disabled={loading}
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirmAndSave}
                disabled={loading}
                className="flex-1 btn btn-success"
              >
                {loading ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            {fixture.home_club_name} vs {fixture.away_club_name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {matchesCompleted}/{allMatches} matches completed
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {matches.map((match) => {
          const score = scores[match.match_number]
          if (!score) return null

          const set3Needed = needsSet3(match.match_number)
          const set3Disabled = shouldDisableSet3(match.match_number)

          return (
            <div key={match.id} className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Match {match.match_number}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {getPlayerName(match.home_player1_id)} + {getPlayerName(match.home_player2_id)} vs{' '}
                  {getPlayerName(match.away_player1_id)} + {getPlayerName(match.away_player2_id)}
                </p>

                <div className="space-y-3">
                  {/* Set 1 */}
                  <div className="flex items-center gap-2">
                    <label htmlFor={`s1h-m${match.match_number}`} className="text-sm font-medium text-gray-700 w-16">
                      Set 1:
                    </label>
                    <input
                      id={`s1h-m${match.match_number}`}
                      type="number"
                      min="0"
                      max="6"
                      className="form-input w-20 text-center"
                      value={score.set1Home}
                      onChange={(e) =>
                        handleScoreChange(match.match_number, 'set1Home', e.target.value)
                      }
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      id={`s1a-m${match.match_number}`}
                      type="number"
                      min="0"
                      max="6"
                      className="form-input w-20 text-center"
                      value={score.set1Away}
                      onChange={(e) =>
                        handleScoreChange(match.match_number, 'set1Away', e.target.value)
                      }
                    />
                  </div>

                  {/* Set 2 */}
                  <div className="flex items-center gap-2">
                    <label htmlFor={`s2h-m${match.match_number}`} className="text-sm font-medium text-gray-700 w-16">
                      Set 2:
                    </label>
                    <input
                      id={`s2h-m${match.match_number}`}
                      type="number"
                      min="0"
                      max="6"
                      className="form-input w-20 text-center"
                      value={score.set2Home}
                      onChange={(e) =>
                        handleScoreChange(match.match_number, 'set2Home', e.target.value)
                      }
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      id={`s2a-m${match.match_number}`}
                      type="number"
                      min="0"
                      max="6"
                      className="form-input w-20 text-center"
                      value={score.set2Away}
                      onChange={(e) =>
                        handleScoreChange(match.match_number, 'set2Away', e.target.value)
                      }
                    />
                  </div>

                  {/* Set 3 (conditional) */}
                  {set3Needed && (
                    <div className="flex items-center gap-2">
                      <label htmlFor={`s3h-m${match.match_number}`} className="text-sm font-medium text-gray-700 w-16">
                        Set 3:
                      </label>
                      <input
                        id={`s3h-m${match.match_number}`}
                        type="number"
                        min="0"
                        max="6"
                        className="form-input w-20 text-center"
                        value={score.set3Home || 0}
                        onChange={(e) =>
                          handleScoreChange(match.match_number, 'set3Home', e.target.value)
                        }
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        id={`s3a-m${match.match_number}`}
                        type="number"
                        min="0"
                        max="6"
                        className="form-input w-20 text-center"
                        value={score.set3Away || 0}
                        onChange={(e) =>
                          handleScoreChange(match.match_number, 'set3Away', e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Result display */}
                  <div className="mt-3 p-3 bg-gray-100 rounded">
                    <p className="text-sm font-medium text-gray-700">
                      Result:{' '}
                      <span className="text-gray-900">
                        {score.homeSetsWon > score.awaySetsWon
                          ? `Home wins ${score.homeSetsWon}-${score.awaySetsWon}`
                          : score.awaySetsWon > score.homeSetsWon
                            ? `Away wins ${score.awaySetsWon}-${score.homeSetsWon}`
                            : `Tied ${score.homeSetsWon}-${score.awaySetsWon}`}
                      </span>
                    </p>
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
          disabled={loading || !isFullyComplete}
          className="flex-1 btn btn-primary"
        >
          {isFullyComplete ? 'Review & Save' : 'Complete all sets to continue'}
        </button>
      </div>
    </div>
  )
}
