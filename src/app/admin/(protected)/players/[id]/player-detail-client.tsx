'use client'

import { useState } from 'react'
import { updatePbpiGrading, addAchievement, deleteAchievement } from '../actions'

const PBPI_OPTIONS = ['beginner', 'low_bronze', 'high_bronze', 'low_silver', 'high_silver', 'gold', 'platinum']
const FINISH_OPTIONS = ['CHAMPION', 'RUNNER_UP', 'SEMIFINAL', 'QUARTERFINAL']

export function PlayerDetailClient({ user, profile, achievements, auditLog, membership }: {
  user: any; profile: any; achievements: any[]; auditLog: any[]; membership: any
}) {
  const [pbpi, setPbpi] = useState(profile?.pbpi_grading || '')
  const [pbpiLoading, setPbpiLoading] = useState(false)
  const [showAchForm, setShowAchForm] = useState(false)
  const [achLoading, setAchLoading] = useState(false)
  const [achError, setAchError] = useState('')

  async function handlePbpiSave() {
    setPbpiLoading(true)
    await updatePbpiGrading(user.id, pbpi)
    setPbpiLoading(false)
  }

  async function handleAchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAchLoading(true)
    setAchError('')
    const formData = new FormData(e.currentTarget)
    formData.set('user_id', user.id)
    const result = await addAchievement(formData)
    setAchLoading(false)
    if (result.error) { setAchError(result.error); return }
    setShowAchForm(false)
  }

  async function handleDeleteAch(id: string) {
    if (!confirm('Delete this achievement?')) return
    await deleteAchievement(id, user.id)
  }

  return (
    <div className="space-y-6">
      {/* Player Info Card */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-400">MMR</span>
              <p className="text-2xl font-bold">{profile?.mmr ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Games Played</span>
              <p className="text-2xl font-bold">{profile?.games_played ?? 0}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Win Rate</span>
              <p className="text-2xl font-bold">
                {profile && profile.games_played > 0
                  ? Math.round((profile.wins / profile.games_played) * 100)
                  : 0}%
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Club</span>
              <p className="text-lg font-medium">{membership?.organizations?.name || 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PBPI Grading */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">PBPI Grading</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-3">
            <select className="form-select w-48" value={pbpi} onChange={(e) => setPbpi(e.target.value)}>
              <option value="">Not set</option>
              {PBPI_OPTIONS.map((o) => (
                <option key={o} value={o}>{o.replace('_', ' ')}</option>
              ))}
            </select>
            <button onClick={handlePbpiSave} disabled={pbpiLoading} className="btn-primary btn-sm">
              {pbpiLoading ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tournament Achievements</h2>
          <button onClick={() => setShowAchForm(!showAchForm)} className="btn-primary btn-sm">
            {showAchForm ? 'Cancel' : '+ Add Achievement'}
          </button>
        </div>
        <div className="card-body">
          {showAchForm && (
            <form onSubmit={handleAchSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              {achError && <div className="text-red-600 text-sm">{achError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Tournament Name *</label>
                  <input name="tournament_name" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Date *</label>
                  <input name="achievement_date" type="date" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Finish Position *</label>
                  <select name="finish_position" className="form-select" required>
                    {FINISH_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Display Text</label>
                  <input name="display_text" className="form-input" placeholder="Optional custom text" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="is_featured" type="checkbox" /> Featured achievement
              </label>
              <button type="submit" disabled={achLoading} className="btn-primary btn-sm">
                {achLoading ? 'Adding...' : 'Add Achievement'}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <span className={`badge ${
                    a.finish_position === 'CHAMPION' ? 'badge-green' :
                    a.finish_position === 'RUNNER_UP' ? 'badge-blue' : 'badge-gray'
                  } mr-2`}>
                    {a.finish_position.replace('_', ' ')}
                  </span>
                  <span className="font-medium">{a.tournament_name}</span>
                  <span className="text-gray-400 text-xs ml-2">{a.achievement_date}</span>
                  {a.is_featured && <span className="text-yellow-500 ml-1">★</span>}
                </div>
                <button onClick={() => handleDeleteAch(a.id)} className="text-red-400 hover:text-red-600 text-xs">
                  Delete
                </button>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-gray-400 text-sm">No achievements yet</p>
            )}
          </div>
        </div>
      </div>

      {/* MMR Audit Trail */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">MMR Audit Trail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Before</th><th>After</th><th>Change</th><th>Source</th><th>Notes</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLog.map((log: any) => {
                const change = (log.mmr_after || 0) - (log.mmr_before || 0)
                return (
                  <tr key={log.id}>
                    <td className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="font-mono">{log.mmr_before}</td>
                    <td className="font-mono">{log.mmr_after}</td>
                    <td className={`font-mono font-bold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : ''}`}>
                      {change > 0 ? '+' : ''}{change}
                    </td>
                    <td><span className="badge badge-gray text-xs">{log.trigger_source}</span></td>
                    <td className="text-xs text-gray-400 max-w-48 truncate">{log.notes || '—'}</td>
                  </tr>
                )
              })}
              {auditLog.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-4">No MMR changes recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
