'use client'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  screen: string | null
  created_at: string
}

export function NotificationsClient({
  recentNotifications,
  stats,
}: {
  recentNotifications: Notification[]
  stats: { totalUsers: number; activePushTokens: number; ligaPlayers: number }
}) {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="card-body">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Active Push Devices
            </p>
            <p className="text-2xl font-bold mt-1">{stats.activePushTokens.toLocaleString()}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Liga Players
            </p>
            <p className="text-2xl font-bold mt-1">{stats.ligaPlayers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Notifications Log */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="font-semibold">Recent Admin Notifications</h3>
        </div>
        {recentNotifications.length === 0 ? (
          <div className="card-body text-center py-12">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-500 font-medium">No notifications sent yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Notifications sent from the admin panel will appear here
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Body</th>
                <th>Screen</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {recentNotifications.map((n) => (
                <tr key={n.id}>
                  <td className="font-medium">{n.title}</td>
                  <td className="text-gray-500 text-xs max-w-xs truncate">{n.body}</td>
                  <td className="text-xs text-gray-400">
                    {n.screen || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
