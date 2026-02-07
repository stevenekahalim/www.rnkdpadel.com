'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateRegistrationStatus, updatePaymentStatus, updateAdminNotes } from './actions'

const PAYMENT_BADGE: Record<string, string> = { unpaid: 'badge-red', paid: 'badge-green', waived: 'badge-blue' }
const STATUS_BADGE: Record<string, string> = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red', withdrawn: 'badge-gray' }
const LIGA_LABELS: Record<string, string> = { liga1: 'Liga 1 Men', liga1_women: 'Liga 1 Women', liga2: 'Liga 2' }

export function RegistrationsClient({ seasons, registrations, selectedSeasonId }: {
  seasons: any[]; registrations: any[]; selectedSeasonId: string
}) {
  const router = useRouter()
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleStatusChange(id: string, status: 'approved' | 'rejected') {
    setLoading(id)
    await updateRegistrationStatus(id, status)
    setLoading(null)
  }

  async function handlePayment(id: string, current: string) {
    setLoading(id)
    const next = current === 'unpaid' ? 'paid' : current === 'paid' ? 'waived' : 'unpaid'
    await updatePaymentStatus(id, next as any)
    setLoading(null)
  }

  async function saveNotes(id: string) {
    await updateAdminNotes(id, notesValue)
    setEditingNotes(null)
  }

  return (
    <>
      {/* Season tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {seasons.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/admin/liga/registrations?seasonId=${s.id}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              s.id === selectedSeasonId ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s.name} <span className="text-xs opacity-70">({LIGA_LABELS[s.liga] || s.liga})</span>
          </button>
        ))}
        {seasons.length === 0 && <p className="text-gray-400">No active seasons</p>}
      </div>

      {/* Registrations table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Club</th><th>Captain</th><th>Status</th><th>Payment</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.map((reg) => {
                const club = reg.organizations
                const captain = club?.users
                return (
                  <tr key={reg.id}>
                    <td className="font-medium">{club?.name || '—'}</td>
                    <td>
                      <div className="text-sm">{captain?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{captain?.phone || captain?.email || ''}</div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[reg.status] || 'badge-gray'}`}>{reg.status}</span></td>
                    <td>
                      <button onClick={() => handlePayment(reg.id, reg.payment_status)} className={`badge ${PAYMENT_BADGE[reg.payment_status] || 'badge-gray'} cursor-pointer hover:opacity-80`}>
                        {reg.payment_status} ↻
                      </button>
                    </td>
                    <td className="max-w-48">
                      {editingNotes === reg.id ? (
                        <div className="flex gap-1">
                          <input className="form-input text-xs" value={notesValue} onChange={(e) => setNotesValue(e.target.value)} />
                          <button onClick={() => saveNotes(reg.id)} className="btn-primary btn-sm">Save</button>
                          <button onClick={() => setEditingNotes(null)} className="btn-secondary btn-sm">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingNotes(reg.id); setNotesValue(reg.admin_notes || '') }} className="text-xs text-gray-400 hover:text-gray-600 truncate block max-w-48">
                          {reg.admin_notes || '+ Add notes'}
                        </button>
                      )}
                    </td>
                    <td>
                      {reg.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusChange(reg.id, 'approved')} disabled={loading === reg.id} className="btn-success btn-sm">
                            {loading === reg.id ? '...' : 'Approve'}
                          </button>
                          <button onClick={() => handleStatusChange(reg.id, 'rejected')} disabled={loading === reg.id} className="btn-danger btn-sm">Reject</button>
                        </div>
                      )}
                      {reg.status !== 'pending' && <span className="text-xs text-gray-400">—</span>}
                    </td>
                  </tr>
                )
              })}
              {registrations.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">No registrations for this season</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
