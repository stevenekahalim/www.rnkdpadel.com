'use client'

import { useRouter } from 'next/navigation'

const LIGA_LABELS: Record<string, string> = { liga1: 'Liga 1 Men', liga1_women: 'Liga 1 Women', liga2: 'Liga 2' }

export function StandingsClient({ seasons, standings, selectedSeasonId, selectedSeason }: {
  seasons: any[]; standings: any[]; selectedSeasonId: string; selectedSeason?: any
}) {
  const router = useRouter()

  return (
    <>
      {/* Season selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {seasons.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/admin/liga/standings?seasonId=${s.id}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              s.id === selectedSeasonId ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {selectedSeason && (
        <div className="mb-4 text-sm text-gray-500">
          {LIGA_LABELS[selectedSeason.liga] || selectedSeason.liga} &bull; Status: <span className="font-medium">{selectedSeason.status}</span>
        </div>
      )}

      {/* Standings table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-12">Pos</th>
                <th>Club</th>
                <th className="text-center">P</th>
                <th className="text-center">W</th>
                <th className="text-center">D</th>
                <th className="text-center">L</th>
                <th className="text-center">MW</th>
                <th className="text-center">ML</th>
                <th className="text-center font-bold">Pts</th>
                <th className="text-center">GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {standings.map((s, i) => (
                <tr key={s.id} className={i < 2 ? 'bg-green-50' : ''}>
                  <td className="font-bold text-center">{s.position || i + 1}</td>
                  <td className="font-medium">{s.organizations?.name || '—'}</td>
                  <td className="text-center">{s.fixtures_played}</td>
                  <td className="text-center">{s.fixtures_won}</td>
                  <td className="text-center">{s.fixtures_drawn}</td>
                  <td className="text-center">{s.fixtures_lost}</td>
                  <td className="text-center text-green-600">{s.matches_won}</td>
                  <td className="text-center text-red-600">{s.matches_lost}</td>
                  <td className="text-center font-bold text-lg">{s.points}</td>
                  <td className="text-center">{(s.games_difference ?? 0) > 0 ? '+' : ''}{s.games_difference ?? 0}</td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr><td colSpan={10} className="text-center text-gray-400 py-8">No standings data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {standings.length > 0 && (
        <div className="mt-4 text-xs text-gray-400">
          P = Played, W = Won, D = Drawn, L = Lost, MW = Matches Won, ML = Matches Lost, Pts = Points, GD = Games Difference.
          Top 2 positions highlighted. Standings are auto-calculated by database triggers when fixtures are completed.
        </div>
      )}
    </>
  )
}
