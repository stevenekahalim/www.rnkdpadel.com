'use client'

import { useState } from 'react'
import { voidMatch } from './actions'

interface VoidModalProps {
  matchId: string
  adminId: string
  onClose: () => void
}

export function VoidModal({ matchId, adminId, onClose }: VoidModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      setError('Please provide a reason for voiding this match')
      return
    }

    if (!adminId) {
      setError('Unable to determine admin ID. Please refresh and try again.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await voidMatch(matchId, reason, adminId)

      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to void match')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="card-header border-b">
          <h2 className="text-lg font-semibold text-gray-900">Void Match</h2>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Voiding a match is irreversible. This will:
            </p>
            <ul className="text-sm text-red-800 mt-2 ml-4 list-disc">
              <li>Void the match and mark it as VOIDED</li>
              <li>Reverse all MMR changes for all players</li>
              <li>Create an audit log entry</li>
            </ul>
          </div>

          <div>
            <label htmlFor="reason" className="form-label">
              Reason for Voiding <span className="text-red-600">*</span>
            </label>
            <textarea
              id="reason"
              className="form-input resize-none"
              rows={4}
              placeholder="Enter reason for voiding this match..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Voiding...' : 'Void Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
