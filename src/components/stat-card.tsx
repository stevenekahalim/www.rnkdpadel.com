export function StatCard({ label, value, icon, description }: {
  label: string
  value: string | number
  icon?: string
  description?: string
}) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  )
}
