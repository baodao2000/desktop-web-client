import React, { useEffect, useState } from 'react'
import { API_BASE_URL, checkServerHealth } from '../api/client'
import { Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export const ApiStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<{
    online: boolean
    message: string
    latency?: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const verifyHealth = async () => {
    setLoading(true)
    const result = await checkServerHealth()
    setStatus(result)
    setLoading(false)
  }

  useEffect(() => {
    verifyHealth()
    // Poll status every 30 seconds
    const interval = setInterval(verifyHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="status-badge-container">
      <div className="status-header">
        <div className="flex-row items-center gap-2">
          <Activity size={18} className="text-muted" />
          <span className="font-semibold text-sm">Express + PostgreSQL Status</span>
        </div>
        <button
          className="refresh-btn"
          onClick={verifyHealth}
          disabled={loading}
          title="Kiểm tra lại kết nối"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Đang kiểm tra...' : 'Kiểm tra'}</span>
        </button>
      </div>

      <div className="status-details">
        <div className="flex-row items-center gap-2">
          {status?.online ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <XCircle size={18} className="text-danger" />
          )}
          <span className={status?.online ? 'badge-success' : 'badge-danger'}>
            {status?.online ? 'Connected' : 'Offline / Unreachable'}
          </span>
          {status?.latency !== undefined && (
            <span className="text-xs text-muted">({status.latency}ms)</span>
          )}
        </div>
        <p className="text-xs text-muted url-text">
          Target: <code>{API_BASE_URL}</code>
        </p>
        <p className="text-xs status-message">{status?.message}</p>
      </div>
    </div>
  )
}
