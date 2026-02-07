'use client'

import { useState } from 'react'
import { SeasonForm } from './season-form'
import { updateSeasonStatus } from './actions'

const LIGA_LABELS: Record<string, string> = {
  liga1: 'Liga 1 Men',
  liga1_women: 'Liga 1 Women',
  liga2: 'Liga 2',
}

const STATUS_BADGE: Record<string, string> = {
  upcoming: 'badge-blue',
  registration: 'badge-yellow',
  active: 'badge-green',
  completed: 'badge-gray',
  cancelled: 'badge-red',
}

export function SeasonsClient({ seasons }: { seasons: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editSeason, setEditSeason] = useState<any>(null)

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => { setEditSeason(null); setShowForm(true) }} className="btn-primary">+ Create Season</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Liga</th><th>Status</th><th>Start</th><th>End</th><th>Config</th><th>Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {seasons.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td><span className="badge badge-blue">{LIGA_LABELS[s.liga] || s.liga}</span></td>
                  <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-gray'}`}>{s.status}</span></td>
                  <td className="text-gray-500 text-xs">{s.start_date}</td>
                  <td className="text-gray-500 text-xs">{s.end_date}</td>
                  <td className="text-gray-500 text-xs">{s.matches_per_fixture}m / {s.sets_per_match}s / {s.games_per_set}g</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditSeason(s); setShowForm(true) }} className="btn-secondary btn-sm">Edit</button>
                      {s.status === 'upcoming' && (
                        <button onClick={() => updateSeasonStatus(s.id, 'registration')} className="btn-success btn-sm">Open Reg</button>
                      )}
                      {s.status === 'registration' && (
                        <button onClick={() => updateSeasonStatus(s.id, 'active')} className="btn-success btn-sm">Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {seasons.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">No seasons yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <SeasonForm season={editSeason} onClose={() => setShowForm(false)} />}
    </>
  )
}
