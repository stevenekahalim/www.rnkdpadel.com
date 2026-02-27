const BADGE_VARIANTS: Record<string, string> = {
  // Season statuses
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  registration: 'bg-purple-50 text-purple-700 border-purple-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-50 text-gray-600 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',

  // Registration statuses
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',

  // Payment statuses
  paid: 'bg-green-50 text-green-700 border-green-200',
  unpaid: 'bg-red-50 text-red-700 border-red-200',
  waived: 'bg-blue-50 text-blue-700 border-blue-200',

  // Match statuses
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  DISPUTED: 'bg-orange-50 text-orange-700 border-orange-200',
  VOIDED: 'bg-red-50 text-red-700 border-red-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',

  // Tournament statuses
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  group_stage: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  knockout: 'bg-orange-50 text-orange-700 border-orange-200',

  // Achievement positions
  CHAMPION: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  RUNNER_UP: 'bg-gray-100 text-gray-700 border-gray-300',
  THIRD: 'bg-orange-50 text-orange-700 border-orange-200',

  // Boolean
  yes: 'bg-green-50 text-green-700 border-green-200',
  no: 'bg-gray-50 text-gray-500 border-gray-200',

  // Default
  default: 'bg-gray-50 text-gray-600 border-gray-200',
}

const LABELS: Record<string, string> = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  DISPUTED: 'Disputed',
  VOIDED: 'Voided',
  COMPLETED: 'Completed',
  CHAMPION: '🏆 Champion',
  RUNNER_UP: '🥈 Runner Up',
  THIRD: '🥉 Third',
  SEMIFINAL: 'Semifinal',
  QUARTERFINAL: 'Quarterfinal',
  ROUND_16: 'Round of 16',
  ROUND_32: 'Round of 32',
  GROUP_STAGE: 'Group Stage',
  PARTICIPANT: 'Participant',
  group_knockout: 'Group + KO',
  knockout_only: 'Knockout',
  group_stage: 'Group Stage',
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const variant = BADGE_VARIANTS[status] || BADGE_VARIANTS.default
  const displayLabel =
    label || LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variant}`}
    >
      {displayLabel}
    </span>
  )
}
