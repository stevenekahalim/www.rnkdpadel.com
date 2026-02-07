'use client'

import { useState } from 'react'
import { createSeason, updateSeason } from './actions'

interface Season {
  id: string; name: string; slug: string; season_number: number; liga: string;
  province: string; start_date: string; end_date: string; registration_deadline?: string;
  status: string; matches_per_fixture: number; sets_per_match: number; games_per_set: number;
  description?: string; sponsor_name?: string; banner_url?: string; sponsor_logo_url?: string;
}

export function SeasonForm({ season, onClose }: { season?: Season; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = season ? await updateSeason(season.id, formData) : await createSeason(formData)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{season ? 'Edit Season' : 'Create Season'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Season Name *</label>
              <input name="name" className="form-input" required defaultValue={season?.name} placeholder="BRI Jatim Padel League 2026" />
            </div>
            <div>
              <label className="form-label">Liga Type *</label>
              <select name="liga" className="form-select" required defaultValue={season?.liga || 'liga1'}>
                <option value="liga1">Liga 1 (Men)</option>
                <option value="liga1_women">Liga 1 (Women)</option>
                <option value="liga2">Liga 2 (Open)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Season Number *</label>
              <input name="season_number" type="number" className="form-input" required defaultValue={season?.season_number || 1} min={1} />
            </div>
            <div>
              <label className="form-label">Province</label>
              <input name="province" className="form-input" defaultValue={season?.province || 'East Java'} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select name="status" className="form-select" defaultValue={season?.status || 'upcoming'}>
                <option value="upcoming">Upcoming</option>
                <option value="registration">Registration</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div><label className="form-label">Start Date *</label><input name="start_date" type="date" className="form-input" required defaultValue={season?.start_date} /></div>
            <div><label className="form-label">End Date *</label><input name="end_date" type="date" className="form-input" required defaultValue={season?.end_date} /></div>
            <div><label className="form-label">Registration Deadline</label><input name="registration_deadline" type="date" className="form-input" defaultValue={season?.registration_deadline || ''} /></div>
            <div><label className="form-label">Matches/Fixture</label><input name="matches_per_fixture" type="number" className="form-input" defaultValue={season?.matches_per_fixture || 4} min={1} max={8} /></div>
            <div><label className="form-label">Sets/Match</label><input name="sets_per_match" type="number" className="form-input" defaultValue={season?.sets_per_match || 3} min={1} max={5} /></div>
            <div><label className="form-label">Games/Set</label><input name="games_per_set" type="number" className="form-input" defaultValue={season?.games_per_set || 6} min={1} max={10} /></div>
            <div className="col-span-2"><label className="form-label">Description</label><textarea name="description" className="form-input" rows={2} defaultValue={season?.description || ''} /></div>
            <div><label className="form-label">Sponsor Name</label><input name="sponsor_name" className="form-input" defaultValue={season?.sponsor_name || ''} /></div>
            <div><label className="form-label">Banner URL</label><input name="banner_url" className="form-input" defaultValue={season?.banner_url || ''} /></div>
            <div className="col-span-2"><label className="form-label">Sponsor Logo URL</label><input name="sponsor_logo_url" className="form-input" defaultValue={season?.sponsor_logo_url || ''} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : season ? 'Update Season' : 'Create Season'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
