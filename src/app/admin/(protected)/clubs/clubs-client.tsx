'use client'

import { useState } from 'react'
import { updateClubLiga } from './actions'

const LIGA_LABELS: Record<string, string> = { liga1: 'Liga 1 Men', liga1_women: 'Liga 1 Women', liga2: 'Liga 2' }
const GROUPS = [
  { key: 'liga1', label: 'Liga 1 (Men)' },
  { key: 'liga1_women', label: 'Liga 1 (Women)' },
  { key: 'liga2', label: 'Liga 2 (Open)' },
  { key: 'none', label: 'Unassigned' },
]

export function ClubsClient({ clubs }: { clubs: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleLigaChange(orgId: string, liga: string) {
    setLoading(orgId)
    await updateClubLiga(orgId, liga === '' ? null : liga)
    setLoading(null)
  }

  const grouped = GROUPS.map((g) => ({
    ...g,
    clubs: clubs.filter((c) => g.key === 'none' ? !c.liga : c.liga === g.key),
  }))

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.key}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {group.label} <span className="text-sm font-normal text-gray-400">({group.clubs.length} clubs)</span>
          </h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>Club</th><th>Captain</th><th>Members</th><th>Province</th><th>Liga</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {group.clubs.map((c) => (
                    <tr key={c.id}>
                      <td className="font-medium">{c.name}</td>
                      <td>
                        <div className="text-sm">{c.users?.name || '—'}</div>
                        <div className="text-xs text-gray-400">{c.users?.phone || ''}</div>
                      </td>
                      <td>{c.memberCount}</td>
                      <td className="text-gray-500">{c.province || '—'}</td>
                      <td>
                        <select
                          className="form-select text-xs w-36"
                          value={c.liga || ''}
                          onChange={(e) => handleLigaChange(c.id, e.target.value)}
                          disabled={loading === c.id}
                        >
                          <option value="">Unassigned</option>
                          <option value="liga1">Liga 1 (Men)</option>
                          <option value="liga1_women">Liga 1 (Women)</option>
                          <option value="liga2">Liga 2 (Open)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {group.clubs.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-gray-400 py-4">No clubs</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
