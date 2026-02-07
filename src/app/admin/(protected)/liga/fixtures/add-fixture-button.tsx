'use client'

import { useState } from 'react'
import { FixtureForm } from './fixture-form'

interface AddFixtureButtonProps {
  seasonId: string
  gameweek: number
  clubs: { id: string; name: string }[]
}

export function AddFixtureButton({ seasonId, gameweek, clubs }: AddFixtureButtonProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="btn btn-primary btn-sm"
      >
        + Add Fixture
      </button>

      {showForm && (
        <FixtureForm
          seasonId={seasonId}
          gameweek={gameweek}
          clubs={clubs}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
